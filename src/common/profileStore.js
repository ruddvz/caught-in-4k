const { supabase: defaultSupabaseClient, isSupabaseConfigured: defaultIsSupabaseConfigured } = require('./supabaseClient');
const { hashSecurityCode, validateSecurityCode, verifySecurityAction } = require('./profileSecurity');

const ACTIVE_PROFILE_KEY = 'c4k_active_profile_id';
const CURRENT_PROFILE_KEY = 'c4k_current_profile';
const LEGACY_MASTER_CODE_KEY = 'c4k_master_code_hash';
const LEGACY_PROFILE_PIN_KEY_PREFIX = 'c4k_profile_pin_';
const LEGACY_PROFILES_KEY = 'c4k_profiles';
const MAX_PROFILES = 4;
const PROFILE_CHANGE_EVENT = 'c4k-profile-changed';
const SCOPED_PROFILE_STORE_KEY_PREFIX = 'c4k_profile_store_v2:';

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

function getProfileScope(auth) {
    return auth?.user?.id || 'guest';
}

function getScopedStoreKey(scope) {
    return `${SCOPED_PROFILE_STORE_KEY_PREFIX}${scope}`;
}

function getScopedActiveProfileKey(scope) {
    return `${ACTIVE_PROFILE_KEY}:${scope}`;
}

function getScopedCurrentProfileKey(scope) {
    return `${CURRENT_PROFILE_KEY}:${scope}`;
}

function createProfileId() {
    return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeAvatarIndex(avatarIndex) {
    const numericAvatarIndex = Number(avatarIndex);
    return Number.isInteger(numericAvatarIndex) && numericAvatarIndex >= 0 ? numericAvatarIndex : 0;
}

function normalizeProfileName(name) {
    return typeof name === 'string' ? name.trim() : '';
}

function validateProfileName(name) {
    const normalizedName = normalizeProfileName(name);

    if (!normalizedName) {
        return { valid: false, error: 'Profiles need a name.' };
    }

    if (normalizedName.length > 20) {
        return { valid: false, error: 'Profile names must be 20 characters or fewer.' };
    }

    return { valid: true, normalizedName };
}

function readJson(storage, key, fallbackValue) {
    if (!storage) {
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
    if (!storage) {
        return;
    }

    storage.setItem(key, JSON.stringify(value));
}

function getLegacyPinKey(profileId) {
    return `${LEGACY_PROFILE_PIN_KEY_PREFIX}${profileId}`;
}

function createEmptyState() {
    return {
        profiles: [],
        masterCodeHash: null,
        hasMasterCode: false,
    };
}

function normalizeLocalProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        return null;
    }

    const profileId = typeof profile.id === 'string' ? profile.id : String(profile.id || '');
    const profileName = normalizeProfileName(profile.name);

    if (!profileId || !profileName) {
        return null;
    }

    return {
        id: profileId,
        name: profileName,
        avatarIndex: normalizeAvatarIndex(profile.avatarIndex),
        hasPin: typeof profile.hasPin === 'boolean'
            ? profile.hasPin
            : typeof profile.pinHash === 'string' && profile.pinHash.length > 0,
        pinHash: typeof profile.pinHash === 'string' && profile.pinHash.length > 0 ? profile.pinHash : null,
        createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : null,
        updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : null,
    };
}

function toPublicProfile(profile) {
    return {
        id: profile.id,
        name: profile.name,
        avatarIndex: profile.avatarIndex,
        hasPin: Boolean(profile.hasPin || (typeof profile.pinHash === 'string' && profile.pinHash.length > 0)),
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
    };
}

function buildLegacyState(storage) {
    const legacyProfiles = readJson(storage, LEGACY_PROFILES_KEY, []);
    const normalizedProfiles = Array.isArray(legacyProfiles)
        ? legacyProfiles.map((profile) => normalizeLocalProfile({
            id: profile.id,
            name: profile.name,
            avatarIndex: profile.avatarIndex,
            pinHash: storage ? storage.getItem(getLegacyPinKey(profile.id)) : null,
        })).filter(Boolean)
        : [];

    return {
        profiles: normalizedProfiles,
        masterCodeHash: storage ? storage.getItem(LEGACY_MASTER_CODE_KEY) : null,
        hasMasterCode: Boolean(storage ? storage.getItem(LEGACY_MASTER_CODE_KEY) : null),
    };
}

