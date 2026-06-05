// Copyright (C) 2024 Caught In 4K
//
// localStorage-backed settings hook for C4K-specific options that don't live
// in the WASM core's profile.settings shape. Use this for client-only flags
// where round-tripping through the core would require schema changes.
//
// Currently exposes:
//   - externalPlayerFallback: when the internal player exhausts every
//     candidate (see useStreamFallback), automatically redirect to the user's
//     configured external player instead of showing the Error UI.

const React = require('react');

const STORAGE_KEY = 'c4k:settings';

const DEFAULTS = {
    externalPlayerFallback: false,
    gamepadNavigation: true,
};

const readSettings = () => {
    try {
        const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (!raw) return { ...DEFAULTS };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { ...DEFAULTS };
        return { ...DEFAULTS, ...parsed };
    } catch {
        return { ...DEFAULTS };
    }
};

const writeSettings = (settings) => {
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
    } catch {
        // localStorage unavailable / quota
    }
};

// Lightweight cross-component sync via storage event + custom event so toggles
// in Settings update Player.js mid-session without a remount.
const CHANGE_EVENT = 'c4k:settings:change';

const useC4KSettings = () => {
    const [settings, setSettings] = React.useState(readSettings);

    React.useEffect(() => {
        const onChange = () => setSettings(readSettings());
        window.addEventListener('storage', onChange);
        window.addEventListener(CHANGE_EVENT, onChange);
        return () => {
            window.removeEventListener('storage', onChange);
            window.removeEventListener(CHANGE_EVENT, onChange);
        };
    }, []);

    const updateSetting = React.useCallback((key, value) => {
        setSettings((prev) => {
            const next = { ...prev, [key]: value };
            writeSettings(next);
            try { window.dispatchEvent(new Event(CHANGE_EVENT)); } catch { /* ignore */ }
            return next;
        });
    }, []);

    return [settings, updateSetting];
};

module.exports = useC4KSettings;
