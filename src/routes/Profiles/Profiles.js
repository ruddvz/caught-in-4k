// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { navigateToAppHref } = require('stremio/common/navigation');
const { withCoreSuspender } = require('stremio/common');
const { useAuth } = require('stremio/common/AuthProvider');
const { PROFILE_CHANGE_EVENT, createProfileStore, getSelectedProfileId } = require('stremio/common/profileStore');
const { markProfileUnlocked } = require('stremio/common/profileUnlock');
const { extractAccentFromAvatar } = require('../../common/useAvatarAccentColor');
const AVAILABLE_AVATARS = require('../../common/profileAvatars');
const PinModal = require('./PinModal/PinModal');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

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

const Profiles = () => {
    const auth = useAuth();
    const profileStore = React.useMemo(() => createProfileStore(), []);
    const [profiles, setProfiles] = React.useState([]);
    const [view, setView] = React.useState('select'); // 'select' | 'add'
    const [newName, setNewName] = React.useState('');
    const [newAvatarIndex, setNewAvatarIndex] = React.useState(0);
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const [isExiting, setIsExiting] = React.useState(false);
    const [pinModalProfile, setPinModalProfile] = React.useState(null); // profile awaiting PIN
    const [createProfilePinOpen, setCreateProfilePinOpen] = React.useState(false);

    // Phase 3: track which profile is active (persisted across page opens)
    const [selectedProfileId, setSelectedProfileId] = React.useState(() => {
        return getSelectedProfileId(localStorage, auth) || null;
    });

    // Phase 2: Canvas-extracted accent colors, keyed by avatarIndex
    // extractionAttempted ref prevents duplicate Canvas operations
    const [extractedAccents, setExtractedAccents] = React.useState({});
    const extractionAttempted = React.useRef({});

    const refreshProfiles = React.useCallback(async () => {
        try {
            const nextProfiles = await profileStore.loadProfiles({ auth });
            setProfiles(nextProfiles);
            setSelectedProfileId(getSelectedProfileId(localStorage, auth) || null);
        } catch (error) {
            console.error('Failed to load profiles', error);
            setProfiles([]);
        }
    }, [auth, profileStore]);

    React.useEffect(() => {
        void refreshProfiles();

        const handleProfileChange = () => {
            void refreshProfiles();
        };

        window.addEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
        return () => window.removeEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
    }, [refreshProfiles]);

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
                    if (p.hasPin) {
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

    const handleCreateProfileRequest = React.useCallback(() => {
        if (!newName.trim()) return;
        setCreateProfilePinOpen(true);
    }, [newName]);

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
            profileStore.selectProfile(profile, auth);
            navigateToAppHref('/');
        }, 400);
    }, [auth, extractedAccents, profileStore]);

    return (
        <div className={classnames(styles['profiles-page'], { [styles['exiting']]: isExiting })}>

            {/* PIN unlock modal for locked profiles */}
            {pinModalProfile && (
                <PinModal
                    mode="unlock"
                    title={`Unlock ${pinModalProfile.name}`}
                    subtitle={`Enter ${pinModalProfile.name}'s 4-digit PIN`}
                    onSubmitCode={async (code) => {
                        try {
                            const isValid = await profileStore.verifyProfilePin({
                                auth,
                                profileId: pinModalProfile.id,
                                code,
                            });

                            if (!isValid) {
                                return false;
                            }

                            markProfileUnlocked(pinModalProfile.id);
                            doSelectProfile(pinModalProfile);
                            setPinModalProfile(null);
                            return true;
                        } catch (error) {
                            return error instanceof Error ? error.message : 'Failed to verify the profile PIN.';
                        }
                    }}
                    onCancel={() => setPinModalProfile(null)}
                />
            )}

            {createProfilePinOpen && (
                <PinModal
                    mode="set"
                    title="Set Profile PIN"
                    subtitle="Create a 4-digit PIN for this profile"
                    onSuccess={async (pinCode) => {
                        try {
                            await profileStore.createProfile({
                                auth,
                                name: newName,
                                avatarIndex: newAvatarIndex,
                                pinCode,
                            });
                            await refreshProfiles();
                            setCreateProfilePinOpen(false);
                            setNewName('');
                            setNewAvatarIndex(0);
                            setView('select');
                            return true;
                        } catch (error) {
                            return error.message || 'Failed to create profile.';
                        }
                    }}
                    onCancel={() => setCreateProfilePinOpen(false)}
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
                                    { [styles['locked']]: p.hasPin }
                                )}
                                style={getAccentStyle(p)}
                                onMouseEnter={() => handleCardMouseEnter(p, i)}
                                onClick={() => {
                                    if (p.hasPin) {
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
                                {p.hasPin && (
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
                        {auth && auth.isEntitled ? (
                            <span className={styles['sub-pill']}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.3rem' }}>
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {auth.hasActiveSubscription ? `${auth.daysRemaining}d left` : 'Admin access'}
                            </span>
                        ) : (
                            <Button className={styles['subscribe-btn']} onClick={() => navigateToAppHref('/subscribe')}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.4rem' }}>
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                                Subscribe
                            </Button>
                        )}
                        <Button className={styles['settings-btn']} onClick={() => navigateToAppHref('/guide')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                            Guide
                        </Button>
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
                                onKeyDown={(e) => e.key === 'Enter' && newName.trim() && handleCreateProfileRequest()}
                                maxLength={20}
                                autoFocus
                            />

                            <div className={styles['add-actions']}>
                                <Button
                                    className={classnames(styles['action-btn'], styles['primary-btn'])}
                                    onClick={handleCreateProfileRequest}
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
