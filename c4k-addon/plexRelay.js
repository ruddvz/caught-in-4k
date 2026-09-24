'use strict';

const crypto = require('crypto');
const { Readable } = require('stream');
const { parseServiceUrl, resolveRelayTtlSeconds } = require('./mediaRelay');

const MAX_RELAY_TTL_SECONDS = 24 * 60 * 60;

const plexRelayPayload = ({ partId, partKey, expires }) => [partId, partKey, expires].join('\n');

const createPlexRelaySignature = ({ secret, partId, partKey, expires }) => crypto
    .createHmac('sha256', secret)
    .update(plexRelayPayload({ partId, partKey, expires }))
    .digest('base64url');

const decodeForValidation = (value) => {
    let decoded = value;
    for (let index = 0; index < 2; index += 1) {
        try {
            const next = decodeURIComponent(decoded);
            if (next === decoded) break;
            decoded = next;
        } catch (_error) {
            return null;
        }
    }
    return decoded;
};

const isValidPartKey = ({ partId, partKey }) => {
    if (!/^\d+$/.test(String(partId || ''))) return false;
    if (typeof partKey !== 'string' || partKey.length === 0) return false;
    if (partKey.includes('?') || partKey.includes('#') || partKey.includes('\\') || partKey.includes('\0')) return false;

    const decoded = decodeForValidation(partKey);
    if (!decoded || decoded.includes('?') || decoded.includes('#') || decoded.includes('\\') || decoded.includes('\0')) return false;

    const prefix = `/library/parts/${partId}/`;
    if (!decoded.startsWith(prefix) || decoded.length <= prefix.length) return false;

    const pathSegments = decoded.split('/');
    return !pathSegments.some((segment) => segment === '.' || segment === '..');
};

const verifyPlexRelaySignature = ({
    secret,
    partId,
    partKey,
    expires,
    signature,
    now = Date.now(),
}) => {
    const expiry = Number(expires);
    if (!secret || !signature || !isValidPartKey({ partId, partKey }) || !Number.isSafeInteger(expiry)) return false;

    const nowSeconds = Math.floor(now / 1000);
    if (expiry <= nowSeconds || expiry > nowSeconds + MAX_RELAY_TTL_SECONDS) return false;

    const expected = createPlexRelaySignature({ secret, partId, partKey, expires: expiry });
    const left = Buffer.from(expected);
    const right = Buffer.from(String(signature));
    return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const createSignedPlexRelayUrl = ({
    publicBaseUrl,
    secret,
    partId,
    partKey,
    ttlSeconds,
    now = Date.now(),
    allowLocalHttp = false,
}) => {
    const baseUrl = parseServiceUrl(publicBaseUrl, { allowLocalHttp });
    if (!baseUrl || !secret || !isValidPartKey({ partId, partKey })) return null;

    const expires = Math.floor(now / 1000) + resolveRelayTtlSeconds(ttlSeconds);
    const signature = createPlexRelaySignature({ secret, partId, partKey, expires });
    const basePath = baseUrl.pathname === '/' ? '' : baseUrl.pathname.replace(/\/+$/, '');

    baseUrl.pathname = `${basePath}/media/plex/${encodeURIComponent(partId)}`;
    baseUrl.search = '';
    baseUrl.searchParams.set('key', Buffer.from(partKey).toString('base64url'));
    baseUrl.searchParams.set('expires', String(expires));
    baseUrl.searchParams.set('signature', signature);
    return baseUrl.toString();
};

const decodePartKey = (value) => {
    try {
        return Buffer.from(String(value || ''), 'base64url').toString('utf8');
    } catch (_error) {
        return '';
    }
};

const buildPlexPartUrl = ({ plexBaseUrl, partId, partKey, allowLocalHttp = false }) => {
    const baseUrl = parseServiceUrl(plexBaseUrl, { allowLocalHttp });
    if (!baseUrl || !isValidPartKey({ partId, partKey })) return null;

    const basePath = baseUrl.pathname === '/' ? '' : baseUrl.pathname.replace(/\/+$/, '');
    baseUrl.pathname = `${basePath}${partKey}`;
    baseUrl.search = '';
    return baseUrl;
};

const copyUpstreamHeader = (upstream, res, name) => {
    const value = upstream.headers.get(name);
    if (value) res.set(name, value);
};

const createPlexRelayHandler = ({ env = process.env, fetchImpl = fetch } = {}) => async (req, res) => {
    const allowLocalHttp = env.NODE_ENV !== 'production';
    const token = String(env.C4K_PLEX_TOKEN || '').trim();
    const secret = env.C4K_MEDIA_RELAY_SECRET;
    const partId = String(req.params.partId || '');
    const partKey = decodePartKey(req.query.key);
    const { expires, signature } = req.query;

    if (!token || !verifyPlexRelaySignature({ secret, partId, partKey, expires, signature })) {
        return res.status(403).json({ error: 'Invalid or expired Plex media relay URL.' });
    }

    const upstreamUrl = buildPlexPartUrl({
        plexBaseUrl: env.C4K_PLEX_URL,
        partId,
        partKey,
        allowLocalHttp,
    });
    if (!upstreamUrl) {
        return res.status(503).json({ error: 'Plex media relay is not configured.' });
    }

    const controller = new AbortController();
    const abort = () => {
        if (!controller.signal.aborted) controller.abort();
    };
    const cleanup = () => {
        req.removeListener('aborted', abort);
        res.removeListener('finish', onFinish);
        res.removeListener('close', onClose);
    };
    const onFinish = () => cleanup();
    const onClose = () => {
        abort();
        cleanup();
    };

    req.once('aborted', abort);
    res.once('finish', onFinish);
    res.once('close', onClose);

    const headers = {
        Accept: req.headers.accept || '*/*',
        'User-Agent': 'CaughtIn4K/0.1',
        'X-Plex-Client-Identifier': env.C4K_PLEX_CLIENT_ID || 'c4k-stremio-addon',
        'X-Plex-Product': 'Caught in 4K',
        'X-Plex-Token': token,
    };
    if (req.headers.range) headers.Range = req.headers.range;
    if (req.headers['if-range']) headers['If-Range'] = req.headers['if-range'];
    if (req.headers['if-none-match']) headers['If-None-Match'] = req.headers['if-none-match'];
    if (req.headers['if-modified-since']) headers['If-Modified-Since'] = req.headers['if-modified-since'];

    try {
        const upstream = await fetchImpl(upstreamUrl, {
            method: req.method === 'HEAD' ? 'HEAD' : 'GET',
            headers,
            redirect: 'manual',
            signal: controller.signal,
        });

        res.status(upstream.status);
        [
            'accept-ranges',
            'cache-control',
            'content-length',
            'content-range',
            'content-type',
            'etag',
            'last-modified',
        ].forEach((headerName) => copyUpstreamHeader(upstream, res, headerName));

        if (req.method === 'HEAD' || !upstream.body) return res.end();

        const stream = Readable.fromWeb(upstream.body);
        stream.once('error', (error) => {
            cleanup();
            if (!res.destroyed) res.destroy(error);
        });
        return stream.pipe(res);
    } catch (error) {
        cleanup();
        if (error.name === 'AbortError') return undefined;
        console.error('[C4K Addon] Plex relay failed:', error.message);
        if (!res.headersSent) return res.status(502).json({ error: 'Unable to read media from Plex.' });
        return res.end();
    }
};

module.exports = {
    buildPlexPartUrl,
    createPlexRelayHandler,
    createPlexRelaySignature,
    createSignedPlexRelayUrl,
    decodePartKey,
    isValidPartKey,
    verifyPlexRelaySignature,
};
