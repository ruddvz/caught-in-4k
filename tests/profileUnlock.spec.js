const { describe, expect, it, beforeEach } = require('@jest/globals');

const {
    isProfileUnlocked,
    markProfileUnlocked,
    clearProfileUnlock,
    clearAllProfileUnlocks,
} = require('../src/common/profileUnlock');

function createMemorySessionStorage() {
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
    };
}

describe('profileUnlock session helpers', () => {
    let storage;

    beforeEach(() => {
        storage = createMemorySessionStorage();
    });

    it('tracks unlocked profile ids for the session', () => {
        expect(isProfileUnlocked('profile-a', storage)).toBe(false);

        markProfileUnlocked('profile-a', storage);
        expect(isProfileUnlocked('profile-a', storage)).toBe(true);
        expect(isProfileUnlocked('profile-b', storage)).toBe(false);
    });

    it('clears individual and all unlocks', () => {
        markProfileUnlocked('profile-a', storage);
        markProfileUnlocked('profile-b', storage);

        clearProfileUnlock('profile-a', storage);
        expect(isProfileUnlocked('profile-a', storage)).toBe(false);
        expect(isProfileUnlocked('profile-b', storage)).toBe(true);

        clearAllProfileUnlocks(storage);
        expect(isProfileUnlocked('profile-b', storage)).toBe(false);
    });
});
