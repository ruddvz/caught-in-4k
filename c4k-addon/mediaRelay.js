'use strict';

const crypto = require('crypto');
const { Readable } = require('stream');

const DEFAULT_RELAY_TTL_SECONDS = 6 * 60 * 60;
const MAX_RELAY_TTL_SECONDS = 24 * 60 * 60;

const isLocalHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const parseServiceUrl = (value, { allowLocalHttp = false } = {}) => {
    try {
        const parsed = new URL(String(value || '').trim());
        if (parsed.protocol === 'https:') return parsed;
        if (allowLocalHttp && parsed.protocol === 'http:' && isLocalHost(parsed.hostname)) return parsed;
        return null;
    } catch (_error) {
        return null;
    }
};

const relayPayload = ({ itemId, mediaSourceId, expires }) => [itemId, mediaSourceId, expires].join('\n');

const createRelaySignature = ({ secret, itemId, mediaSourceId, expires }) => crypto
    .createHmac('sha256', secret)
    .update(relayPayload({ itemId, mediaSourceId, expires }))
    .digest('base64url');

const verifyRelaySignature = ({ secret, itemId, mediaSourceId, expires, signature, now = Date.now() }) => {
    const expiry = Number(expires);
    if (!secret || !itemId || !mediaSourceId || !signature || !Number.isSafeInteger(expiry)) return false;

    const nowSeconds = Math.floor(now / 1000);
    if (expiry <= nowSeconds || expiry > nowSeconds + MAX_RELAY_TTL_SECONDS) return false;

    const expected = createRelaySignature({ secret, itemId, mediaSourceId, expires: expiry });
    const left = Buffer.from(expected);
    const right = Buffer.from(String(signature));

    return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const resolveRelayTtlSeconds = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_RELAY_TTL_SECONDS;
    return Math.min(MAX_RELAY_TTL_SECONDS, Math.floor(parsed));
};

const createSignedRelayUrl = ({
    publicBaseUrl,
    secret,
    itemId,
    mediaSourceId,
    ttlSeconds = DEFAULT_RELAY_TTL_SECONDS,
    now = Date.now(),
    allowLocalHttp = false,
}) => {
    const baseUrl = parseServiceUrl(publicBaseUrl, { allowLocalHttp });
    if (!baseUrl || !secret || !itemId || !mediaSourceId) return null;

    const expires = Math.floor(now / 1000) + resolveRelayTtlSeconds(ttlSeconds);
    const signature = createRelaySignature({ secret, itemId, mediaSourceId, expires });
    const basePath = baseUrl.pathname === '/' ? '' : baseUrl.pathname.replace(/\/+$/, '');

    baseUrl.pathname = `${basePath}/media/jellyfin/${encodeURIComponent(itemId)}/${encodeURIComponent(mediaSourceId)}`;
    baseUrl.search = '';
    baseUrl.searchParams.set('expires', String(expires));
    baseUrl.searchParams.set('signature', signature);

    return baseUrl.toString();
};

const buildJellyfinStreamUrl = ({ jellyfinBaseUrl, itemId, mediaSourceId, allowLocalHttp = false }) => {
    const baseUrl = parseServiceUrl(jellyfinBaseUrl, { allowLocalHttp });
    if (!baseUrl || !itemId || !mediaSourceId) return null;

    const basePath = baseUrl.pathname === '/' ? '' : baseUrl.pathname.replace(/\/+$/, '');
    baseUrl.pathname = `${basePath}/Videos/${encodeURIComponent(itemId)}/stream`;
    baseUrl.search = '';
    baseUrl.searchParams.set('Static', 'true');
    baseUrl.searchParams.set('MediaSourceId', mediaSourceId);
    return baseUrl;
};

const copyUpstreamHeader = (upstream, res, name) => {
    const value = upstream.headers.get(name);
    if (value) res.set(name, value);
};

const createJellyfinRelayHandler = ({ env = process.env, fetchImpl = fetch } = {}) => async (req, res) => {
    const allowLocalHttp = env.NODE_ENV !== 'production';
    const secret = env.C4K_MEDIA_RELAY_SECRET;
    const token = env.C4K_JELLYFIN_TOKEN;
    const { itemId, mediaSourceId } = req.params;
    const { expires, signature } = req.query;

    if (!token || !verifyRelaySignature({ secret, itemId, mediaSourceId, expires, signature })) {
        return res.status(403).json({ error: 'Invalid or expired media relay URL.' });
    }

    const upstreamUrl = buildJellyfinStreamUrl({
        jellyfinBaseUrl: env.C4K_JELLYFIN_URL,
        itemId,
        mediaSourceId,
        allowLocalHttp,
    });

    if (!upstreamUrl) {
        return res.status(503).json({ error: 'Jellyfin media relay is not configured.' });
    }

    const controller = new AbortController();
    const abort = () => controller.abort();
    req.once('aborted', abort);

    const headers = {
        Accept: req.headers.accept || '*/*',
        'User-Agent': 'CaughtIn4K/0.1',
        'X-Emby-Token': token,
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

        if (req.method === 'HEAD' || !upstream.body) {
            return res.end();
        }

        return Readable.fromWeb(upstream.body).pipe(res);
    } catch (error) {
        if (error.name === 'AbortError') return undefined;
        console.error('[C4K Addon] Jellyfin relay failed:', error.message);
        if (!res.headersSent) {
            return res.status(502).json({ error: 'Unable to read media from Jellyfin.' });
        }
        return res.end();
    } finally {
        req.removeListener('aborted', abort);
    }
};

module.exports = {
    DEFAULT_RELAY_TTL_SECONDS,
    buildJellyfinStreamUrl,
    createJellyfinRelayHandler,
    createRelaySignature,
    createSignedRelayUrl,
    parseServiceUrl,
    resolveRelayTtlSeconds,
    verifyRelaySignature,
};
