'use strict';

const {
    buildJellyfinStreamUrl,
    createRelaySignature,
    createSignedRelayUrl,
    verifyRelaySignature,
} = require('../c4k-addon/mediaRelay');
const {
    loadJellyfinCandidates,
    mapAudio,
    mapHdr,
    mapThreeD,
    parseC4kTags,
    resetJellyfinCache,
} = require('../c4k-addon/providers/jellyfin');
const { loadAuthorisedCandidates, resolveSourceProvider } = require('../c4k-addon/sourceProvider');

const baseEnv = {
    NODE_ENV: 'test',
    C4K_SOURCE_PROVIDER: 'jellyfin',
    C4K_JELLYFIN_URL: 'https://jellyfin.example.test/base',
    C4K_JELLYFIN_TOKEN: 'server-only-token',
    C4K_JELLYFIN_USER_ID: 'user-1',
    C4K_JELLYFIN_CACHE_MS: '0',
    C4K_ADDON_PUBLIC_URL: 'https://addon.example.test',
    C4K_MEDIA_RELAY_SECRET: 'relay-secret-value',
};

const indexedJellyfinItem = {
    Id: 'movie-1',
    Name: 'Example Movie',
    ProviderIds: { Imdb: 'tt1234567' },
};

const detailedJellyfinItem = {
    ...indexedJellyfinItem,
    Tags: [
        'c4k:source=uhd-bluray-remux',
        'c4k:presentation=imax-1.90',
    ],
};

const playbackInfo = {
    MediaSources: [
        {
            Id: 'source-4k',
            Container: 'mkv',
            Path: '/library/Example Movie - UHD.mkv',
            Bitrate: 72000000,
            Size: 70 * 1024 ** 3,
            Video3DFormat: 'MVC',
            MediaStreams: [
                {
                    Type: 'Video',
                    Codec: 'hevc',
                    BitDepth: 10,
                    Width: 3840,
                    Height: 1608,
                    VideoRangeType: 'DOVIWithHDR10Plus',
                    DvProfile: 8,
                    Hdr10PlusPresentFlag: true,
                },
                {
                    Type: 'Audio',
                    Codec: 'truehd',
                    AudioSpatialFormat: 'DolbyAtmos',
                },
            ],
        },
    ],
};

const makeJellyfinFetch = () => jest.fn(async (url, options) => {
    const requestUrl = new URL(url.toString());
    expect(options.headers['X-Emby-Token']).toBe(baseEnv.C4K_JELLYFIN_TOKEN);

    if (requestUrl.pathname === '/base/Items') {
        expect(requestUrl.searchParams.get('HasImdbId')).toBe('true');
        expect(requestUrl.searchParams.get('IncludeItemTypes')).toBe('Movie');
        return {
            ok: true,
            json: async () => ({ Items: [indexedJellyfinItem], TotalRecordCount: 1 }),
        };
    }

    if (requestUrl.pathname === '/base/Items/movie-1') {
        expect(requestUrl.searchParams.get('UserId')).toBe(baseEnv.C4K_JELLYFIN_USER_ID);
        return {
            ok: true,
            json: async () => detailedJellyfinItem,
        };
    }

    if (requestUrl.pathname === '/base/Items/movie-1/PlaybackInfo') {
        expect(requestUrl.searchParams.get('UserId')).toBe(baseEnv.C4K_JELLYFIN_USER_ID);
        return {
            ok: true,
            json: async () => playbackInfo,
        };
    }

    throw new Error(`Unexpected Jellyfin request: ${requestUrl}`);
});

