const { describe, expect, it } = require('@jest/globals');

const { resolveStreamLaunchTarget } = require('../src/routes/MetaDetails/StreamsList/Stream/resolveStreamLaunchTarget');

function createDeepLinks(overrides = {}) {
    return {
        player: '/player/internal-stream',
        externalPlayer: {
            web: 'https://example.com/external',
            playlist: 'https://example.com/playlist.m3u',
            fileName: 'Example.m3u',
            openPlayer: {
                windows: 'vlc://example-stream',
            },
            ...overrides.externalPlayer,
        },
        ...overrides,
    };
}

describe('resolveStreamLaunchTarget', () => {
    it('uses the internal player when playerType is null even if external links exist', () => {
        expect(resolveStreamLaunchTarget({
            deepLinks: createDeepLinks(),
            playerType: null,
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: '/player/internal-stream',
            isExternal: false,
            target: null,
        }));
    });

    it('treats undefined playerType the same as internal player mode', () => {
        expect(resolveStreamLaunchTarget({
            deepLinks: createDeepLinks(),
            playerType: undefined,
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: '/player/internal-stream',
            isExternal: false,
        }));
    });

    it('still marks external-only launches as external when no internal player link exists', () => {
        expect(resolveStreamLaunchTarget({
            deepLinks: createDeepLinks({ player: null }),
            playerType: null,
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: 'https://example.com/external',
            isExternal: true,
            target: '_blank',
        }));
    });

    it('uses an external target when an external player is configured', () => {
        expect(resolveStreamLaunchTarget({
            deepLinks: createDeepLinks(),
            playerType: 'vlc',
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: 'https://example.com/external',
            isExternal: true,
            target: '_blank',
        }));
    });

    it('falls back to the internal player when external mode is selected but no external link exists', () => {
        expect(resolveStreamLaunchTarget({
            deepLinks: createDeepLinks({ externalPlayer: null }),
            playerType: 'vlc',
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: '/player/internal-stream',
            isExternal: false,
            target: null,
        }));
    });
});
