// Copyright (C) 2024 Caught In 4K

const React = require('react');
const classnames = require('classnames');
const { Button } = require('stremio/components');
const { withCoreSuspender } = require('stremio/common');
const styles = require('./styles.less');

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
        if (view !== 'select' || profiles.length === 0) return;
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') {
                setFocusedIndex(i => Math.max(0, i - 1));
            } else if (e.key === 'ArrowRight') {
                setFocusedIndex(i => Math.min(profiles.length - 1, i + 1));
            } else if (e.key === 'Enter' && profiles[focusedIndex]) {
                setIsExiting(true);
                setTimeout(() => {
                    localStorage.setItem('c4k_current_profile', JSON.stringify(profiles[focusedIndex]));
                    window.location.hash = '#/';
                }, 350);
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

    const onSelectProfile = (profile) => {
        setIsExiting(true);
        setTimeout(() => {
            localStorage.setItem('c4k_current_profile', JSON.stringify(profile));
            window.location.hash = '#/';
        }, 350);
    };

    const currentAvatar = React.useMemo(() => {
        if (view === 'add') return AVAILABLE_AVATARS[newAvatarIndex];
        const p = profiles[focusedIndex];
        return p ? (p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar) : null;
    }, [view, profiles, focusedIndex, newAvatarIndex]);

    const focusedProfile = profiles[focusedIndex];

    return (
        <div className={classnames(styles['profiles-page-container'], { [styles['exiting']]: isExiting })}>
            {/* Dynamic blurred avatar background */}
            <div className={styles['dynamic-bg']} style={{ backgroundImage: currentAvatar ? `url(${currentAvatar})` : 'none' }} />
            <div className={styles['bg-overlay']} />

            <div className={styles['profiles-content']}>

                {view === 'select' && (
                    <div className={styles['select-view']}>
                        <h1 className={styles['welcome-text']}>Who's watching?</h1>
                        <p className={styles['welcome-sub']}>Pick your profile to continue</p>

                        <div className={styles['main-profile-display']}>
                            {profiles.length > 0 ? (
                                <>
                                    <div
                                        className={styles['focus-avatar']}
                                        style={{ backgroundImage: `url(${currentAvatar})` }}
                                        onClick={() => onSelectProfile(focusedProfile)}
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && onSelectProfile(focusedProfile)}
                                    >
                                        <div className={styles['play-hint']}>
                                            <span className={styles['play-icon']}>▶</span>
                                            <span>Watch Now</span>
                                        </div>
                                    </div>
                                    <h2 className={styles['focus-name']}>{focusedProfile ? focusedProfile.name : ''}</h2>
                                </>
                            ) : (
                                <>
                                    <div className={styles['empty-avatar']} onClick={() => setView('add')}>
                                        <span className={styles['empty-plus']}>+</span>
                                        <span className={styles['empty-label']}>Create Profile</span>
                                    </div>
                                    <h2 className={styles['focus-name']}>Get started</h2>
                                    <p className={styles['empty-hint']}>Add a profile to begin your personalized journey</p>
                                </>
                            )}
                        </div>

                        <div className={styles['carousel-wrapper']}>
                            <div className={styles['profile-carousel']}>
                                {profiles.map((p, i) => (
                                    <div
                                        key={p.id}
                                        className={classnames(styles['mini-card'], { [styles['active']]: i === focusedIndex })}
                                        onMouseEnter={() => setFocusedIndex(i)}
                                        onClick={() => onSelectProfile(p)}
                                    >
                                        <div
                                            className={styles['mini-avatar']}
                                            style={{ backgroundImage: `url(${p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar})` }}
                                        />
                                        <span className={styles['mini-name']}>{p.name}</span>
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
                                    <div className={styles['mini-card']} onClick={() => setView('add')}>
                                        <div className={classnames(styles['mini-avatar'], styles['add-node'])}>
                                            <span>+</span>
                                        </div>
                                        <span className={styles['mini-name']}>Add Profile</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles['bottom-controls']}>
                            <Button className={styles['glass-btn']} href="#/settings">Settings</Button>
                        </div>
                    </div>
                )}

                {view === 'add' && (
                    <div className={styles['add-view']}>
                        <div className={styles['add-glass-card']}>
                            <h1 className={styles['add-title']}>Create Profile</h1>
                            <p className={styles['add-subtitle']}>Choose an avatar and pick a name</p>

                            <div className={styles['avatar-display-large']}>
                                <div
                                    className={styles['current-pick-avatar']}
                                    style={{ backgroundImage: `url(${AVAILABLE_AVATARS[newAvatarIndex]})` }}
                                />
                            </div>

                            <div className={styles['avatar-grid-picker']}>
                                {AVAILABLE_AVATARS.map((url, i) => (
                                    <div
                                        key={i}
                                        className={classnames(styles['picker-avatar'], { [styles['selected']]: i === newAvatarIndex })}
                                        style={{ backgroundImage: `url(${url})` }}
                                        onClick={() => setNewAvatarIndex(i)}
                                    />
                                ))}
                            </div>

                            <div className={styles['name-input-container']}>
                                <input
                                    className={styles['modern-input']}
                                    placeholder="Enter a name..."
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && newName.trim() && handleCreateProfile()}
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>

                            <div className={styles['modal-actions']}>
                                <Button
                                    className={classnames(styles['modal-btn'], styles['primary-btn'])}
                                    onClick={handleCreateProfile}
                                    disabled={!newName.trim()}
                                >
                                    Start Watching
                                </Button>
                                <Button
                                    className={classnames(styles['modal-btn'], styles['secondary-btn'])}
                                    onClick={() => setView('select')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProfilesFallback = () => (
    <div className={styles['profiles-page-container']} />
);

module.exports = withCoreSuspender(Profiles, ProfilesFallback);
