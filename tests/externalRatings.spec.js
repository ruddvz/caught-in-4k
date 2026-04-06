const { describe, expect, it } = require('@jest/globals');

const {
    SOURCE_ORDER,
    VERDICTS,
    buildExternalRatingsModel,
    getCompactRatingBadge,
    getVerdictForScore,
} = require('../src/common/externalRatings');

describe('externalRatings', () => {
    it('keeps the supported ratings in the fixed source order', () => {
        const model = buildExternalRatingsModel({
            links: [
                { category: 'metacritic', name: '81', url: 'https://metacritic.com/title' },
                { category: 'imdb', name: '8.7', url: 'https://imdb.com/title' },
                { category: 'Rotten Tomatoes', name: '94%', url: 'https://rottentomatoes.com/title' },
            ],
        });

        expect(SOURCE_ORDER).toEqual(['imdb', 'rottenTomatoes', 'metacritic']);
        expect(model.cards.map((card) => card.id)).toEqual(SOURCE_ORDER);
        expect(model.cards.map((card) => card.display)).toEqual(['8.7', '94%', '81']);
    });

    it('falls back to imdbRating when no imdb link exists', () => {
        const model = buildExternalRatingsModel({
            links: [{ category: 'Genres', name: 'Drama', url: 'stremio:///genre/drama' }],
            imdbRating: 7.4,
        });

        expect(model.imdb).toEqual(expect.objectContaining({
            id: 'imdb',
            value: 74,
            display: '7.4',
        }));
        expect(model.cards).toHaveLength(1);
    });

    it('does not relabel a generic voteAverage as imdb when no imdb source exists', () => {
        const model = buildExternalRatingsModel({
            links: [{ category: 'Genres', name: 'Drama', url: 'stremio:///genre/drama' }],
            voteAverage: 7.4,
        });

        expect(model.imdb).toBeNull();
        expect(model.cards).toHaveLength(0);
        expect(model.compactBadge).toBeNull();
    });

    it('builds a weighted consensus when at least two sources are available', () => {
        const model = buildExternalRatingsModel({
            links: [
                { category: 'imdb', name: '8.7', url: 'https://imdb.com/title' },
                { category: 'Rotten Tomatoes', name: '94%', url: 'https://rottentomatoes.com/title' },
                { category: 'metacritic', name: '81', url: 'https://metacritic.com/title' },
            ],
        });

        expect(model.consensus).toEqual(expect.objectContaining({
            score: 88,
            penalty: 0,
            verdict: expect.objectContaining({ id: 'must-watch', name: 'Must Watch' }),
        }));
    });

    it('re-normalizes weights when only two sources are available', () => {
        const model = buildExternalRatingsModel({
            links: [
                { category: 'imdb', name: '8.0', url: 'https://imdb.com/title' },
                { category: 'Rotten Tomatoes', name: '90%', url: 'https://rottentomatoes.com/title' },
            ],
        });

        expect(model.consensus).toEqual(expect.objectContaining({
            score: 84,
            penalty: 0,
            sourceCount: 2,
        }));
    });

    it('applies the spread penalty when the sources disagree heavily', () => {
        const model = buildExternalRatingsModel({
            links: [
                { category: 'imdb', name: '8.8', url: 'https://imdb.com/title' },
                { category: 'Rotten Tomatoes', name: '44%', url: 'https://rottentomatoes.com/title' },
                { category: 'metacritic', name: '39', url: 'https://metacritic.com/title' },
            ],
        });

        expect(model.consensus).toEqual(expect.objectContaining({
            spread: 49,
            penalty: 8,
            score: 55,
            verdict: expect.objectContaining({ id: 'for-fans-first', name: 'For Fans First' }),
        }));
    });

    it('suppresses the consensus when fewer than two supported sources exist', () => {
        const model = buildExternalRatingsModel({ imdbRating: 7.1 });

        expect(model.consensus).toBeNull();
        expect(getCompactRatingBadge(model)).toEqual(expect.objectContaining({
            id: 'imdb',
            label: '7.1',
        }));
    });

    it('prefers the consensus for compact badges when it exists', () => {
        const model = buildExternalRatingsModel({
            links: [
                { category: 'imdb', name: '8.9', url: 'https://imdb.com/title' },
                { category: 'Rotten Tomatoes', name: '95%', url: 'https://rottentomatoes.com/title' },
                { category: 'metacritic', name: '86', url: 'https://metacritic.com/title' },
            ],
        });

        expect(getCompactRatingBadge(model)).toEqual(expect.objectContaining({
            id: 'consensus',
            label: '91%',
            secondaryLabel: 'Absolute Cinema',
        }));
    });

    it('returns the premium verdict tiers with absolute cinema preserved', () => {
        expect(VERDICTS.map((verdict) => verdict.name)).toEqual([
            'Absolute Cinema',
            'Must Watch',
            'Worth Your Time',
            'For Fans First',
            'Skip This One',
        ]);

        expect(getVerdictForScore(90)).toEqual(expect.objectContaining({ id: 'absolute-cinema' }));
        expect(getVerdictForScore(76)).toEqual(expect.objectContaining({ id: 'must-watch' }));
        expect(getVerdictForScore(61)).toEqual(expect.objectContaining({ id: 'worth-your-time' }));
        expect(getVerdictForScore(43)).toEqual(expect.objectContaining({ id: 'for-fans-first' }));
        expect(getVerdictForScore(12)).toEqual(expect.objectContaining({ id: 'skip-this-one' }));
    });
});