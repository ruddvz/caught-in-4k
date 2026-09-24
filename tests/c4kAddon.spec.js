'use strict';

const {
    describeCandidate,
    rankCandidates,
    scoreCandidate,
    toStremioStream,
} = require('../c4k-addon/quality');
const { createStreamResolver } = require('../c4k-addon/service');
const {
    isAllowedMediaUrl,
    loadAuthorisedCandidates,
} = require('../c4k-addon/sourceProvider');

const remux = {
    url: 'https://media.example.test/movie-remux.mkv',
    filename: 'movie-remux.mkv',
    source: 'uhd-bluray-remux',
    resolution: 2160,
    videoCodec: 'hevc',
    bitDepth: 10,
    hdr: ['dolby-vision', 'hdr10'],
    audio: ['truehd-atmos'],
    bitrateMbps: 72,
    sizeBytes: 70 * 1024 ** 3,
    verified: true,
};

describe('C4K quality engine', () => {
    it('ranks a UHD Blu-ray remux above a lower-fidelity 4K WEB-DL', () => {
        const webDl = {
            ...remux,
            url: 'https://media.example.test/movie-web.mkv',
            source: 'web-dl',
            bitrateMbps: 24,
            audio: ['eac3-atmos'],
            sizeBytes: 20 * 1024 ** 3,
        };

        const ranked = rankCandidates([webDl, remux]);
        expect(ranked[0].url).toBe(remux.url);
        expect(ranked[0]._c4kScore).toBeGreaterThan(ranked[1]._c4kScore);
    });

    it('adds a strong IMAX preference only for the IMAX profile', () => {
        const standard = { ...remux, url: 'https://media.example.test/standard.mkv' };
        const imax = {
            ...remux,
            url: 'https://media.example.test/imax.mkv',
            presentation: ['imax-1.90'],
        };

        expect(scoreCandidate(imax, { profile: 'imax' }).score)
            .toBeGreaterThan(scoreCandidate(standard, { profile: 'imax' }).score);
    });

    it('makes MVC 3D meaningful when the 3D profile is selected', () => {
        const mvc = {
            ...remux,
            resolution: 1080,
            source: 'bluray-remux',
            threeD: 'mvc',
        };

        const absoluteScore = scoreCandidate(mvc, { profile: 'absolute' }).score;
        const threeDScore = scoreCandidate(mvc, { profile: '3d' }).score;
        expect(threeDScore).toBeGreaterThan(absoluteScore);
    });

    it('formats only metadata actually supplied by the candidate', () => {
        const description = describeCandidate(remux);
        expect(description).toContain('2160p');
        expect(description).toContain('UHD Blu-ray Remux');
        expect(description).toContain('Dolby Vision');
        expect(description).toContain('TrueHD Atmos');
        expect(description).not.toContain('IMAX');
    });

    it('creates a direct Stremio stream object with filename and size hints', () => {
        const stream = toStremioStream(remux);
        expect(stream.url).toBe(remux.url);
        expect(stream.behaviorHints.filename).toBe(remux.filename);
        expect(stream.behaviorHints.videoSize).toBe(remux.sizeBytes);
        expect(stream.name).toBe('C4K • 2160p');
    });
});

describe('C4K authorised source boundary', () => {
    it('accepts HTTPS only from explicitly allowed media hosts', () => {
        const hosts = ['media.example.test'];
        expect(isAllowedMediaUrl('https://media.example.test/a.mkv', hosts)).toBe(true);
        expect(isAllowedMediaUrl('https://other.example.test/a.mkv', hosts)).toBe(false);
        expect(isAllowedMediaUrl('http://media.example.test/a.mkv', hosts)).toBe(false);
        expect(isAllowedMediaUrl('magnet:?xt=urn:btih:example', hosts)).toBe(false);
    });

    it('drops candidates returned from media hosts that were not authorised', async () => {
        const fetchImpl = jest.fn(async () => ({
            ok: true,
            json: async () => ({
                candidates: [
                    remux,
                    { ...remux, url: 'https://unapproved.example.test/movie.mkv' },
                ],
            }),
        }));

        const candidates = await loadAuthorisedCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: {
                NODE_ENV: 'test',
                C4K_SOURCE_INDEX_URL: 'https://index.example.test/candidates',
                C4K_ALLOWED_MEDIA_HOSTS: 'media.example.test',
            },
            fetchImpl,
        });

        expect(candidates).toHaveLength(1);
        expect(candidates[0].url).toBe(remux.url);
    });

    it('returns no candidates when the provider or host allowlist is absent', async () => {
        const fetchImpl = jest.fn();
        const candidates = await loadAuthorisedCandidates({
            type: 'movie',
            id: 'tt1234567',
            env: {},
            fetchImpl,
        });

        expect(candidates).toEqual([]);
        expect(fetchImpl).not.toHaveBeenCalled();
    });
});

describe('C4K stream resolver', () => {
    it('returns ranked streams for IMDb movie IDs', async () => {
        const resolver = createStreamResolver({
            env: {
                C4K_QUALITY_PROFILE: 'absolute',
                C4K_MAX_STREAMS: '1',
            },
            loadCandidates: async () => [
                { ...remux, source: 'web-dl', bitrateMbps: 20 },
                remux,
            ],
        });

        const result = await resolver({ type: 'movie', id: 'tt1234567' });
        expect(result.streams).toHaveLength(1);
        expect(result.streams[0].url).toBe(remux.url);
    });

    it('returns no streams for unsupported types or malformed IDs', async () => {
        const loadCandidates = jest.fn(async () => [remux]);
        const resolver = createStreamResolver({ loadCandidates, env: {} });

        await expect(resolver({ type: 'series', id: 'tt1234567' })).resolves.toEqual({ streams: [] });
        await expect(resolver({ type: 'movie', id: 'not-imdb' })).resolves.toEqual({ streams: [] });
        expect(loadCandidates).not.toHaveBeenCalled();
    });
});
