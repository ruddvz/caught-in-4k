// Copyright (C) 2017-2023 Smart code 203358507

const {
    buildAppHref,
    decodeGhPagesRedirect,
    legacyHashToPath,
    normalizeAppHref,
    resolveCanonicalAppLocation,
} = require('../src/common/navigation');

describe('navigation helpers', () => {
    it('converts the board hash route to a clean path', () => {
        expect(legacyHashToPath('#/')).toBe('/');
    });

    it('converts nested hash routes and preserves query strings', () => {
        expect(legacyHashToPath('#/discover')).toBe('/discover');
        expect(legacyHashToPath('#/search?search=alien')).toBe('/search?search=alien');
    });

    it('returns null for empty and non-route hashes', () => {
        expect(legacyHashToPath('')).toBe(null);
        expect(legacyHashToPath('#')).toBe(null);
        expect(legacyHashToPath('#section')).toBe(null);
    });

    it('decodes GitHub Pages redirect payloads', () => {
        expect(decodeGhPagesRedirect('?p=%2Fsettings')).toBe('/settings');
    });

    it('preserves reserved characters in restored redirect payloads', () => {
        expect(decodeGhPagesRedirect('?p=%2Fsearch%3Fsearch%3DC%2523')).toBe('/search?search=C%23');
        expect(resolveCanonicalAppLocation({ pathname: '/', search: '?p=%2Fsearch%3Fsearch%3DC%2523', hash: '' })).toEqual({
            href: '/search?search=C%23',
            needsReplace: true,
        });
    });

    it('builds clean hrefs from object query params', () => {
        expect(buildAppHref('/')).toBe('/');
        expect(buildAppHref('discover')).toBe('/discover');
        expect(buildAppHref('/search', { search: 'alien world' })).toBe('/search?search=alien+world');
        expect(buildAppHref('/addons', { addon: 'https://example.com/manifest.json' })).toBe('/addons?addon=https%3A%2F%2Fexample.com%2Fmanifest.json');
    });

    it('normalizes same-origin absolute legacy links to clean app paths', () => {
        expect(normalizeAppHref('https://c4k.live/#/profiles', 'https://c4k.live')).toBe('/profiles');
        expect(normalizeAppHref('#/library')).toBe('/library');
    });

    it('keeps existing clean paths as canonical locations', () => {
        expect(resolveCanonicalAppLocation({ pathname: '/discover', search: '?search=alien', hash: '' })).toEqual({
            href: '/discover?search=alien',
            needsReplace: false,
        });
    });

    it('upgrades legacy hash locations to clean paths', () => {
        expect(resolveCanonicalAppLocation({ pathname: '/', search: '', hash: '#/discover?search=alien' })).toEqual({
            href: '/discover?search=alien',
            needsReplace: true,
        });
        expect(resolveCanonicalAppLocation({ pathname: '/', search: '', hash: '#/' })).toEqual({
            href: '/',
            needsReplace: true,
        });
    });

    it('preserves top-level query params when upgrading legacy hash URLs', () => {
        expect(resolveCanonicalAppLocation({ pathname: '/', search: '?streamingServerUrl=https%3A%2F%2Fexample.com', hash: '#/discover' })).toEqual({
            href: '/discover?streamingServerUrl=https%3A%2F%2Fexample.com',
            needsReplace: true,
        });
    });

    it('restores the requested route from a Pages redirect query', () => {
        expect(resolveCanonicalAppLocation({ pathname: '/', search: '?p=%2Fsearch%3Fsearch%3DPeaky', hash: '' })).toEqual({
            href: '/search?search=Peaky',
            needsReplace: true,
        });
    });
});