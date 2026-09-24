'use strict';

const crypto = require('crypto');
const { parseServiceUrl, resolveRelayTtlSeconds } = require('../mediaRelay');
const { createSignedPlexRelayUrl } = require('../plexRelay');

const DEFAULT_CACHE_MS = 5 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 200;
const DEFAULT_SCAN_MAX_ITEMS = 20000;
const MAX_PAGE_SIZE = 500;
const HARD_SCAN_MAX_ITEMS = 50000;
const DEFAULT_TIMEOUT_MS = 8000;

const SOURCE_TOKENS = new Set([
    'uhd-bluray-remux',
    'uhd-bluray-encode',
    'bluray-remux',
    'web-dl',
    'bluray-encode',
    'web-rip',
    'direct-stream',
    'unknown',
]);

const PRESENTATION_TOKENS = new Set([
    'imax-1.90',
    'imax-1.43',
    'imax-variable',
    'imax-enhanced',
]);

const plexLibraryCache = new Map();

const normaliseToken = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');

const boundedInteger = (value, fallback, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(parsed)));
};

const getPlexBaseUrl = (env) => parseServiceUrl(env.C4K_PLEX_URL, {
    allowLocalHttp: env.NODE_ENV !== 'production',
});

const appendPath = (baseUrl, pathname) => {
    const url = new URL(baseUrl.toString());
    const basePath = url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '');
    const suffix = pathname.startsWith('/') ? pathname : `/${pathname}`;
    url.pathname = `${basePath}${suffix}`;
    url.search = '';
    return url;
};

const plexHeaders = (env, extra = {}) => ({
    Accept: 'application/json',
    'User-Agent': 'CaughtIn4K/0.1',
    'X-Plex-Client-Identifier': env.C4K_PLEX_CLIENT_ID || 'c4k-stremio-addon',
    'X-Plex-Product': 'Caught in 4K',
    'X-Plex-Token': String(env.C4K_PLEX_TOKEN || '').trim(),
    ...extra,
});