function readScopedState(storage, scope, options = {}) {
    const fallbackState = createEmptyState();
    if (!storage) {
        return fallbackState;
    }

    const allowLegacyBootstrap = options.allowLegacyBootstrap === true || (options.allowLegacyBootstrap !== false && scope === 'guest');

    const storedState = readJson(storage, getScopedStoreKey(scope), null);
    if (storedState && Array.isArray(storedState.profiles)) {
        return {
            profiles: storedState.profiles.map(normalizeLocalProfile).filter(Boolean),
            masterCodeHash: typeof storedState.masterCodeHash === 'string' ? storedState.masterCodeHash : null,
            hasMasterCode: typeof storedState.hasMasterCode === 'boolean'
                ? storedState.hasMasterCode
                : Boolean(storedState.masterCodeHash),
        };
    }

    if (!allowLegacyBootstrap) {
        return fallbackState;
    }

    const legacyState = buildLegacyState(storage);
    writeJson(storage, getScopedStoreKey(scope), legacyState);
    return legacyState;
}

function writeScopedState(storage, scope, state) {
    if (!storage) {
        return;
    }

    writeJson(storage, getScopedStoreKey(scope), {
        profiles: state.profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            avatarIndex: profile.avatarIndex,
            hasPin: Boolean(profile.hasPin || profile.pinHash),
            pinHash: profile.pinHash,
            createdAt: profile.createdAt,
            updatedAt: profile.updatedAt,
        })),
        masterCodeHash: state.masterCodeHash,
        hasMasterCode: Boolean(state.hasMasterCode || state.masterCodeHash),
    });
}

function clearActiveProfileIfDeleted(storage, profileId) {
    if (!storage) {
        return;
    }

    const activeProfileId = storage.getItem(ACTIVE_PROFILE_KEY);
    if (activeProfileId === profileId) {
        storage.removeItem(ACTIVE_PROFILE_KEY);
        storage.removeItem(CURRENT_PROFILE_KEY);
    }
}

function clearScopedActiveProfile(storage, scope, profileId = null) {
    if (!storage) {
        return;
    }

    const activeProfileKey = getScopedActiveProfileKey(scope);
    const currentProfileKey = getScopedCurrentProfileKey(scope);
    const activeProfileId = storage.getItem(activeProfileKey);

    if (profileId === null || activeProfileId === profileId) {
        storage.removeItem(activeProfileKey);
        storage.removeItem(currentProfileKey);
    }

    if (scope === 'guest') {
        clearActiveProfileIfDeleted(storage, profileId === null ? storage.getItem(ACTIVE_PROFILE_KEY) : profileId);
    }
}

function getSelectedProfileId(storage, auth) {
    if (!storage) {
        return null;
    }

    const scope = getProfileScope(auth);
    const scopedProfileId = storage.getItem(getScopedActiveProfileKey(scope));
    if (scopedProfileId) {
        return scopedProfileId;
    }

    return scope === 'guest' ? storage.getItem(ACTIVE_PROFILE_KEY) : null;
}

function getCurrentProfile(storage, auth) {
    if (!storage) {
        return null;
    }

    const scope = getProfileScope(auth);
    const scopedProfile = storage.getItem(getScopedCurrentProfileKey(scope));
    if (scopedProfile) {
        return scopedProfile;
    }

    return scope === 'guest' ? storage.getItem(CURRENT_PROFILE_KEY) : null;
}

function emitProfileChange(eventTarget) {
    if (!eventTarget || typeof eventTarget.dispatchEvent !== 'function' || typeof Event === 'undefined') {
        return;
    }

    eventTarget.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
}

function canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured }) {
    return Boolean(auth?.user?.id && supabaseClient && isSupabaseConfigured());
}

