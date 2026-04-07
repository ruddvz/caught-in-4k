const { describe, expect, it } = require('@jest/globals');

const { getMetaPreviewLinksGroups } = require('../src/components/MetaPreview/getLinksGroups');

describe('MetaPreview link grouping', () => {
    it('keeps rating-source review links in compact browse mode even when the URLs match rating cards', () => {
        const reviewLinks = [
            { category: 'Reviews', name: 'IMDb', url: 'https://www.imdb.com/title/tt1745960/' },
            { category: 'Reviews', name: 'Rotten Tomatoes', url: 'https://www.rottentomatoes.com/m/top_gun_maverick' },
        ];

        const groups = getMetaPreviewLinksGroups({
            links: reviewLinks,
            ratingLinkHrefs: new Set(reviewLinks.map((link) => link.url)),
            showFullRatings: false,
        });

        expect(groups.get('Reviews')).toEqual([
            {
                label: 'IMDb',
                href: 'https://www.stremio.com/warning#https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt1745960%2F',
            },
            {
                label: 'Rotten Tomatoes',
                href: 'https://www.stremio.com/warning#https%3A%2F%2Fwww.rottentomatoes.com%2Fm%2Ftop_gun_maverick',
            },
        ]);
    });

    it('suppresses only exact rating-card review URLs in details mode', () => {
        const reviewLinks = [
            { category: 'Reviews', name: 'IMDb', url: 'https://www.imdb.com/title/tt1745960/' },
            { category: 'Reviews', name: 'Rotten Tomatoes', url: 'https://www.rottentomatoes.com/m/top_gun_maverick' },
        ];

        const groups = getMetaPreviewLinksGroups({
            links: reviewLinks,
            ratingLinkHrefs: new Set(reviewLinks.map((link) => link.url)),
            showFullRatings: true,
        });

        expect(groups.has('Reviews')).toBe(false);
    });

    it('preserves review links in details mode when the represented rating cards use different URLs', () => {
        const reviewLinks = [
            { category: 'Reviews', name: 'IMDb', url: 'https://www.imdb.com/title/tt1745960/reviews/' },
            { category: 'Reviews', name: 'Metacritic', url: 'https://www.metacritic.com/movie/top-gun-maverick/user-reviews/' },
        ];

        const groups = getMetaPreviewLinksGroups({
            links: reviewLinks,
            ratingLinkHrefs: new Set([
                'https://www.imdb.com/title/tt1745960/',
                'https://www.metacritic.com/movie/top-gun-maverick',
            ]),
            showFullRatings: true,
        });

        expect(groups.get('Reviews')).toEqual([
            {
                label: 'IMDb',
                href: 'https://www.stremio.com/warning#https%3A%2F%2Fwww.imdb.com%2Ftitle%2Ftt1745960%2Freviews%2F',
            },
            {
                label: 'Metacritic',
                href: 'https://www.stremio.com/warning#https%3A%2F%2Fwww.metacritic.com%2Fmovie%2Ftop-gun-maverick%2Fuser-reviews%2F',
            },
        ]);
    });
});