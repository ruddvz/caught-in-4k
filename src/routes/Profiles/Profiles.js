// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { withCoreSuspender } = require('stremio/common');
const styles = require('./styles.less');

const APP_LOGO = require('/assets/images/logo1.png');

const AVAILABLE_AVATARS = [
    require('../../../assets/images/avatars/abstract-avatar-1-circle-x3ecvpg9e9e3jtdw7ny2xs.png'),
    require('../../../assets/images/avatars/abstract-avatar-2-circle-rfv7tepq8onk3cwh4hta4d.png'),
    require('../../../assets/images/avatars/abstract-avatar-3-circle-0yg49l6kn99g7py9q5r7gj.png'),
    require('../../../assets/images/avatars/abstract-avatar-4-circle-nb6qd1yx1gas0k26aq3jrf.png'),
    require('../../../assets/images/avatars/abstract-avatar-5-circle-u6e0p97idsipndksw2lcaq.png'),
    require('../../../assets/images/avatars/abstract-avatar-6-circle-9xlbldchfaeckxehv4tjpk.png'),
    require('../../../assets/images/avatars/abstract-avatar-7-circle-76pjyw5fm6gdvqjgyuort.png'),
    require('../../../assets/images/avatars/abstract-avatar-8-circle-83i2c7b13kbvq9x6crxf.png'),
    require('../../../assets/images/avatars/abstract-avatar-9-circle-bugfxnw039lgvn25kqzo4c.png'),
    require('../../../assets/images/avatars/abstract-avatar-10-circle-lrsrjd2txm8mkkolw7902.png'),
    require('../../../assets/images/avatars/abstract-avatar-11-circle-7apdsvuf90sqtke9ybhz3.png'),
    require('../../../assets/images/avatars/abstract-avatar-12-circle-k7p9le9zztnhp0wfjxzcpl.png'),
    require('../../../assets/images/avatars/abstract-avatar-13-circle-xwe9z0rcnakp9ehxtqpqp.png'),
    require('../../../assets/images/avatars/abstract-avatar-14-circle-iflsbo952sl97g9h1c8uqb.png'),
    require('../../../assets/images/avatars/abstract-avatar-15-circle-lges9w2kuam0yxwl9s51ixd.png'),
    require('../../../assets/images/avatars/abstract-avatar-16-circle-dcwuud5dq7kw3o25bu1qz8.png')
];

const LOCAL_STORAGE_KEY = 'c4k_profiles';

// Dominant accent color per avatar index (matches avatar palette)
const AVATAR_ACCENTS = [
    '#7dd3fc', // 1  — sky blue
    '#4ade80', // 2  — green
    '#fca5a5', // 3  — rose pink
    '#f97316', // 4  — orange-red
    '#fb923c', // 5  — orange
    '#fbbf24', // 6  — amber yellow
    '#60a5fa', // 7  — blue
    '#f97316', // 8  — orange-red
    '#4ade80', // 9  — green
    '#fca5a5', // 10 — rose pink
    '#4ade80', // 11 — green
    '#f9a8d4', // 12 — pink mauve
    '#fb923c', // 13 — orange
    '#7dd3fc', // 14 — sky blue
    '#3b82f6', // 15 — vivid blue
    '#4ade80', // 16 — green
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
            window.location.hash = '#/';
        }, 400);
    };

    const getAvatarUrl = (p) =>
        p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar;

    const getAccent = (p) =>
        p.avatarIndex !== undefined ? (AVATAR_ACCENTS[p.avatarIndex] || '#fff') : '#fff';

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
                                style={{ '--accent': getAccent(p) }}
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
