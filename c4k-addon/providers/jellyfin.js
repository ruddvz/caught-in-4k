'use strict';

const crypto = require('crypto');
const { createSignedRelayUrl, parseServiceUrl, resolveRelayTtlSeconds } = require('../mediaRelay');

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

const libraryIndexCache = new Map();

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

const getJellyfinBaseUrl = (env) => parseServiceUrl(env.C4K_JELLYFIN_URL, {
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

const authHeaders = (token) => ({
    Accept: 'application/json',
    'User-Agent': 'CaughtIn4K/0.1',
    'X-Emby-Token': token,
});

const fetchJson = async (url, { token, timeoutMs, fetchImpl }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const response = await fetchImpl(url, {
            method: 'GET',
            headers: authHeaders(token),
            signal: controller.signal,
        });
        if (!response.ok) {
            throw new Error(`Jellyfin returned HTTP ${response.status}`);
        }
        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
};

const getProviderId = (item, providerName) => {
    const providerIds = item && item.ProviderIds;
    if (!providerIds || typeof providerIds !== 'object') return null;
    const wanted = String(providerName || '').toLowerCase();
    const key = Object.keys(providerIds).find((entry) => entry.toLowerCase() === wanted);
    const value = key ? providerIds[key] : null;
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
};

const cacheKeyFor = ({ baseUrl, token, userId }) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex').slice(0, 12);
    return `${baseUrl.toString()}|${userId || ''}|${tokenHash}`;
};

const buildLibraryIndex = async ({ env, fetchImpl, forceRefresh = false }) => {
    const baseUrl = getJellyfinBaseUrl(env);
    const token = String(env.C4K_JELLYFIN_TOKEN || '').trim();
    const userId = String(env.C4K_JELLYFIN_USER_ID || '').trim();
    if (!baseUrl || !token) return new Map();

    const cacheMs = boundedInteger(env.C4K_JELLYFIN_CACHE_MS, DEFAULT_CACHE_MS, {
        min: 0,
        max: 24 * 60 * 60 * 1000,
    });
    const key = cacheKeyFor({ baseUrl, token, userId });
    const cached = libraryIndexCache.get(key);
    if (!forceRefresh && cached && cacheMs > 0 && Date.now() - cached.createdAt < cacheMs) {
        return cached.itemsByImdbId;
    }

    const pageSize = boundedInteger(env.C4K_JELLYFIN_PAGE_SIZE, DEFAULT_PAGE_SIZE, {
        min: 25,
        max: MAX_PAGE_SIZE,
    });
    const scanMaxItems = boundedInteger(env.C4K_JELLYFIN_SCAN_MAX_ITEMS, DEFAULT_SCAN_MAX_ITEMS, {
        min: pageSize,
        max: HARD_SCAN_MAX_ITEMS,
    });
    const timeoutMs = boundedInteger(env.C4K_JELLYFIN_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, {
        min: 1000,
        max: 30000,
    });
    const itemsByImdbId = new Map();
    let startIndex = 0;

    while (startIndex < scanMaxItems) {
        const requestUrl = appendPath(baseUrl, '/Items');
        requestUrl.searchParams.set('Recursive', 'true');
        requestUrl.searchParams.set('IncludeItemTypes', 'Movie');
        requestUrl.searchParams.set('Fields', 'ProviderIds');
        requestUrl.searchParams.set('HasImdbId', 'true');
        requestUrl.searchParams.set('EnableImages', 'false');
        requestUrl.searchParams.set('EnableUserData', 'false');
        requestUrl.searchParams.set('EnableTotalRecordCount', 'true');
        requestUrl.searchParams.set('StartIndex', String(startIndex));
        requestUrl.searchParams.set('Limit', String(Math.min(pageSize, scanMaxItems - startIndex)));
        if (userId) requestUrl.searchParams.set('UserId', userId);

        const payload = await fetchJson(requestUrl, { token, timeoutMs, fetchImpl });
        const items = Array.isArray(payload?.Items) ? payload.Items : [];

        items.forEach((item) => {
            const imdbId = getProviderId(item, 'Imdb');
            if (imdbId && /^tt\d+$/i.test(imdbId)) {
                itemsByImdbId.set(imdbId.toLowerCase(), item);
            }
        });

        startIndex += items.length;
        const totalRecordCount = Number(payload?.TotalRecordCount);
        if (items.length === 0 || items.length < pageSize) break;
        if (Number.isFinite(totalRecordCount) && startIndex >= totalRecordCount) break;
    }

    if (cacheMs > 0) {
        libraryIndexCache.set(key, { createdAt: Date.now(), itemsByImdbId });
    }
    return itemsByImdbId;
};

const parseC4kTags = (tags) => {
    const result = { presentations: [], source: null };
    (Array.isArray(tags) ? tags : []).forEach((rawTag) => {
        const tag = String(rawTag || '').trim();
        const match = /^c4k:(source|presentation)\s*(?:=|:)\s*(.+)$/i.exec(tag);
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
    if (codec === 'hevc' || codec === 'h265' || codec === 'x265') return 'hevc';
    if (codec === 'h264' || codec === 'avc' || codec === 'x264') return 'h264';
    if (codec === 'av1') return 'av1';
    return codec || undefined;
};

const mapHdr = (videoStream) => {
    if (!videoStream) return [];
    const rangeType = String(videoStream.VideoRangeType || videoStream.VideoRange || '').toUpperCase();
    const result = [];
    const hasDolbyVisionProfile = videoStream.DvProfile !== null
        && videoStream.DvProfile !== undefined
        && Number.isFinite(Number(videoStream.DvProfile));

    if (rangeType.startsWith('DOVI') || hasDolbyVisionProfile) {
        result.push('dolby-vision');
    }
    if (rangeType.includes('HDR10PLUS') || videoStream.Hdr10PlusPresentFlag === true) result.push('hdr10-plus');
    if (rangeType.includes('HDR10') && !rangeType.includes('HDR10PLUS')) result.push('hdr10');
    if (rangeType.includes('HLG')) result.push('hlg');
    if (rangeType === 'SDR') result.push('sdr');

    return [...new Set(result)];
};

const mapAudioToken = (audioStream) => {
    const codec = normaliseToken(audioStream?.Codec);
    const profile = String(audioStream?.Profile || '').toLowerCase();
    const spatial = String(audioStream?.AudioSpatialFormat || '').toUpperCase();

    if (spatial === 'DTSX') return 'dts-x';
    if (spatial === 'DOLBYATMOS' && codec === 'truehd') return 'truehd-atmos';
    if (spatial === 'DOLBYATMOS' && ['eac3', 'e-ac-3', 'ec-3'].includes(codec)) return 'eac3-atmos';
    if (codec === 'truehd') return 'truehd';
    if (codec === 'dts' && (profile.includes('ma') || profile.includes('master audio'))) return 'dts-hd-ma';
    if (codec === 'dts') return 'dts';
    if (['eac3', 'e-ac-3', 'ec-3'].includes(codec)) return 'eac3';
    if (['ac3', 'ac-3'].includes(codec)) return 'ac3';
    if (codec === 'aac') return 'aac';
    return null;
};

const mapAudio = (mediaStreams) => [...new Set(
    (Array.isArray(mediaStreams) ? mediaStreams : [])
        .filter((stream) => String(stream?.Type || '').toLowerCase() === 'audio')
        .map(mapAudioToken)
        .filter(Boolean),
)];

const mapThreeD = (value) => {
    const token = String(value || '').toLowerCase();
    if (token === 'mvc') return 'mvc';
    if (token === 'fullsidebyside') return 'full-sbs';
    if (token === 'halfsidebyside') return 'half-sbs';
    if (token === 'fulltopandbottom') return 'top-bottom';
    if (token === 'halftopandbottom') return 'top-bottom';
    return undefined;
};

const inferResolution = (videoStream) => {
    const width = Number(videoStream?.Width) || 0;
    const height = Number(videoStream?.Height) || 0;
    if (width >= 3840 || height >= 2160) return 2160;
    if (width >= 2560 || height >= 1440) return 1440;
    if (width >= 1920 || height >= 1080) return 1080;
    if (width >= 1280 || height >= 720) return 720;
    return height || undefined;
};

const leafFilename = (value, fallback) => {
    const filename = String(value || '').split(/[\\/]/).pop();
    return filename || fallback;
};

const isWebReady = ({ container, videoCodec }) => {
    const normalisedContainer = normaliseToken(container);
    if (!['mp4', 'm4v', 'webm'].includes(normalisedContainer)) return false;
    return ['h264', 'av1'].includes(videoCodec);
};

const mediaSourceToCandidate = ({ item, mediaSource, env }) => {
    const mediaStreams = Array.isArray(mediaSource?.MediaStreams) ? mediaSource.MediaStreams : [];
    const videoStream = mediaStreams.find((stream) => String(stream?.Type || '').toLowerCase() === 'video');
    const itemId = item?.Id;
    const mediaSourceId = mediaSource?.Id;
    if (!itemId || !mediaSourceId || !videoStream) return null;

    const allowLocalHttp = env.NODE_ENV !== 'production';
    const publicBaseUrl = env.C4K_ADDON_PUBLIC_URL || (allowLocalHttp
        ? `http://localhost:${Number(env.C4K_ADDON_PORT) || 7000}`
        : '');
    const relayUrl = createSignedRelayUrl({
        publicBaseUrl,
        secret: env.C4K_MEDIA_RELAY_SECRET,
        itemId,
        mediaSourceId,
        ttlSeconds: resolveRelayTtlSeconds(env.C4K_MEDIA_RELAY_TTL_SECONDS),
        allowLocalHttp,
    });
    if (!relayUrl) return null;

    const tags = parseC4kTags(item.Tags);
    const videoCodec = mapVideoCodec(videoStream.Codec);
    const bitrate = Number(mediaSource.Bitrate) || Number(videoStream.BitRate) || 0;
    const container = mediaSource.Container;

    return {
        url: relayUrl,
        filename: leafFilename(mediaSource.Path, `${item.Name || 'movie'}.${container || 'mkv'}`),
        source: tags.source || 'direct-stream',
        resolution: inferResolution(videoStream),
        videoCodec,
        bitDepth: Number(videoStream.BitDepth) || undefined,
        hdr: mapHdr(videoStream),
        presentation: tags.presentations,
        audio: mapAudio(mediaStreams),
        threeD: mapThreeD(mediaSource.Video3DFormat || item.Video3DFormat),
        bitrateMbps: bitrate > 0 ? bitrate / 1000000 : undefined,
        sizeBytes: Number(mediaSource.Size) || undefined,
        verified: Boolean(videoStream.Codec && (videoStream.Width || videoStream.Height)),
        webReady: isWebReady({ container, videoCodec }),
    };
};

const loadJellyfinCandidates = async ({ type, id, env = process.env, fetchImpl = fetch } = {}) => {
    if (type !== 'movie' || !/^tt\d+$/i.test(String(id || ''))) return [];

    const baseUrl = getJellyfinBaseUrl(env);
    const token = String(env.C4K_JELLYFIN_TOKEN || '').trim();
    if (!baseUrl || !token || !env.C4K_MEDIA_RELAY_SECRET) return [];

    const itemsByImdbId = await buildLibraryIndex({ env, fetchImpl });
    const indexedItem = itemsByImdbId.get(String(id).toLowerCase());
    if (!indexedItem?.Id) return [];

    const timeoutMs = boundedInteger(env.C4K_JELLYFIN_TIMEOUT_MS, DEFAULT_TIMEOUT_MS, {
        min: 1000,
        max: 30000,
    });
    const userId = String(env.C4K_JELLYFIN_USER_ID || '').trim();

    const itemDetailsUrl = appendPath(baseUrl, `/Items/${encodeURIComponent(indexedItem.Id)}`);
    if (userId) itemDetailsUrl.searchParams.set('UserId', userId);
    const itemDetails = await fetchJson(itemDetailsUrl, { token, timeoutMs, fetchImpl });
    const item = {
        ...indexedItem,
        ...(itemDetails && typeof itemDetails === 'object' ? itemDetails : {}),
    };

    const playbackUrl = appendPath(baseUrl, `/Items/${encodeURIComponent(indexedItem.Id)}/PlaybackInfo`);
    if (userId) playbackUrl.searchParams.set('UserId', userId);
    const playbackInfo = await fetchJson(playbackUrl, { token, timeoutMs, fetchImpl });
    const mediaSources = Array.isArray(playbackInfo?.MediaSources) ? playbackInfo.MediaSources : [];

    return mediaSources
        .map((mediaSource) => mediaSourceToCandidate({ item, mediaSource, env }))
        .filter(Boolean);
};

const resetJellyfinCache = () => libraryIndexCache.clear();

module.exports = {
    buildLibraryIndex,
    getProviderId,
    inferResolution,
    loadJellyfinCandidates,
    mapAudio,
    mapHdr,
    mapThreeD,
    mediaSourceToCandidate,
    parseC4kTags,
    resetJellyfinCache,
};
