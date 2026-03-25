// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { withCoreSuspender } = require('stremio/common');
const { extractAccentFromAvatar } = require('../../common/useAvatarAccentColor');
const PinModal = require('./PinModal/PinModal');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

const AVAILABLE_AVATARS = [
    require('../../../assets/images/avatars/c4k-avatar-1.png'),
    require('../../../assets/images/avatars/c4k-avatar-2.png'),
    require('../../../assets/images/avatars/c4k-avatar-3.png'),
    require('../../../assets/images/avatars/c4k-avatar-4.png'),
    require('../../../assets/images/avatars/c4k-avatar-5.png'),
    require('../../../assets/images/avatars/c4k-avatar-6.png'),
    require('../../../assets/images/avatars/c4k-avatar-7.png'),
    require('../../../assets/images/avatars/c4k-avatar-8.png'),
    require('../../../assets/images/avatars/c4k-avatar-9.png'),
    require('../../../assets/images/avatars/c4k-avatar-10.png'),
    require('../../../assets/images/avatars/c4k-avatar-11.png'),
    require('../../../assets/images/avatars/c4k-avatar-12.png'),
    require('../../../assets/images/avatars/c4k-avatar-13.png'),
    require('../../../assets/images/avatars/c4k-avatar-14.png'),
    require('../../../assets/images/avatars/c4k-avatar-15.png'),
    require('../../../assets/images/avatars/c4k-avatar-16.png'),
    require('../../../assets/images/avatars/c4k-avatar-17.png'),
    require('../../../assets/images/avatars/c4k-avatar-18.png'),
    require('../../../assets/images/avatars/c4k-avatar-19.png'),
    require('../../../assets/images/avatars/c4k-avatar-20.png'),
];

const LOCAL_STORAGE_KEY = 'c4k_profiles';

// Dominant accent color per avatar — fallback when Canvas extraction hasn't run yet
const AVATAR_ACCENTS = [
    '#7ecec4', // 1  — teal
    '#f48fb0', // 2  — pink
    '#f5d76e', // 3  — yellow
    '#f0a050', // 4  — orange
    '#c3a8e0', // 5  — lavender
    '#9ccf6c', // 6  — green
    '#f07070', // 7  — coral red
    '#6bb8de', // 8  — blue
    '#b59fd9', // 9  — purple
    '#f0a080', // 10 — peach
    '#5bbfb5', // 11 — teal
    '#e87aa3', // 12 — pink
    '#f0d040', // 13 — yellow
    '#f5a838', // 14 — orange
    '#9478c3', // 15 — purple
    '#86b868', // 16 — sage green
    '#7ab3d8', // 17 — blue
    '#d47890', // 18 — rose
    '#8fad8a', // 19 — muted green
    '#e88070', // 20 — coral
];

// Returns true if a profile has a stored PIN
const isProfileLocked = (profileId) =>
    !!localStorage.getItem(`c4k_profile_pin_${profileId}`);

