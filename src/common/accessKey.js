/**
 * Invite-only access keys (build-time allowlist via C4K_ACCESS_KEYS).
 * When the allowlist is non-empty, the browser must unlock once per profile (localStorage).
 */

const STORAGE_KEY = 'c4k_access_verified_v3';

function readAllowedKeySet() {
    const raw = process.env.C4K_ACCESS_KEYS;
    if (!raw || typeof raw !== 'string') {
        return new Set();
    }
    const set = new Set();
    for (const piece of raw.split(',')) {
        const normalized = normalizeAccessKey(piece);
        if (normalized.length === 12) {
            set.add(normalized);
        }
    }
    return set;
}

let cachedEnvSnapshot;
let cachedSet = new Set();

function getAllowedKeySet() {
    const raw = process.env.C4K_ACCESS_KEYS;
    if (raw !== cachedEnvSnapshot) {
        cachedEnvSnapshot = raw;
        cachedSet = readAllowedKeySet();
    }
    return cachedSet;
}

function normalizeAccessKey(input) {
    return String(input === null || input === undefined ? '' : input).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function isAccessKeyGateEnabled() {
    return getAllowedKeySet().size > 0;
}

function isAccessKeyBrowserUnlocked() {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        return localStorage.getItem(STORAGE_KEY) === '1';
    } catch (_e) {
        return false;
    }
}

function setAccessKeyBrowserUnlocked() {
    if (typeof localStorage === 'undefined') {
        return false;
    }
    try {
        localStorage.setItem(STORAGE_KEY, '1');
        return true;
    } catch (_e) {
        return false;
    }
}

function verifyAccessKey(raw) {
    const normalized = normalizeAccessKey(raw);
    if (normalized.length !== 12) {
        return false;
    }
    return getAllowedKeySet().has(normalized);
}

module.exports = {
    STORAGE_KEY,
    normalizeAccessKey,
    isAccessKeyGateEnabled,
    isAccessKeyBrowserUnlocked,
    setAccessKeyBrowserUnlocked,
    verifyAccessKey,
};
