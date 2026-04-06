const { getSelectedProfileId } = require('./profileStore');

const PROFILE_CONTINUE_WATCHING_EVENT = 'c4k-profile-continue-watching-changed';
const PROFILE_CONTINUE_WATCHING_KEY_PREFIX = 'c4k_profile_continue_watching_v1:';

function defaultStorage() {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage;
}

function defaultEventTarget() {
    if (typeof window === 'undefined') {
        return null;
    }

    return window;
}

function getAccountScope(auth) {
    return auth?.user?.id || 'guest';
}

function getProfileScope(storage, auth, profileId) {
    const resolvedProfileId = typeof profileId === 'string' && profileId.length > 0
        ? profileId
        : getSelectedProfileId(storage, auth);

    if (!resolvedProfileId) {
        return null;
    }

    return `${getAccountScope(auth)}:${resolvedProfileId}`;
}

function getScopedStorageKey(scope) {
    return `${PROFILE_CONTINUE_WATCHING_KEY_PREFIX}${scope}`;
}

function readJson(storage, key, fallbackValue) {
    if (!storage || !key) {
        return fallbackValue;
    }

    try {
        const rawValue = storage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (_error) {
        return fallbackValue;
    }
}

function writeJson(storage, key, value) {
    if (!storage || !key) {
        return;
    }

    storage.setItem(key, JSON.stringify(value));
}

function emitProfileContinueWatchingChange(eventTarget) {
    if (!eventTarget || typeof eventTarget.dispatchEvent !== 'function' || typeof Event === 'undefined') {
        return;
    }

    eventTarget.dispatchEvent(new Event(PROFILE_CONTINUE_WATCHING_EVENT));
}

function replaceTrailingPathSegment(href, nextSegment) {
    if (typeof href !== 'string' || href.length === 0 || typeof nextSegment !== 'string' || nextSegment.length === 0) {
        return href;
    }

    const [pathname, search = ''] = href.split('?');
    const segments = pathname.split('/');
    if (segments.length === 0) {
        return href;
    }

    segments[segments.length - 1] = nextSegment;
    return `${segments.join('/')}${search ? `?${search}` : ''}`;
}

function normalizeVideoScopedHref(href, videoId, fallbackHref) {
    if (typeof videoId !== 'string' || videoId.length === 0) {
        return typeof href === 'string' ? href : fallbackHref;
    }

    if (typeof href !== 'string' || href.length === 0) {
        return fallbackHref;
    }

    if (href.includes(`/${videoId}`)) {
        return href;
    }

    return replaceTrailingPathSegment(href, videoId);
}

function normalizeDeepLinks(entry) {
    const { deepLinks, metaId, type, videoId } = entry || {};
    const fallbackMetaDetailsVideos = metaId && type && videoId ? `/metadetails/${type}/${metaId}/${videoId}` : null;
    const fallbackPlayer = null;

    if (!deepLinks || typeof deepLinks !== 'object') {
        return {
            metaDetailsStreams: null,
            metaDetailsVideos: fallbackMetaDetailsVideos,
            player: fallbackPlayer,
        };
    }

    return {
        metaDetailsStreams: typeof deepLinks.metaDetailsStreams === 'string' ? deepLinks.metaDetailsStreams : null,
        metaDetailsVideos: normalizeVideoScopedHref(
            typeof deepLinks.metaDetailsVideos === 'string' ? deepLinks.metaDetailsVideos : null,
            videoId,
            fallbackMetaDetailsVideos
        ),
        player: normalizeVideoScopedHref(
            typeof deepLinks.player === 'string' ? deepLinks.player : null,
            videoId,
            fallbackPlayer
        ),
    };
}

function normalizeEntry(entry) {
    if (!entry || typeof entry !== 'object') {
        return null;
    }

    const metaId = typeof entry.metaId === 'string' ? entry.metaId : '';
    const type = typeof entry.type === 'string' ? entry.type : '';
    const name = typeof entry.name === 'string' ? entry.name : '';

    if (!metaId || !type || !name) {
        return null;
    }

    const duration = Number(entry.duration);
    const timeOffset = Number(entry.timeOffset);
    const normalizedDuration = Number.isFinite(duration) && duration > 0 ? Math.round(duration) : 0;
    const normalizedTimeOffset = Number.isFinite(timeOffset) && timeOffset > 0 ? Math.round(timeOffset) : 0;
    const normalizedProgress = normalizedDuration > 0
        ? Math.max(0, Math.min(100, Math.round((normalizedTimeOffset / normalizedDuration) * 100)))
        : 0;
    const resumeFromStart = entry.resumeFromStart === true;

    return {
        metaId,
        type,
        libraryItemId: typeof entry.libraryItemId === 'string' ? entry.libraryItemId : null,
        videoId: typeof entry.videoId === 'string' ? entry.videoId : null,
        videoReleased: typeof entry.videoReleased === 'string' ? entry.videoReleased : null,
        name,
        poster: typeof entry.poster === 'string' ? entry.poster : null,
        posterShape: typeof entry.posterShape === 'string' ? entry.posterShape : 'poster',
        releaseInfo: typeof entry.releaseInfo === 'string' ? entry.releaseInfo : null,
        deepLinks: normalizeDeepLinks(entry),
        duration: normalizedDuration,
        timeOffset: normalizedTimeOffset,
        progress: normalizedProgress,
        resumeFromStart,
        completed: entry.completed === true || (!resumeFromStart && normalizedProgress >= 100),
        updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : new Date().toISOString(),
    };
}

function sortEntries(entries) {
    return [...entries].sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt));
}