const Profiles = () => {
    const [profiles, setProfiles] = React.useState([]);
    const [view, setView] = React.useState('select'); // 'select' | 'add'
    const [newName, setNewName] = React.useState('');
    const [newAvatarIndex, setNewAvatarIndex] = React.useState(0);
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const [isExiting, setIsExiting] = React.useState(false);
    const [pinModalProfile, setPinModalProfile] = React.useState(null); // profile awaiting PIN

    // Phase 3: track which profile is active (persisted across page opens)
    const [selectedProfileId, setSelectedProfileId] = React.useState(() => {
        return localStorage.getItem('c4k_active_profile_id') || null;
    });

    // Phase 2: Canvas-extracted accent colors, keyed by avatarIndex
    // extractionAttempted ref prevents duplicate Canvas operations
    const [extractedAccents, setExtractedAccents] = React.useState({});
    const extractionAttempted = React.useRef({});

    React.useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
            if (Array.isArray(stored)) {
                setProfiles(stored);
            }
        } catch (e) {
            console.error('Failed to parse profiles', e);
        }
    }, []);

    // Phase 3: once profiles load, set focusedIndex to the currently active profile
    React.useEffect(() => {
        if (profiles.length === 0 || !selectedProfileId) return;
        const idx = profiles.findIndex((p) => p.id === selectedProfileId);
        if (idx !== -1) setFocusedIndex(idx);
    }, [profiles.length, selectedProfileId]);

    // Keyboard navigation in select view
    React.useEffect(() => {
        if (view !== 'select') return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') {
                setFocusedIndex((i) => Math.max(0, i - 1));
            } else if (e.key === 'ArrowRight') {
                const max = profiles.length < 4 ? profiles.length : profiles.length - 1;
                setFocusedIndex((i) => Math.min(max, i + 1));
            } else if (e.key === 'Enter') {
                if (focusedIndex < profiles.length) {
                    const p = profiles[focusedIndex];
                    if (isProfileLocked(p.id)) {
                        setPinModalProfile(p);
                    } else {
                        doSelectProfile(p);
                    }
                } else {
                    setView('add');
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [view, profiles, focusedIndex]);

    const saveProfiles = (updated) => {
        setProfiles(updated);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    };

    const handleCreateProfile = () => {
        if (!newName.trim()) return;
        const newProfile = {
            id: Date.now().toString(),
            name: newName.trim(),
            avatarIndex: newAvatarIndex
        };
        const updated = [...profiles, newProfile];
        saveProfiles(updated);
        setNewName('');
        setNewAvatarIndex(0);
        setView('select');
    };

    const handleDeleteProfile = (e, profileId) => {
        e.stopPropagation();
        const updated = profiles.filter((p) => p.id !== profileId);
        if (focusedIndex >= updated.length) {
            setFocusedIndex(Math.max(0, updated.length - 1));
        }
        saveProfiles(updated);
    };

    const getAvatarUrl = (p) =>
        p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar;

    // Phase 2: get per-card CSS variables — extracted first, fallback to AVATAR_ACCENTS
    const hexToRgba = (hex, alpha) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    const getAccentStyle = React.useCallback((p) => {
        const extracted = extractedAccents[p.avatarIndex];
        if (extracted) {
            const { h, s, l } = extracted.hsl;
            return {
                '--accent': extracted.accent,
                '--accent-rgba': `hsla(${h}, ${s}%, ${l}%, 0.28)`,
            };
        }
        // Fallback to manually curated AVATAR_ACCENTS
        const hex = p.avatarIndex !== undefined
            ? (AVATAR_ACCENTS[p.avatarIndex] || '#fff')
            : '#fff';
        return {
            '--accent': hex,
            '--accent-rgba': hexToRgba(hex, 0.28),
        };
    }, [extractedAccents]);

    // Phase 2: trigger Canvas extraction on first hover; cache result in state
    const handleCardMouseEnter = React.useCallback((p, i) => {
        setFocusedIndex(i);
        const key = p.avatarIndex;
        if (extractionAttempted.current[key] !== undefined) return;
        extractionAttempted.current[key] = true;
        const url = getAvatarUrl(p);
        extractAccentFromAvatar(url).then((accent) => {
            if (accent) {
                setExtractedAccents((prev) => ({ ...prev, [key]: accent }));
            }
        });
    }, []);

    // Phase 2 + 3: apply accent to CSS variables AND persist selected profile
    const doSelectProfile = React.useCallback((profile) => {
        setIsExiting(true);
        setSelectedProfileId(profile.id);

        // Persist selected profile ID immediately (Phase 3)
        localStorage.setItem('c4k_active_profile_id', profile.id);

        // Apply accent from extraction cache if available; otherwise extract now
        const applyAccent = (accent) => {
            if (!accent) return;
            document.documentElement.style.setProperty('--primary-accent-color', accent.accent);
            document.documentElement.style.setProperty('--outer-glow', accent.glow);
            document.documentElement.style.setProperty('--accent-dark', accent.accentDark);
            localStorage.setItem('c4k_active_profile_accent', JSON.stringify(accent));
        };

        const cached = extractedAccents[profile.avatarIndex];
        if (cached) {
            applyAccent(cached);
        } else {
            extractAccentFromAvatar(getAvatarUrl(profile)).then(applyAccent);
        }

        setTimeout(() => {
            localStorage.setItem('c4k_current_profile', JSON.stringify(profile));
            window.dispatchEvent(new Event('c4k-profile-changed'));
            window.location.hash = '#/';
        }, 400);
    }, [extractedAccents]);

    return (
        <div className={classnames(styles['profiles-page'], { [styles['exiting']]: isExiting })}>

            {/* PIN unlock modal for locked profiles */}
            {pinModalProfile && (
                <PinModal
                    mode="unlock"
                    profileId={pinModalProfile.id}
                    onSuccess={() => {
                        const p = pinModalProfile;
                        setPinModalProfile(null);
                        doSelectProfile(p);
                    }}
                    onCancel={() => setPinModalProfile(null)}
                />
            )}

            {view === 'select' && (
                <div className={styles['select-view']}>
                    {/* Logo at top */}
                    <div className={styles['brand-header']}>
                        <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
                    </div>

                    <h1 className={styles['heading']}>Who&apos;s watching?</h1>

                    {/* Single row of profile cards */}
                    <div className={styles['profiles-row']}>
                        {profiles.map((p, i) => (
                            <div
                                key={p.id}
                                className={classnames(
                                    styles['profile-card'],
                                    { [styles['focused']]: i === focusedIndex },
                                    { [styles['selected']]: p.id === selectedProfileId },
                                    { [styles['locked']]: isProfileLocked(p.id) }
                                )}
                                style={getAccentStyle(p)}
                                onMouseEnter={() => handleCardMouseEnter(p, i)}
                                onClick={() => {
                                    if (isProfileLocked(p.id)) {
                                        setPinModalProfile(p);
                                    } else {
                                        doSelectProfile(p);
                                    }
                                }}
                            >
                                <div
                                    className={styles['profile-avatar']}
                                    style={{ backgroundImage: `url(${getAvatarUrl(p)})` }}
                                />
                                {/* Padlock overlay — visible when profile is locked */}
                                {isProfileLocked(p.id) && (
                                    <div className={styles['lock-overlay']}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                )}
                                <span className={styles['profile-name']}>{p.name}</span>
                                {p.id === selectedProfileId && (
                                    <span className={styles['active-badge']}>Active</span>
                                )}
                            </div>
                        ))}

                        {profiles.length < 4 && (
                            <div
                                className={classnames(styles['profile-card'], styles['add-card'], {
                                    [styles['focused']]: focusedIndex === profiles.length
                                })}
                                onMouseEnter={() => setFocusedIndex(profiles.length)}
                                onClick={() => setView('add')}
                            >
                                <div className={styles['add-avatar']}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </div>
                                <span className={styles['profile-name']}>Add Profile</span>
                            </div>
                        )}
                    </div>

                    <div className={styles['bottom-bar']}>
                        <Button className={styles['settings-btn']} href="#/settings">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                            Settings
                        </Button>
                    </div>
                </div>
            )}

            {view === 'add' && (
                <div className={styles['add-view']}>
                    <div className={styles['brand-header']}>
                        <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
                    </div>

                    <div className={styles['add-split']}>
                        {/* ── LEFT PANEL: big preview + name + buttons ── */}
                        <div className={styles['add-left']}>
                            <div
                                className={styles['preview-circle']}
                                style={{ backgroundImage: `url(${AVAILABLE_AVATARS[newAvatarIndex]})` }}
                            />

                            <input
                                className={styles['name-input']}
                                placeholder="Enter a name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && newName.trim() && handleCreateProfile()}
                                maxLength={20}
                                autoFocus
                            />

                            <div className={styles['add-actions']}>
                                <Button
                                    className={classnames(styles['action-btn'], styles['primary-btn'])}
                                    onClick={handleCreateProfile}
                                    disabled={!newName.trim()}
                                >
                                    Create Profile
                                </Button>
                                <Button
                                    className={classnames(styles['action-btn'], styles['ghost-btn'])}
                                    onClick={() => { setNewName(''); setView('select'); }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>

                        {/* ── RIGHT PANEL: 5×4 avatar grid ── */}
                        <div className={styles['add-right']}>
                            <p className={styles['add-sub']}>Choose an avatar</p>
                            <div className={styles['avatar-grid']}>
                                {AVAILABLE_AVATARS.map((url, i) => (
                                    <div
                                        key={i}
                                        className={classnames(styles['grid-avatar'], { [styles['selected']]: i === newAvatarIndex })}
                                        style={{ backgroundImage: `url(${url})` }}
                                        onClick={() => setNewAvatarIndex(i)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ProfilesFallback = () => (
    <div className={styles['profiles-page']} />
);

module.exports = withCoreSuspender(Profiles, ProfilesFallback);