async function fetchRemoteProfiles(auth, supabaseClient) {
    const { data, error } = await supabaseClient.rpc('list_current_user_profiles');

    if (error) {
        throw new Error(error.message);
    }

    return Array.isArray(data)
        ? data.map((profile) => normalizeLocalProfile({
            id: profile.id,
            name: profile.name,
            avatarIndex: profile.avatar_index,
            hasPin: Boolean(profile.has_pin),
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
        })).filter(Boolean)
        : [];
}

function createProfileStore(options = {}) {
    const storage = options.storage || defaultStorage();
    const eventTarget = Object.prototype.hasOwnProperty.call(options, 'eventTarget') ? options.eventTarget : defaultEventTarget();
    const supabaseClient = Object.prototype.hasOwnProperty.call(options, 'supabaseClient') ? options.supabaseClient : defaultSupabaseClient;
    const isSupabaseConfigured = typeof options.isSupabaseConfigured === 'function'
        ? options.isSupabaseConfigured
        : defaultIsSupabaseConfigured;

    async function loadProfiles({ auth }) {
        const scope = getProfileScope(auth);

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            try {
                const remoteProfiles = await fetchRemoteProfiles(auth, supabaseClient);
                const hasMasterCode = typeof auth?.profile?.has_master_code === 'boolean'
                    ? auth.profile.has_master_code
                    : false;

                writeScopedState(storage, scope, {
                    profiles: remoteProfiles,
                    masterCodeHash: null,
                    hasMasterCode,
                });

                return remoteProfiles.map(toPublicProfile);
            } catch (error) {
                console.warn('[ProfileStore] Falling back to local profiles:', error.message);
            }
        }

        return readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' }).profiles.map(toPublicProfile);
    }

    async function createProfile({ auth, name, avatarIndex, pinCode }) {
        const nameValidation = validateProfileName(name);
        if (!nameValidation.valid) {
            throw new Error(nameValidation.error);
        }

        const codeValidation = validateSecurityCode(pinCode);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.error);
        }

        const scope = getProfileScope(auth);
        const nextProfile = {
            id: createProfileId(),
            name: nameValidation.normalizedName,
            avatarIndex: normalizeAvatarIndex(avatarIndex),
            pinHash: hashSecurityCode(pinCode),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { error } = await supabaseClient.rpc('create_current_user_profile', {
                p_profile_id: nextProfile.id,
                p_name: nextProfile.name,
                p_avatar_index: nextProfile.avatarIndex,
                p_pin_code: pinCode,
            });

            if (error) {
                throw new Error(error.message);
            }

            await loadProfiles({ auth });
            emitProfileChange(eventTarget);
            return toPublicProfile(nextProfile);
        }

        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        if (currentState.profiles.length >= MAX_PROFILES) {
            throw new Error(`Only ${MAX_PROFILES} profiles are supported.`);
        }

        const nextState = {
            ...currentState,
            profiles: [...currentState.profiles, nextProfile],
        };
        writeScopedState(storage, scope, nextState);
        emitProfileChange(eventTarget);
        return toPublicProfile(nextProfile);
    }

    async function hasMasterCodeConfigured({ auth }) {
        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            if (typeof auth?.profile?.has_master_code === 'boolean') {
                return auth.profile.has_master_code;
            }

            try {
                const { data, error } = await supabaseClient
                    .from('users')
                    .select('has_master_code')
                    .eq('id', auth.user.id)
                    .single();

                if (error) {
                    throw new Error(error.message);
                }

                const scope = getProfileScope(auth);
                const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: false });
                writeScopedState(storage, scope, {
                    ...currentState,
                    masterCodeHash: null,
                    hasMasterCode: Boolean(data?.has_master_code),
                });
                return Boolean(data?.has_master_code);
            } catch (error) {
                console.warn('[ProfileStore] Falling back to local master code state:', error.message);
            }
        }

        const scope = getProfileScope(auth);
        const state = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        return Boolean(state.hasMasterCode || state.masterCodeHash);
    }

    async function setMasterCode({ auth, code }) {
        const codeValidation = validateSecurityCode(code);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.error);
        }

        const hashedCode = hashSecurityCode(code);

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { error } = await supabaseClient.rpc('set_current_user_master_code', {
                p_code: code,
            });

            if (error) {
                throw new Error(error.message);
            }
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        if (currentState.hasMasterCode || currentState.masterCodeHash) {
            throw new Error('Master code already exists.');
        }

        writeScopedState(storage, scope, {
            ...currentState,
            masterCodeHash: canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured }) ? null : hashedCode,
            hasMasterCode: true,
        });
        emitProfileChange(eventTarget);
        return true;
    }

    async function rotateMasterCode({ auth, currentCode, nextCode }) {
        const currentValidation = validateSecurityCode(currentCode);
        if (!currentValidation.valid) {
            return false;
        }

        const nextValidation = validateSecurityCode(nextCode);
        if (!nextValidation.valid) {
            throw new Error(nextValidation.error);
        }

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { data, error } = await supabaseClient.rpc('rotate_current_user_master_code', {
                p_current_code: currentCode,
                p_next_code: nextCode,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (!data) {
                return false;
            }

            const scope = getProfileScope(auth);
            const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: false });
            writeScopedState(storage, scope, {
                ...currentState,
                masterCodeHash: null,
                hasMasterCode: true,
            });
            emitProfileChange(eventTarget);
            return true;
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        const authorized = verifySecurityAction({
            mode: 'master-verify',
            code: currentCode,
            masterHash: currentState.masterCodeHash,
        });

        if (!authorized) {
            return false;
        }

        writeScopedState(storage, scope, {
            ...currentState,
            masterCodeHash: hashSecurityCode(nextCode),
            hasMasterCode: true,
        });
        emitProfileChange(eventTarget);
        return true;
    }

    async function verifyMasterCode({ auth, code }) {
        const codeValidation = validateSecurityCode(code);
        if (!codeValidation.valid) {
            return false;
        }

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { data, error } = await supabaseClient.rpc('verify_current_user_master_code', {
                p_code: code,
            });

            if (error) {
                throw new Error(error.message);
            }

            return Boolean(data);
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        return verifySecurityAction({
            mode: 'delete',
            code,
            masterHash: currentState.masterCodeHash,
        });
    }

    async function verifyProfilePin({ auth, profileId, code }) {
        const codeValidation = validateSecurityCode(code);
        if (!codeValidation.valid) {
            return false;
        }

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { data, error } = await supabaseClient.rpc('verify_current_user_profile_pin', {
                p_profile_id: profileId,
                p_code: code,
            });

            if (error) {
                throw new Error(error.message);
            }

            return Boolean(data);
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        const profile = currentState.profiles.find((item) => item.id === profileId);
        return verifySecurityAction({
            mode: 'unlock',
            code,
            profileHash: profile?.pinHash || null,
        });
    }

    async function setProfilePin({ auth, profileId, pinCode }) {
        const codeValidation = validateSecurityCode(pinCode);
        if (!codeValidation.valid) {
            throw new Error(codeValidation.error);
        }

        const pinHash = hashSecurityCode(pinCode);

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { error } = await supabaseClient.rpc('set_current_user_profile_pin', {
                p_profile_id: profileId,
                p_pin_code: pinCode,
            });

            if (error) {
                throw new Error(error.message);
            }

            await loadProfiles({ auth });
            emitProfileChange(eventTarget);
            return true;
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        const profileExists = currentState.profiles.some((profile) => profile.id === profileId);
        if (!profileExists) {
            throw new Error('Profile not found.');
        }

        const existingProfile = currentState.profiles.find((profile) => profile.id === profileId);
        if (existingProfile?.hasPin || existingProfile?.pinHash) {
            throw new Error('Profile already has a PIN. Remove it before setting a new one.');
        }

        const nextProfiles = currentState.profiles.map((profile) => (
            profile.id === profileId
                ? { ...profile, hasPin: true, pinHash, updatedAt: new Date().toISOString() }
                : profile
        ));
        writeScopedState(storage, scope, { ...currentState, profiles: nextProfiles });
        emitProfileChange(eventTarget);
        return true;
    }

    async function clearProfilePin({ auth, profileId, code }) {
        const codeValidation = validateSecurityCode(code);
        if (!codeValidation.valid) {
            return false;
        }

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { data, error } = await supabaseClient.rpc('clear_current_user_profile_pin', {
                p_profile_id: profileId,
                p_code: code,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data) {
                await loadProfiles({ auth });
                emitProfileChange(eventTarget);
            }

            return Boolean(data);
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        const profile = currentState.profiles.find((item) => item.id === profileId);
        if (!profile) {
            return false;
        }

        const authorized = verifySecurityAction({
            mode: 'remove',
            code,
            profileHash: profile?.pinHash || null,
            masterHash: currentState.masterCodeHash,
        });

        if (!authorized) {
            return false;
        }

        const nextProfiles = currentState.profiles.map((item) => (
            item.id === profileId
                ? { ...item, hasPin: false, pinHash: null, updatedAt: new Date().toISOString() }
                : item
        ));
        writeScopedState(storage, scope, { ...currentState, profiles: nextProfiles });
        emitProfileChange(eventTarget);
        return true;
    }

    async function deleteProfile({ auth, profileId, masterCode }) {
        const codeValidation = validateSecurityCode(masterCode);
        if (!codeValidation.valid) {
            return false;
        }

        if (canUseRemoteProfiles({ auth, supabaseClient, isSupabaseConfigured })) {
            const { data, error } = await supabaseClient.rpc('delete_current_user_profile', {
                p_profile_id: profileId,
                p_master_code: masterCode,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data) {
                clearScopedActiveProfile(storage, getProfileScope(auth), profileId);
                await loadProfiles({ auth });
                emitProfileChange(eventTarget);
            }

            return Boolean(data);
        }

        const scope = getProfileScope(auth);
        const currentState = readScopedState(storage, scope, { allowLegacyBootstrap: scope === 'guest' });
        const profileExists = currentState.profiles.some((profile) => profile.id === profileId);
        if (!profileExists) {
            return false;
        }

        const authorized = verifySecurityAction({
            mode: 'delete',
            code: masterCode,
            masterHash: currentState.masterCodeHash,
        });

        if (!authorized) {
            return false;
        }

        const nextProfiles = currentState.profiles.filter((profile) => profile.id !== profileId);
        writeScopedState(storage, scope, { ...currentState, profiles: nextProfiles });
        clearScopedActiveProfile(storage, scope, profileId);
        emitProfileChange(eventTarget);
        return true;
    }

    function selectProfile(profile, auth = null) {
        if (!storage || !profile) {
            return;
        }

        const scope = getProfileScope(auth);

        storage.setItem(getScopedActiveProfileKey(scope), profile.id);
        storage.setItem(getScopedCurrentProfileKey(scope), JSON.stringify({
            id: profile.id,
            name: profile.name,
            avatarIndex: profile.avatarIndex,
        }));

        if (scope === 'guest') {
            storage.setItem(ACTIVE_PROFILE_KEY, profile.id);
            storage.setItem(CURRENT_PROFILE_KEY, JSON.stringify({
                id: profile.id,
                name: profile.name,
                avatarIndex: profile.avatarIndex,
            }));
        }
        emitProfileChange(eventTarget);
    }

    function clearProfileSelection(auth = null) {
        clearScopedActiveProfile(storage, getProfileScope(auth));
        emitProfileChange(eventTarget);
    }

    return {
        clearProfileSelection,
        createProfile,
        deleteProfile,
        hasMasterCodeConfigured,
        loadProfiles,
        selectProfile,
        rotateMasterCode,
        setMasterCode,
        setProfilePin,
        clearProfilePin,
        verifyMasterCode,
        verifyProfilePin,
    };
}

module.exports = {
    ACTIVE_PROFILE_KEY,
    CURRENT_PROFILE_KEY,
    LEGACY_MASTER_CODE_KEY,
    LEGACY_PROFILES_KEY,
    MAX_PROFILES,
    PROFILE_CHANGE_EVENT,
    getCurrentProfile,
    getSelectedProfileId,
    createProfileStore,
};