describe('C4K Jellyfin provider', () => {
    beforeEach(() => resetJellyfinCache());

    it('turns a matched Jellyfin movie version into a quality-rich C4K candidate', async () => {
        const fetchImpl = makeJellyfinFetch();
        const candidates = await loadJellyfinCandidates({
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
            hdr: ['dolby-vision', 'hdr10-plus'],
            presentation: ['imax-1.90'],
            audio: ['truehd-atmos'],
            threeD: 'mvc',
            bitrateMbps: 72,
            verified: true,
            webReady: false,
        });
        expect(candidates[0].filename).toBe('Example Movie - UHD.mkv');
        expect(candidates[0].url).toContain('https://addon.example.test/media/jellyfin/movie-1/source-4k');
        expect(candidates[0].url).not.toContain(baseEnv.C4K_JELLYFIN_TOKEN);
        expect(fetchImpl).toHaveBeenCalledTimes(3);
    });

    it('does not fetch item details or playback info when the IMDb id is absent from the library', async () => {
        const fetchImpl = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                Items: [{ ...indexedJellyfinItem, ProviderIds: { Imdb: 'tt7654321' } }],
                TotalRecordCount: 1,
            }),
        }));

        const candidates = await loadJellyfinCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl,
        });

        expect(candidates).toEqual([]);
        expect(fetchImpl).toHaveBeenCalledTimes(1);
    });

    it('dispatches through the configured Jellyfin source provider', async () => {
        const candidates = await loadAuthorisedCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: baseEnv,
            fetchImpl: makeJellyfinFetch(),
        });

        expect(candidates).toHaveLength(1);
        expect(resolveSourceProvider('jellyfin')).toBe('jellyfin');
        expect(resolveSourceProvider('unknown-provider')).toBeNull();
    });

    it('requires the Jellyfin token and relay secret instead of exposing unauthenticated URLs', async () => {
        const fetchImpl = jest.fn();
        await expect(loadJellyfinCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: { ...baseEnv, C4K_MEDIA_RELAY_SECRET: '' },
            fetchImpl,
        })).resolves.toEqual([]);
        expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('maps only explicit C4K source and presentation tags', () => {
        expect(parseC4kTags([
            'c4k:source=web-dl',
            'c4k:presentation:imax-enhanced',
            'IMAX',
            'Remux',
        ])).toEqual({
            source: 'web-dl',
            presentations: ['imax-enhanced'],
        });
    });

    it('maps Jellyfin probed HDR, spatial audio and 3D metadata', () => {
        expect(mapHdr({ VideoRangeType: 'DOVIWithHDR10', DvProfile: 8 })).toEqual([
            'dolby-vision',
            'hdr10',
        ]);
        expect(mapAudio([
            { Type: 'Audio', Codec: 'truehd', AudioSpatialFormat: 'DolbyAtmos' },
            { Type: 'Audio', Codec: 'dts', AudioSpatialFormat: 'DTSX' },
        ])).toEqual(['truehd-atmos', 'dts-x']);
        expect(mapThreeD('HalfSideBySide')).toBe('half-sbs');
    });

    it('does not classify a null Dolby Vision profile as Dolby Vision', () => {
        expect(mapHdr({ VideoRangeType: 'HDR10', DvProfile: null })).toEqual(['hdr10']);
        expect(mapHdr({ VideoRangeType: 'SDR', DvProfile: null })).toEqual(['sdr']);
    });
});

describe('C4K signed media relay', () => {
    it('creates signed URLs that can be verified without embedding the Jellyfin token', () => {
        const now = Date.UTC(2026, 8, 23, 20, 0, 0);
        const url = createSignedRelayUrl({
            publicBaseUrl: 'https://addon.example.test',
            secret: 'relay-secret',
            itemId: 'movie-1',
            mediaSourceId: 'source-1',
            ttlSeconds: 3600,
            now,
        });
        const parsed = new URL(url);

        expect(parsed.pathname).toBe('/media/jellyfin/movie-1/source-1');
        expect(verifyRelaySignature({
            secret: 'relay-secret',
            itemId: 'movie-1',
            mediaSourceId: 'source-1',
            expires: parsed.searchParams.get('expires'),
            signature: parsed.searchParams.get('signature'),
            now,
        })).toBe(true);
    });

    it('rejects tampered and expired relay signatures', () => {
        const now = Date.UTC(2026, 8, 23, 20, 0, 0);
        const expires = Math.floor(now / 1000) + 60;
        const signature = createRelaySignature({
            secret: 'relay-secret',
            itemId: 'movie-1',
            mediaSourceId: 'source-1',
            expires,
        });

        expect(verifyRelaySignature({
            secret: 'relay-secret',
            itemId: 'movie-2',
            mediaSourceId: 'source-1',
            expires,
            signature,
            now,
        })).toBe(false);
        expect(verifyRelaySignature({
            secret: 'relay-secret',
            itemId: 'movie-1',
            mediaSourceId: 'source-1',
            expires,
            signature,
            now: now + 61000,
        })).toBe(false);
    });

    it('builds an upstream Jellyfin static stream URL without putting credentials in the query', () => {
        const url = buildJellyfinStreamUrl({
            jellyfinBaseUrl: 'https://jellyfin.example.test/base',
            itemId: 'movie-1',
            mediaSourceId: 'source-1',
        });

        expect(url.pathname).toBe('/base/Videos/movie-1/stream');
        expect(url.searchParams.get('Static')).toBe('true');
        expect(url.searchParams.get('MediaSourceId')).toBe('source-1');
        expect(url.searchParams.has('api_key')).toBe(false);
    });
});