function toPreviewItem(entry) {
    return {
        _id: entry.libraryItemId,
        id: entry.metaId,
        type: entry.type,
        name: entry.name,
        poster: entry.poster,
        posterShape: entry.posterShape,
        releaseInfo: entry.releaseInfo,
        progress: entry.progress,
        watched: false,
        deepLinks: entry.deepLinks,
        c4kProfileHistory: true,
    };
}

function createProfileContinueWatchingStore(options = {}) {
    const storage = options.storage || defaultStorage();
    const eventTarget = Object.prototype.hasOwnProperty.call(options, 'eventTarget') ? options.eventTarget : defaultEventTarget();

    function getEntries({ auth, profileId }) {
        const scope = getProfileScope(storage, auth, profileId);
        if (!scope) {
            return [];
        }

        const entries = readJson(storage, getScopedStorageKey(scope), []);
        return Array.isArray(entries)
            ? sortEntries(entries.map(normalizeEntry).filter(Boolean))
            : [];
    }

    function writeEntries({ auth, profileId, entries }) {
        const scope = getProfileScope(storage, auth, profileId);
        if (!scope) {
            return;
        }

        writeJson(storage, getScopedStorageKey(scope), sortEntries(entries));
        emitProfileContinueWatchingChange(eventTarget);
    }

    function getPreview({ auth, profileId }) {
        return {
            items: getEntries({ auth, profileId })
                .filter((entry) => !entry.completed && (entry.timeOffset > 0 || entry.resumeFromStart))
                .map(toPreviewItem),
        };
    }

    function upsertEntry({ auth, profileId, entry }) {
        const normalizedEntry = normalizeEntry(entry);
        if (!normalizedEntry) {
            return null;
        }

        const currentEntries = getEntries({ auth, profileId });
        const nextEntries = currentEntries.filter((item) => !(item.metaId === normalizedEntry.metaId && item.type === normalizedEntry.type));
        nextEntries.push({
            ...normalizedEntry,
            updatedAt: new Date().toISOString(),
        });
        writeEntries({ auth, profileId, entries: nextEntries });
        return normalizedEntry;
    }

    function markCompleted({ auth, profileId, metaId, type }) {
        const currentEntries = getEntries({ auth, profileId });
        const nextEntries = currentEntries.map((entry) => (
            entry.metaId === metaId && entry.type === type
                ? {
                    ...entry,
                    completed: true,
                    progress: 100,
                    updatedAt: new Date().toISOString(),
                }
                : entry
        ));

        writeEntries({ auth, profileId, entries: nextEntries });
        return true;
    }

    function dismissEntry({ auth, profileId, metaId, type }) {
        const currentEntries = getEntries({ auth, profileId });
        const nextEntries = currentEntries.filter((entry) => !(entry.metaId === metaId && entry.type === type));
        writeEntries({ auth, profileId, entries: nextEntries });
        return currentEntries.length !== nextEntries.length;
    }

    function resolveResumeTime({ auth, profileId, libraryItemId, metaId, type, videoId, fallbackTime = 0 }) {
        const matchingEntry = getEntries({ auth, profileId }).find((entry) => {
            const sameLibraryItem = libraryItemId && entry.libraryItemId ? entry.libraryItemId === libraryItemId : false;
            const sameMetaVideo = typeof metaId === 'string' && typeof type === 'string'
                ? entry.metaId === metaId && entry.type === type && entry.videoId === videoId
                : false;

            return !entry.completed && entry.videoId === videoId && (sameLibraryItem || sameMetaVideo);
        });

        return matchingEntry ? matchingEntry.timeOffset : fallbackTime;
    }

    return {
        dismissEntry,
        getEntries,
        getPreview,
        markCompleted,
        resolveResumeTime,
        upsertEntry,
    };
}

module.exports = {
    PROFILE_CONTINUE_WATCHING_EVENT,
    createProfileContinueWatchingStore,
};
