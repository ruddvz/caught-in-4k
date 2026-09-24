'use strict';

const {
    buildPlexPartUrl,
    createPlexRelaySignature,
    createSignedPlexRelayUrl,
    decodePartKey,
    isValidPartKey,
    verifyPlexRelaySignature,
} = require('../c4k-addon/plexRelay');
const {
    extractImdbId,
    loadPlexCandidates,
    mapPlexAudio,
    mapPlexHdr,
    parseC4kLabels,
    resetPlexCache,
} = require('../c4k-addon/providers/plex');
const { loadAuthorisedCandidates, resolveSourceProvider } = require('../c4k-addon/sourceProvider');

const baseEnv = {
    NODE_ENV: 'test',
    C4K_SOURCE_PROVIDER: 'plex',
    C4K_PLEX_URL: 'https://plex.example.test/base',
    C4K_PLEX_TOKEN: 'server-only-plex-token',
    C4K_PLEX_CLIENT_ID: 'c4k-test-client',
    C4K_PLEX_CACHE_MS: '0',
    C4K_ADDON_PUBLIC_URL: 'https://addon.example.test',
    C4K_MEDIA_RELAY_SECRET: 'relay-secret-value',
};

const indexedMovie = {
    ratingKey: '42',
    key: '/library/metadata/42',
    type: 'movie',
    title: 'Example Movie',
    Guid: [{ id: 'imdb://tt1234567' }],
};

const detailedMovie = {
    ...indexedMovie,
    Label: [
        { tag: 'c4k:source=uhd-bluray-remux' },
        { tag: 'c4k:presentation=imax-1.90' },
    ],
    Media: [
        {
            id: 900,
            bitrate: 72000,
            container: 'mkv',
            height: 1608,
            width: 3840,
            videoCodec: 'hevc',
            videoResolution: '4k',
            Part: [
                {
                    id: 1001,
                    key: '/library/parts/1001/123456789/file.mkv',
                    file: '/movies/Example Movie - UHD.mkv',
                    size: 70 * 1024 ** 3,
                    container: 'mkv',
                    Stream: [
                        {
                            streamType: 1,
                            codec: 'hevc',
                            bitDepth: 10,
                            width: 3840,
                            height: 1608,
                            displayTitle: '4K Dolby Vision/HDR10',
                        },
                        {
                            streamType: 2,
                            codec: 'truehd',
                            displayTitle: 'English (TrueHD 7.1 Atmos)',
                        },
                    ],
                },
            ],
        },
    ],
};

const makePlexFetch = () => jest.fn(async (url, options) => {
    const requestUrl = new URL(url.toString());
    expect(options.headers['X-Plex-Token']).toBe(baseEnv.C4K_PLEX_TOKEN);
    expect(options.headers['X-Plex-Client-Identifier']).toBe(baseEnv.C4K_PLEX_CLIENT_ID);
    expect(options.headers.Accept).toBe('application/json');

    if (requestUrl.pathname === '/base/library/all') {
        expect(requestUrl.searchParams.get('type')).toBe('1');
        expect(requestUrl.searchParams.get('includeElements')).toBe('Guid');
        expect(options.headers['X-Plex-Container-Start']).toBe('0');
        return {
            ok: true,
            json: async () => ({
                MediaContainer: {
                    size: 1,
                    totalSize: 1,
                    Metadata: [indexedMovie],
                },
            }),
        };
    }

    if (requestUrl.pathname === '/base/library/metadata/42') {
        expect(requestUrl.searchParams.get('includeElements')).toBe('Guid,Media,Label');
        return {
            ok: true,
            json: async () => ({
                MediaContainer: { size: 1, Metadata: [detailedMovie] },
            }),
        };
    }

    throw new Error(`Unexpected Plex request: ${requestUrl}`);
});

