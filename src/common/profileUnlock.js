/**
 * Session-scoped profile PIN unlock state.
 * Unlocks persist until the browser tab/session ends.
 */

const SESSION_KEY = 'c4k_profile_unlock_ids';

function getStorage(storage) {
    if (storage) {
        return storage;
    }

    if (typeof sessionStorage !== 'undefined') {
        return sessionStorage;
    }

    return null;
}

function readUnlockedIds(storage) {
    const target = getStorage(storage);
    if (!target) {
        return [];
    }

    try {
        const raw = target.getItem(SESSION_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string' && id.length > 0) : [];
    } catch (_error) {
        return [];
    }
}

function writeUnlockedIds(ids, storage) {
    const target = getStorage(storage);
    if (!target) {
        return;
    }

    target.setItem(SESSION_KEY, JSON.stringify(ids));
}

function isProfileUnlocked(profileId, storage) {
    if (typeof profileId !== 'string' || profileId.length === 0) {
        return false;
    }

    return readUnlockedIds(storage).includes(profileId);
}

function markProfileUnlocked(profileId, storage) {
    if (typeof profileId !== 'string' || profileId.length === 0) {
        return;
    }

    const ids = readUnlockedIds(storage);
    if (!ids.includes(profileId)) {
        writeUnlockedIds([...ids, profileId], storage);
    }
}

function clearProfileUnlock(profileId, storage) {
    if (typeof profileId !== 'string' || profileId.length === 0) {
        return;
    }

    writeUnlockedIds(readUnlockedIds(storage).filter((id) => id !== profileId), storage);
}

function clearAllProfileUnlocks(storage) {
    const target = getStorage(storage);
    if (!target) {
        return;
    }

    target.removeItem(SESSION_KEY);
}

module.exports = {
    SESSION_KEY,
    isProfileUnlocked,
    markProfileUnlocked,
    clearProfileUnlock,
    clearAllProfileUnlocks,
};
