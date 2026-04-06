const { describe, expect, it } = require('@jest/globals');

const { createProfileStore } = require('../src/common/profileStore');
const { hashSecurityCode } = require('../src/common/profileSecurity');

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

describe('profile store local fallback', () => {
    it('imports legacy local profiles and locked pins into the unified store', async () => {
        const storage = createMemoryStorage();
        storage.setItem('c4k_profiles', JSON.stringify([{ id: 'p1', name: 'Kid', avatarIndex: 2 }]));
        storage.setItem('c4k_profile_pin_p1', hashSecurityCode('2642'));

        const store = createProfileStore({
            storage,
            eventTarget: null,
            supabaseClient: null,
            isSupabaseConfigured: () => false,
        });

        const profiles = await store.loadProfiles({ auth: null });

        expect(profiles).toEqual([
            expect.objectContaining({ id: 'p1', name: 'Kid', avatarIndex: 2, hasPin: true }),
        ]);
        expect(await store.verifyProfilePin({ auth: null, profileId: 'p1', code: '2642' })).toBe(true);
        expect(await store.verifyProfilePin({ auth: null, profileId: 'p1', code: '1111' })).toBe(false);
    });

    it('does not bootstrap authenticated scopes from guest legacy storage', async () => {
        const storage = createMemoryStorage();
        storage.setItem('c4k_profiles', JSON.stringify([{ id: 'p1', name: 'Kid', avatarIndex: 2 }]));
        storage.setItem('c4k_profile_pin_p1', hashSecurityCode('2642'));

        const store = createProfileStore({
            storage,
            eventTarget: null,
            supabaseClient: null,
            isSupabaseConfigured: () => false,
        });

        const profiles = await store.loadProfiles({ auth: { user: { id: 'user-123' } } });

        expect(profiles).toEqual([]);
    });

    it('requires the correct master code to delete a local profile', async () => {
        const storage = createMemoryStorage();
        const store = createProfileStore({
            storage,
            eventTarget: null,
            supabaseClient: null,
            isSupabaseConfigured: () => false,
        });

        await store.setMasterCode({ auth: null, code: '8972' });
        const profile = await store.createProfile({ auth: null, name: 'Riley', avatarIndex: 1, pinCode: '2642' });

        expect(await store.deleteProfile({ auth: null, profileId: profile.id, masterCode: '2642' })).toBe(false);
        expect(await store.deleteProfile({ auth: null, profileId: profile.id, masterCode: '8972' })).toBe(true);
    });

    it('requires the current master code to rotate a local master code', async () => {
        const storage = createMemoryStorage();
        const store = createProfileStore({
            storage,
            eventTarget: null,
            supabaseClient: null,
            isSupabaseConfigured: () => false,
        });

        await store.setMasterCode({ auth: null, code: '8972' });

        expect(await store.rotateMasterCode({ auth: null, currentCode: '1111', nextCode: '4444' })).toBe(false);
        expect(await store.rotateMasterCode({ auth: null, currentCode: '8972', nextCode: '4444' })).toBe(true);
        expect(await store.verifyMasterCode({ auth: null, code: '8972' })).toBe(false);
        expect(await store.verifyMasterCode({ auth: null, code: '4444' })).toBe(true);
    });

    it('rejects local master-code and profile-pin overwrites without the proper flow', async () => {
        const storage = createMemoryStorage();
        const store = createProfileStore({
            storage,
            eventTarget: null,
            supabaseClient: null,
            isSupabaseConfigured: () => false,
        });

        await store.setMasterCode({ auth: null, code: '8972' });
        const profile = await store.createProfile({ auth: null, name: 'Riley', avatarIndex: 1, pinCode: '2642' });

        await expect(store.setMasterCode({ auth: null, code: '4444' })).rejects.toThrow('Master code already exists.');
        await expect(store.setProfilePin({ auth: null, profileId: profile.id, pinCode: '1111' })).rejects.toThrow('Profile already has a PIN. Remove it before setting a new one.');
    });
});