describe('C4K Plex provider', () => {
    beforeEach(() => resetPlexCache());

    it('matches a Plex movie by IMDb Guid and converts its media version to a C4K candidate', async () => {
        const fetchImpl = makePlexFetch();
        const candidates = await loadPlexCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl,
        });

        expect(candidates).toHaveLength(1);
        expect(candidates[0]).toMatchObject({
            source: 'uhd-bluray-remux',
            resolution: 2160,
            videoCodec: 'hevc',
            bitDepth: 10,
            hdr: ['dolby-vision', 'hdr10'],
            presentation: ['imax-1.90'],
            audio: ['truehd-atmos'],
            bitrateMbps: 72,
            verified: true,
            webReady: false,
        });
        expect(candidates[0].filename).toBe('Example Movie - UHD.mkv');
        expect(candidates[0].url).toContain('https://addon.example.test/media/plex/1001');
        expect(candidates[0].url).not.toContain(baseEnv.C4K_PLEX_TOKEN);
        expect(fetchImpl).toHaveBeenCalledTimes(2);
    });

    it('dispatches through the configured Plex provider', async () => {
        const candidates = await loadAuthorisedCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl: makePlexFetch(),
        });

        expect(candidates).toHaveLength(1);
        expect(resolveSourceProvider('plex')).toBe('plex');
    });

    it('returns no candidate for multi-part Plex media instead of returning an incomplete movie', async () => {
        const fetchImpl = jest.fn(async (url) => {
            const requestUrl = new URL(url.toString());
            if (requestUrl.pathname === '/base/library/all') {
                return {
                    ok: true,
                    json: async () => ({ MediaContainer: { totalSize: 1, Metadata: [indexedMovie] } }),
                };
            }
            return {
                ok: true,
                json: async () => ({
                    MediaContainer: {
                        Metadata: [{
                            ...detailedMovie,
                            Media: [{
                                ...detailedMovie.Media[0],
                                Part: [
                                    detailedMovie.Media[0].Part[0],
                                    { ...detailedMovie.Media[0].Part[0], id: 1002 },
                                ],
                            }],
                        }],
                    },
                }),
            };
        });

        await expect(loadPlexCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl,
        })).resolves.toEqual([]);
    });

    it('does not fetch detailed metadata when the IMDb id is absent', async () => {
        const fetchImpl = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                MediaContainer: {
                    totalSize: 1,
                    Metadata: [{ ...indexedMovie, Guid: [{ id: 'imdb://tt7654321' }] }],
                },
            }),
        }));

        await expect(loadPlexCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl,
        })).resolves.toEqual([]);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it('requires Plex credentials and relay signing configuration', async () => {
        const fetchImpl = jest.fn();
        await expect(loadPlexCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: { ...baseEnv, C4K_PLEX_TOKEN: '' },
            fetchImpl,
        })).resolves.toEqual([]);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('extracts IMDb Guid values and maps explicit C4K labels only', () => {
        expect(extractImdbId(indexedMovie)).toBe('tt1234567');
        expect(parseC4kLabels([
            { tag: 'c4k:source=web-dl' },
            { tag: 'c4k:presentation:imax-enhanced' },
            { tag: 'IMAX' },
            { tag: 'Remux' },
        ])).toEqual({ source: 'web-dl', presentations: ['imax-enhanced'] });
    });

    it('maps Plex technical display metadata for HDR and high-fidelity audio', () => {
        expect(mapPlexHdr({ displayTitle: '4K Dolby Vision/HDR10' })).toEqual([
            'dolby-vision',
            'hdr10',
        ]);
        expect(mapPlexAudio([
            { streamType: 2, codec: 'truehd', displayTitle: 'TrueHD 7.1 Atmos' },
            { streamType: 2, codec: 'dca', displayTitle: 'DTS:X 7.1' },
        ])).toEqual(['truehd-atmos', 'dts-x']);
    });
});

describe('C4K Plex media relay', () => {
    it('creates and verifies a signed part URL without exposing X-Plex-Token', () => {
        const now = Date.UTC(2026, 8, 23, 20, 0, 0);
        const partKey = '/library/parts/1001/123456789/file.mkv';
        const url = createSignedPlexRelayUrl({
            publicBaseUrl: 'https://addon.example.test',
            secret: 'relay-secret',
            partId: '1001',
            partKey,
            ttlSeconds: 3600,
            now,
        });
        const parsed = new URL(url);
        const decodedKey = decodePartKey(parsed.searchParams.get('key'));

        expect(parsed.pathname).toBe('/media/plex/1001');
        expect(decodedKey).toBe(partKey);
        expect(verifyPlexRelaySignature({
            secret: 'relay-secret',
            partId: '1001',
            partKey: decodedKey,
            expires: parsed.searchParams.get('expires'),
            signature: parsed.searchParams.get('signature'),
            now,
        })).toBe(true);
    });

    it('rejects arbitrary and encoded-traversal Plex paths', () => {
        expect(isValidPartKey({ partId: '1001', partKey: '/library/metadata/42' })).toBe(false);
        expect(isValidPartKey({ partId: '1001', partKey: '/library/parts/1002/123/file.mkv' })).toBe(false);
        expect(isValidPartKey({ partId: '1001', partKey: '/library/parts/1001/../metadata/42' })).toBe(false);
        expect(isValidPartKey({ partId: '1001', partKey: '/library/parts/1001/%2e%2e/metadata/42' })).toBe(false);
        expect(isValidPartKey({ partId: '1001', partKey: '/library/parts/1001/%252e%252e/metadata/42' })).toBe(false);
    });

    it('rejects a signature when the signed Plex part key is changed', () => {
        const now = Date.UTC(2026, 8, 23, 20, 0, 0);
        const expires = Math.floor(now / 1000) + 60;
        const partKey = '/library/parts/1001/123456789/file.mkv';
        const signature = createPlexRelaySignature({
            secret: 'relay-secret',
            partId: '1001',
            partKey,
            expires,
        });

        expect(verifyPlexRelaySignature({
            secret: 'relay-secret',
            partId: '1001',
            partKey: '/library/parts/1001/987654321/file.mkv',
            expires,
            signature,
            now,
        })).toBe(false);
    });

    it('builds a Plex media-part URL without adding credentials to the query', () => {
        const url = buildPlexPartUrl({
            plexBaseUrl: 'https://plex.example.test/base',
            partId: '1001',
            partKey: '/library/parts/1001/123456789/file.mkv',
        });

        expect(url.pathname).toBe('/base/library/parts/1001/123456789/file.mkv');
        expect(url.searchParams.has('X-Plex-Token')).toBe(false);
    });
});
