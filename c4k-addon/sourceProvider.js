'use strict';

const { loadJellyfinCandidates } = require('./providers/jellyfin');
const { loadPlexCandidates } = require('./providers/plex');

const DEFAULT_TIMEOUT_MS = 8000;
const MAX_CANDIDATES = 50;
const SUPPORTED_SOURCE_PROVIDERS = new Set(['index', 'jellyfin', 'plex']);

const parseCsv = (value) => String(value || '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

const isLocalHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const parseHttpUrl = (value, { allowLocalHttp = false } = {}) => {
    try {
        const parsed = new URL(value);
        if (parsed.protocol === 'https:') return parsed;
        if (allowLocalHttp && parsed.protocol === 'http:' && isLocalHost(parsed.hostname)) return parsed;
        return null;
    } catch (_error) {
        return null;
    }
};

const isAllowedMediaUrl = (value, allowedHosts, options = {}) => {
    const parsed = parseHttpUrl(value, options);
    if (!parsed) return false;

    const host = parsed.hostname.toLowerCase();
    return allowedHosts.includes(host);
};

const sanitiseCandidate = (candidate, allowedHosts, options = {}) => {
    if (!candidate || typeof candidate !== 'object') return null;
    if (!isAllowedMediaUrl(candidate.url, allowedHosts, options)) return null;

    return {
        url: candidate.url,
        filename: typeof candidate.filename === 'string' ? candidate.filename : undefined,
        source: candidate.source,
        resolution: candidate.resolution,
        videoCodec: candidate.videoCodec,
        bitDepth: candidate.bitDepth,
        hdr: candidate.hdr,
        presentation: candidate.presentation,
        audio: candidate.audio,
        threeD: candidate.threeD,
        bitrateMbps: candidate.bitrateMbps,
        sizeBytes: candidate.sizeBytes,
        verified: candidate.verified === true,
        webReady: candidate.webReady !== false,
    };
};

const parseCandidatePayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.candidates)) return payload.candidates;
    if (Array.isArray(payload?.streams)) return payload.streams;
    return [];
};

const loadIndexCandidates = async ({ type, id, env = process.env, fetchImpl = fetch } = {}) => {
    const providerUrl = parseHttpUrl(env.C4K_SOURCE_INDEX_URL, {
        allowLocalHttp: env.NODE_ENV !== 'production',
    });
    const allowedHosts = parseCsv(env.C4K_ALLOWED_MEDIA_HOSTS);

    if (!providerUrl || allowedHosts.length === 0) {
        return [];
    }

    providerUrl.searchParams.set('type', type);
    providerUrl.searchParams.set('id', id);

    const controller = new AbortController();
    const timeoutMs = Math.max(1000, Number(env.C4K_SOURCE_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS);
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const headers = { Accept: 'application/json' };
    if (env.C4K_SOURCE_INDEX_TOKEN) {
        headers.Authorization = `Bearer ${env.C4K_SOURCE_INDEX_TOKEN}`;
    }

    try {
        const response = await fetchImpl(providerUrl, {
            method: 'GET',
            headers,
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`C4K source provider returned HTTP ${response.status}`);
        }

        const payload = await response.json();
        const allowLocalHttp = env.NODE_ENV !== 'production';

        return parseCandidatePayload(payload)
            .slice(0, MAX_CANDIDATES)
            .map((candidate) => sanitiseCandidate(candidate, allowedHosts, { allowLocalHttp }))
            .filter(Boolean);
    } finally {
        clearTimeout(timeout);
    }
};

const resolveSourceProvider = (value) => {
    const provider = String(value || 'index').trim().toLowerCase();
    return SUPPORTED_SOURCE_PROVIDERS.has(provider) ? provider : null;
};

const loadAuthorisedCandidates = async ({ type, id, env = process.env, fetchImpl = fetch } = {}) => {
    const provider = resolveSourceProvider(env.C4K_SOURCE_PROVIDER);
    if (provider === 'jellyfin') {
        return loadJellyfinCandidates({ type, id, env, fetchImpl });
    }
    if (provider === 'plex') {
        return loadPlexCandidates({ type, id, env, fetchImpl });
    }
    if (provider === 'index') {
        return loadIndexCandidates({ type, id, env, fetchImpl });
    }
    return [];
};

module.exports = {
    isAllowedMediaUrl,
    loadAuthorisedCandidates,
    loadIndexCandidates,
    parseCandidatePayload,
    resolveSourceProvider,
    sanitiseCandidate,
};