const fetchPlexJson = async (url, { env, timeoutMs, fetchImpl, headers = {} }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetchImpl(url, {
            method: 'GET',
            headers: plexHeaders(env, headers),
            signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Plex returned HTTP ${response.status}`);
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
};

const extractImdbId = (item) => {
    const guids = Array.isArray(item?.Guid) ? item.Guid : [];
    const match = guids
        .map((entry) => String(entry?.id || ''))
        .find((guid) => /^imdb:\/\/tt\d+$/i.test(guid));
    if (match) return match.slice('imdb://'.length).toLowerCase();

    const directGuid = String(item?.guid || '');
    return /^imdb:\/\/tt\d+$/i.test(directGuid)
        ? directGuid.slice('imdb://'.length).toLowerCase()
        : null;
};

const cacheKeyFor = ({ baseUrl, token }) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex').slice(0, 12);
    return `${baseUrl.toString()}|${tokenHash}`;
};

const buildPlexLibraryIndex = async ({ env, fetchImpl, forceRefresh = false }) => {
    const baseUrl = getPlexBaseUrl(env);
    const token = String(env.C4K_PLEX_TOKEN || '').trim();
    if (!baseUrl || !token) return new Map();

    const cacheMs = boundedInteger(env.C4K_PLEX_CACHE_MS, DEFAULT_CACHE_MS, {
        min: 0,
        max: 24 * 60 * 60 * 1000,
    });
    const key = cacheKeyFor({ baseUrl, token });
    const cached = plexLibraryCache.get(key);
    if (!forceRefresh && cached && cacheMs > 0 && Date.now() - cached.createdAt < cacheMs) {
        return cached.itemsByImdbId;
    }

    const pageSize = boundedInteger(env.C4K_PLEX_PAGE_SIZE, DEFAULT_PAGE_SIZE, {
        min: 25,
        max: MAX_PAGE_SIZE,
    });
    const scanMaxItems = boundedInteger(env.C4K_PLEX_SCAN_MAX_ITEMS, DEFAULT_SCAN_MAX_ITEMS, {
        min: pageSize,
        max: HARD_SCAN_MAX_ITEMS,
    });
    const timeoutMs = boundedInteger(env.C4K_PLEX_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, {
        min: 1000,
        max: 30000,
    });
    const itemsByImdbId = new Map();
    let start = 0;

    while (start < scanMaxItems) {
        const url = appendPath(baseUrl, '/library/all');
        url.searchParams.set('type', '1');
        url.searchParams.set('includeFields', 'ratingKey,key,guid,title,type');
        url.searchParams.set('includeElements', 'Guid');
        const size = Math.min(pageSize, scanMaxItems - start);

        const payload = await fetchPlexJson(url, {
            env,
            timeoutMs,
            fetchImpl,
            headers: {
                'X-Plex-Container-Start': String(start),
                'X-Plex-Container-Size': String(size),
            },
        });
        const container = payload?.MediaContainer || {};
        const items = Array.isArray(container.Metadata) ? container.Metadata : [];

        items.forEach((item) => {
            const imdbId = extractImdbId(item);
            if (imdbId && item?.ratingKey) itemsByImdbId.set(imdbId, item);
        });

        start += items.length;
        const total = Number(container.totalSize);
        if (items.length === 0 || items.length < size) break;
        if (Number.isFinite(total) && start >= total) break;
    }

    if (cacheMs > 0) plexLibraryCache.set(key, { createdAt: Date.now(), itemsByImdbId });
    return itemsByImdbId;
};

const parseC4kLabels = (labels) => {
    const result = { presentations: [], source: null };
    (Array.isArray(labels) ? labels : []).forEach((entry) => {
        const label = String(entry?.tag || entry || '').trim();
        const match = /^c4k:(source|presentation)\s*(?:=|:)\s*(.+)$/i.exec(label);
        if (!match) return;

        const field = match[1].toLowerCase();
        const value = normaliseToken(match[2]);
        if (field === 'source' && SOURCE_TOKENS.has(value)) result.source = value;
        if (field === 'presentation' && PRESENTATION_TOKENS.has(value) && !result.presentations.includes(value)) {
            result.presentations.push(value);
        }
    });
    return result;
};

const mapVideoCodec = (value) => {
    const codec = normaliseToken(value);
    if (['hevc', 'h265', 'x265'].includes(codec)) return 'hevc';
    if (['h264', 'avc', 'x264'].includes(codec)) return 'h264';
    if (codec === 'av1') return 'av1';
    return codec || undefined;
};

const plexStreamText = (stream) => [stream?.displayTitle, stream?.extendedDisplayTitle, stream?.profile]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

const mapPlexHdr = (videoStream) => {
    const text = plexStreamText(videoStream);
    const result = [];
    if (text.includes('DOLBY VISION') || text.includes('DOVI')) result.push('dolby-vision');
    if (text.includes('HDR10+') || text.includes('HDR10 PLUS')) result.push('hdr10-plus');
    if (text.includes('HDR10') && !text.includes('HDR10+') && !text.includes('HDR10 PLUS')) result.push('hdr10');
    if (text.includes('HLG')) result.push('hlg');
    if (text.includes('SDR')) result.push('sdr');
    return [...new Set(result)];
};

const mapPlexAudioToken = (stream) => {
    const codec = normaliseToken(stream?.codec);
    const profile = String(stream?.profile || '').toLowerCase();
    const text = plexStreamText(stream);

    if (text.includes('DTS:X') || text.includes('DTS X')) return 'dts-x';
    if (codec === 'truehd' && text.includes('ATMOS')) return 'truehd-atmos';
    if (['eac3', 'e-ac-3', 'ec-3'].includes(codec) && text.includes('ATMOS')) return 'eac3-atmos';
    if (codec === 'truehd') return 'truehd';
    if (['dca', 'dts'].includes(codec) && (profile.includes('ma') || text.includes('DTS-HD MA'))) return 'dts-hd-ma';
    if (['dca', 'dts'].includes(codec)) return 'dts';
    if (['eac3', 'e-ac-3', 'ec-3'].includes(codec)) return 'eac3';
    if (['ac3', 'ac-3'].includes(codec)) return 'ac3';
    if (codec === 'aac') return 'aac';
    return null;
};

const mapPlexAudio = (streams) => [...new Set(
    (Array.isArray(streams) ? streams : [])
        .filter((stream) => Number(stream?.streamType) === 2)
        .map(mapPlexAudioToken)
        .filter(Boolean),
)];

const inferResolution = (media, videoStream) => {
    const width = Number(media?.width) || Number(videoStream?.width) || 0;
    const height = Number(media?.height) || Number(videoStream?.height) || 0;
    if (width >= 3840 || height >= 2160) return 2160;
    if (width >= 2560 || height >= 1440) return 1440;
    if (width >= 1920 || height >= 1080) return 1080;
    if (width >= 1280 || height >= 720) return 720;

    const named = Number(String(media?.videoResolution || '').replace(/[^0-9]/g, ''));
    return named || height || undefined;
};

const leafFilename = (value, fallback) => {
    const filename = String(value || '').split(/[\\/]/).pop();
    return filename || fallback;
};

const isWebReady = ({ container, videoCodec }) => {
    const token = normaliseToken(container);
    return ['mp4', 'm4v', 'webm'].includes(token) && ['h264', 'av1'].includes(videoCodec);
};

const mediaToCandidate = ({ item, media, env }) => {
    const parts = Array.isArray(media?.Part) ? media.Part : [];
    if (parts.length !== 1) return null;

    const part = parts[0];
    const partId = String(part?.id || '');
    const partKey = String(part?.key || '');
    const streams = Array.isArray(part?.Stream) ? part.Stream : [];
    const videoStream = streams.find((stream) => Number(stream?.streamType) === 1);
    if (!partId || !partKey || !videoStream) return null;

    const allowLocalHttp = env.NODE_ENV !== 'production';
    const publicBaseUrl = env.C4K_ADDON_PUBLIC_URL || (allowLocalHttp
        ? `http://localhost:${Number(env.C4K_ADDON_PORT) || 7000}`
        : '');
    const relayUrl = createSignedPlexRelayUrl({
        publicBaseUrl,
        secret: env.C4K_MEDIA_RELAY_SECRET,
        partId,
        partKey,
        ttlSeconds: resolveRelayTtlSeconds(env.C4K_MEDIA_RELAY_TTL_SECONDS),
        allowLocalHttp,
    });
    if (!relayUrl) return null;

    const labels = parseC4kLabels(item.Label);
    const videoCodec = mapVideoCodec(media.videoCodec || videoStream.codec);
    const bitrateKbps = Number(media.bitrate) || Number(videoStream.bitrate) || 0;
    const container = part.container || media.container;

    return {
        url: relayUrl,
        filename: leafFilename(part.file, `${item.title || 'movie'}.${container || 'mkv'}`),
        source: labels.source || 'direct-stream',
        resolution: inferResolution(media, videoStream),
        videoCodec,
        bitDepth: Number(videoStream.bitDepth) || undefined,
        hdr: mapPlexHdr(videoStream),
        presentation: labels.presentations,
        audio: mapPlexAudio(streams),
        bitrateMbps: bitrateKbps > 0 ? bitrateKbps / 1000 : undefined,
        sizeBytes: Number(part.size) || undefined,
        verified: Boolean(videoCodec && (media.width || media.height || videoStream.width || videoStream.height)),
        webReady: isWebReady({ container, videoCodec }),
    };
};

const loadPlexCandidates = async ({ type, id, env = process.env, fetchImpl = fetch } = {}) => {
    if (type !== 'movie' || !/^tt\d+$/i.test(String(id || ''))) return [];

    const baseUrl = getPlexBaseUrl(env);
    const token = String(env.C4K_PLEX_TOKEN || '').trim();
    if (!baseUrl || !token || !env.C4K_MEDIA_RELAY_SECRET) return [];

    const index = await buildPlexLibraryIndex({ env, fetchImpl });
    const indexedItem = index.get(String(id).toLowerCase());
    if (!indexedItem?.ratingKey) return [];

    const timeoutMs = boundedInteger(env.C4K_PLEX_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, {
        min: 1000,
        max: 30000,
    });
    const url = appendPath(baseUrl, `/library/metadata/${encodeURIComponent(indexedItem.ratingKey)}`);
    url.searchParams.set('includeElements', 'Guid,Media,Label');
    const payload = await fetchPlexJson(url, { env, timeoutMs, fetchImpl });
    const metadata = Array.isArray(payload?.MediaContainer?.Metadata)
        ? payload.MediaContainer.Metadata[0]
        : null;
    if (!metadata) return [];

    const item = { ...indexedItem, ...metadata };
    return (Array.isArray(item.Media) ? item.Media : [])
        .map((media) => mediaToCandidate({ item, media, env }))
        .filter(Boolean);
};

const resetPlexCache = () => plexLibraryCache.clear();

module.exports = {
    buildPlexLibraryIndex,
    extractImdbId,
    loadPlexCandidates,
    mapPlexAudio,
    mapPlexHdr,
    mediaToCandidate,
    parseC4kLabels,
    resetPlexCache,
};
