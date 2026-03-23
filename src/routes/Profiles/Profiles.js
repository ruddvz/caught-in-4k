// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { withCoreSuspender } = require('stremio/common');
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

// Dominant accent color per avatar — matches the circle background in each avatar image
const AVATAR_ACCENTS = [
    '#7ecec4', // 1  — teal (winking girl with glasses)
    '#f48fb0', // 2  — pink (laughing guy)
    '#f5d76e', // 3  — yellow (blonde girl blowing kiss)
    '#f0a050', // 4  — orange (bearded guy with glasses)
    '#c3a8e0', // 5  — lavender (Indian girl)
    '#9ccf6c', // 6  — green (tongue-out guy)
    '#f07070', // 7  — coral red (hat guy with cap)
    '#6bb8de', // 8  — blue (curly hair, 3D glasses)
    '#b59fd9', // 9  — purple (red-hair girl)
    '#f0a080', // 10 — peach (waving glasses guy)
    '#5bbfb5', // 11 — teal (smart glasses guy)
    '#e87aa3', // 12 — pink (shushing girl)
    '#f0d040', // 13 — yellow (detective with magnifier)
    '#f5a838', // 14 — orange (tongue-out with red glasses)
    '#9478c3', // 15 — purple (old professor)
    '#86b868', // 16 — sage green (hijab girl)
    '#7ab3d8', // 17 — blue (beanie blue-hair)
    '#d47890', // 18 — rose (Indian girl with nose ring)
    '#8fad8a', // 19 — muted green (silver-hair grandma)
    '#e88070', // 20 — coral (cowboy hat)
];

const Profiles = () => {
    const [profiles, setProfiles] = React.useState([]);
    const [view, setView] = React.useState('select'); // 'select' | 'add'
    const [newName, setNewName] = React.useState('');
    const [newAvatarIndex, setNewAvatarIndex] = React.useState(0);
    const [focusedIndex, setFocusedIndex] = React.useState(0);
    const [isExiting, setIsExiting] = React.useState(false);

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

    // Keyboard navigation in select view
    React.useEffect(() => {
        if (view !== 'select') return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') {
                setFocusedIndex(i => Math.max(0, i - 1));
            } else if (e.key === 'ArrowRight') {
                const max = profiles.length < 4 ? profiles.length : profiles.length - 1;
                setFocusedIndex(i => Math.min(max, i + 1));
            } else if (e.key === 'Enter') {
                if (focusedIndex < profiles.length) {
                    doSelectProfile(profiles[focusedIndex]);
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
        const updated = profiles.filter(p => p.id !== profileId);
        if (focusedIndex >= updated.length) {
            setFocusedIndex(Math.max(0, updated.length - 1));
        }
        saveProfiles(updated);
    };

    const doSelectProfile = (profile) => {
        setIsExiting(true);
        setTimeout(() => {
            localStorage.setItem('c4k_current_profile', JSON.stringify(profile));
            // Notify nav bar in the same tab to re-read the profile immediately
            window.dispatchEvent(new Event('c4k-profile-changed'));
            window.location.hash = '#/';
        }, 400);
    };

    const getAvatarUrl = (p) =>
        p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar;

    const getAccent = (p) =>
        p.avatarIndex !== undefined ? (AVATAR_ACCENTS[p.avatarIndex] || '#fff') : '#fff';

    // Convert a #rrggbb hex to an rgba() string for CSS custom property use
    const hexToRgba = (hex, alpha) => {
        const h = hex.replace('#', '');
        const r = parseInt(h.slice(0, 2), 16);
        const g = parseInt(h.slice(2, 4), 16);
        const b = parseInt(h.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    };

    const getAccentStyle = (p) => {
        const hex = getAccent(p);
        return {
            '--accent': hex,
            '--accent-rgba': hexToRgba(hex, 0.28),
        };
    };

    return (
        <div className={classnames(styles['profiles-page'], { [styles['exiting']]: isExiting })}>

            {view === 'select' && (
                <div className={styles['select-view']}>
                    {/* Logo at top — where "Google TV" would be */}
                    <div className={styles['brand-header']}>
                        <img src={APP_LOGO} className={styles['brand-logo']} alt="Caught in 4K" />
                    </div>

                    <h1 className={styles['heading']}>Who's watching?</h1>

                    {/* Single row of profile cards */}
                    <div className={styles['profiles-row']}>
                        {profiles.map((p, i) => (
                            <div
                                key={p.id}
                                className={classnames(styles['profile-card'], { [styles['focused']]: i === focusedIndex })}
                                style={getAccentStyle(p)}
                                onMouseEnter={() => setFocusedIndex(i)}
                                onClick={() => doSelectProfile(p)}
                            >
                                <div
                                    className={styles['profile-avatar']}
                                    style={{ backgroundImage: `url(${getAvatarUrl(p)})` }}
                                />
                                <span className={styles['profile-name']}>{p.name}</span>
                                <button
                                    className={styles['delete-btn']}
                                    onClick={(e) => handleDeleteProfile(e, p.id)}
                                    title={`Remove ${p.name}`}
                                >
                                    ✕
                                </button>
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

                    <h1 className={styles['heading']}>Create a profile</h1>
                    <p className={styles['add-sub']}>Choose an avatar and give it a name</p>

                    <div className={styles['add-card-body']}>
                        <div className={styles['avatar-preview']}>
                            <div
                                className={styles['preview-circle']}
                                style={{ backgroundImage: `url(${AVAILABLE_AVATARS[newAvatarIndex]})` }}
                            />
                        </div>

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
                </div>
            )}
        </div>
    );
};

const ProfilesFallback = () => (
    <div className={styles['profiles-page']} />
);

module.exports = withCoreSuspender(Profiles, ProfilesFallback);
