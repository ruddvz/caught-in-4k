const { describe, expect, it } = require('@jest/globals');

const { createProfileContinueWatchingStore } = require('../src/common/profileContinueWatching');

function createMemoryStorage() {
    const store = new Map();

    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null;
        },
        setItem(key, value) {
            store.set(key, String(value));
        },
        removeItem(key) {
            store.delete(key);
        },
        clear() {
            store.clear();
        },
    };
}

function createEntry(overrides = {}) {
    return {
        type: 'series',
        metaId: 'meta-1',
        libraryItemId: 'library-1',
        videoId: 'video-1',
        videoReleased: '2026-01-01T00:00:00.000Z',
        name: 'Example Show',
        poster: 'https://example.com/poster.jpg',
        posterShape: 'poster',
        releaseInfo: '2026',
        timeOffset: 120,
        duration: 600,
        progress: 20,
        updatedAt: '2026-04-06T00:00:00.000Z',
        deepLinks: {
            metaDetailsVideos: '/metadetails/series/meta-1/video-1',
            metaDetailsStreams: '/metadetails/series/meta-1',
            player: '/player/stream/transport/meta/series/meta-1/video-1',
        },
        ...overrides,
    };
}

describe('profile continue watching store', () => {
    it('isolates history by account scope and selected profile', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({ auth: { user: { id: 'user-a' } }, profileId: 'profile-a', entry: createEntry({ name: 'Profile A' }) });
        store.upsertEntry({ auth: { user: { id: 'user-a' } }, profileId: 'profile-b', entry: createEntry({ metaId: 'meta-2', libraryItemId: 'library-2', videoId: 'video-2', name: 'Profile B' }) });
        store.upsertEntry({ auth: { user: { id: 'user-b' } }, profileId: 'profile-a', entry: createEntry({ metaId: 'meta-3', libraryItemId: 'library-3', videoId: 'video-3', name: 'Other Account' }) });

        expect(store.getPreview({ auth: { user: { id: 'user-a' } }, profileId: 'profile-a' }).items).toEqual([
            expect.objectContaining({ name: 'Profile A' }),
        ]);
        expect(store.getPreview({ auth: { user: { id: 'user-a' } }, profileId: 'profile-b' }).items).toEqual([
            expect.objectContaining({ name: 'Profile B' }),
        ]);
        expect(store.getPreview({ auth: { user: { id: 'user-b' } }, profileId: 'profile-a' }).items).toEqual([
            expect.objectContaining({ name: 'Other Account' }),
        ]);
    });

    it('keeps one continue-watching card per meta item and updates the active episode', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({ auth: null, profileId: 'profile-a', entry: createEntry() });
        store.upsertEntry({ auth: null, profileId: 'profile-a', entry: createEntry({ videoId: 'video-2', timeOffset: 300, progress: 50, updatedAt: '2026-04-06T01:00:00.000Z' }) });

        const preview = store.getPreview({ auth: null, profileId: 'profile-a' });

        expect(preview.items).toHaveLength(1);
        expect(preview.items[0]).toEqual(expect.objectContaining({
            progress: 50,
            deepLinks: expect.objectContaining({ player: expect.stringContaining('video-2') }),
        }));
    });

    it('prefers local resume time only when the stored library item and video match', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({ auth: null, profileId: 'profile-a', entry: createEntry({ timeOffset: 245 }) });

        expect(store.resolveResumeTime({
            auth: null,
            profileId: 'profile-a',
            libraryItemId: 'library-1',
            metaId: 'meta-1',
            type: 'series',
            videoId: 'video-1',
            fallbackTime: 0,
        })).toBe(245);

        expect(store.resolveResumeTime({
            auth: null,
            profileId: 'profile-a',
            libraryItemId: 'library-1',
            metaId: 'meta-1',
            type: 'series',
            videoId: 'video-9',
            fallbackTime: 33,
        })).toBe(33);
    });

    it('matches non-library entries by meta and video, and ignores completed entries when resuming', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({
            auth: null,
            profileId: 'profile-a',
            entry: createEntry({
                libraryItemId: null,
                metaId: 'meta-2',
                videoId: 'video-2',
                timeOffset: 150,
                deepLinks: {
                    metaDetailsVideos: '/metadetails/series/meta-2/video-2',
                    metaDetailsStreams: '/metadetails/series/meta-2',
                    player: '/player/stream/transport/meta/series/meta-2/video-2',
                },
            }),
        });

        expect(store.resolveResumeTime({
            auth: null,
            profileId: 'profile-a',
            libraryItemId: null,
            metaId: 'meta-2',
            type: 'series',
            videoId: 'video-2',
            fallbackTime: 12,
        })).toBe(150);

        store.markCompleted({ auth: null, profileId: 'profile-a', metaId: 'meta-2', type: 'series' });

        expect(store.resolveResumeTime({
            auth: null,
            profileId: 'profile-a',
            libraryItemId: null,
            metaId: 'meta-2',
            type: 'series',
            videoId: 'video-2',
            fallbackTime: 12,
        })).toBe(12);
    });

    it('keeps queued next-episode entries visible even when they start from zero progress', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({
            auth: null,
            profileId: 'profile-a',
            entry: createEntry({
                videoId: 'video-2',
                timeOffset: 0,
                duration: 0,
                resumeFromStart: true,
                deepLinks: {
                    metaDetailsVideos: '/metadetails/series/meta-1/video-2',
                    metaDetailsStreams: '/metadetails/series/meta-1',
                    player: '/player/stream/transport/meta/series/meta-1/video-2',
                },
            }),
        });

        const preview = store.getPreview({ auth: null, profileId: 'profile-a' });

        expect(preview.items).toEqual([
            expect.objectContaining({
                progress: 0,
                deepLinks: expect.objectContaining({ player: expect.stringContaining('video-2') }),
            }),
        ]);
        expect(store.resolveResumeTime({
            auth: null,
            profileId: 'profile-a',
            libraryItemId: 'library-1',
            metaId: 'meta-1',
            type: 'series',
            videoId: 'video-2',
            fallbackTime: 25,
        })).toBe(0);
    });

    it('keeps entries visible when they have saved time but round down to zero percent progress', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({
            auth: null,
            profileId: 'profile-a',
            entry: createEntry({
                timeOffset: 10,
                duration: 10_000,
            }),
        });

        expect(store.getPreview({ auth: null, profileId: 'profile-a' }).items).toEqual([
            expect.objectContaining({
                progress: 0,
            }),
        ]);
    });

    it('dismisses history only for the active profile and filters completed items from preview', () => {
        const storage = createMemoryStorage();
        const store = createProfileContinueWatchingStore({ storage, eventTarget: null });

        store.upsertEntry({ auth: null, profileId: 'profile-a', entry: createEntry({ metaId: 'meta-a', libraryItemId: 'library-a' }) });
        store.upsertEntry({ auth: null, profileId: 'profile-b', entry: createEntry({ metaId: 'meta-b', libraryItemId: 'library-b', name: 'Other Profile' }) });
        store.markCompleted({ auth: null, profileId: 'profile-b', metaId: 'meta-b', type: 'series' });
        store.dismissEntry({ auth: null, profileId: 'profile-a', metaId: 'meta-a', type: 'series' });

        expect(store.getPreview({ auth: null, profileId: 'profile-a' }).items).toEqual([]);
        expect(store.getPreview({ auth: null, profileId: 'profile-b' }).items).toEqual([]);
        expect(store.getEntries({ auth: null, profileId: 'profile-b' })).toEqual([
            expect.objectContaining({ metaId: 'meta-b', completed: true }),
        ]);
    });
});
