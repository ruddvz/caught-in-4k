const { describe, expect, it } = require('@jest/globals');

const { resolveExternalPlayerFallbackTarget } = require('../src/routes/Player/resolveExternalPlayerFallbackTarget');

function createStream(overrides = {}) {
    return {
        deepLinks: {
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
        },
    };
}

describe('resolveExternalPlayerFallbackTarget', () => {
    it('returns null until the internal fallback chain is exhausted', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: false,
            externalPlayerFallbackEnabled: true,
            playerType: 'vlc',
            selectedStream: createStream(),
            platformName: 'windows',
        })).toBeNull();
    });

    it('returns null when the local external-player fallback setting is disabled', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: true,
            externalPlayerFallbackEnabled: false,
            playerType: 'vlc',
            selectedStream: createStream(),
            platformName: 'windows',
        })).toBeNull();
    });

    it('resolves an external launch target from the selected stream when enabled', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: true,
            externalPlayerFallbackEnabled: true,
            playerType: 'vlc',
            selectedStream: createStream(),
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: 'vlc://example-stream',
            isExternal: true,
            target: null,
        }));
    });

    it('falls back to the active video stream when the selected player stream is missing', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: true,
            externalPlayerFallbackEnabled: true,
            playerType: 'vlc',
            selectedStream: null,
            videoStream: createStream({
                externalPlayer: {
                    web: '',
                    playlist: 'https://example.com/playlist.m3u',
                    fileName: 'Example.m3u',
                    openPlayer: {
                        windows: 'vlc://example-stream',
                    },
                },
            }),
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: 'vlc://example-stream',
            isExternal: true,
            target: null,
        }));
    });

    it('falls back to the external playlist when there is no player-specific deep link', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: true,
            externalPlayerFallbackEnabled: true,
            playerType: 'vlc',
            selectedStream: createStream({
                externalPlayer: {
                    web: 'https://example.com/external',
                    playlist: 'https://example.com/playlist.m3u',
                    fileName: 'Example.m3u',
                    openPlayer: {},
                },
            }),
            platformName: 'windows',
        })).toEqual(expect.objectContaining({
            href: 'https://example.com/playlist.m3u',
            download: 'Example.m3u',
            isExternal: true,
            target: null,
        }));
    });

    it('returns null when the stream only resolves back to the internal player', () => {
        expect(resolveExternalPlayerFallbackTarget({
            exhausted: true,
            externalPlayerFallbackEnabled: true,
            playerType: 'vlc',
            selectedStream: createStream({ externalPlayer: null }),
            platformName: 'windows',
        })).toBeNull();
    });
});