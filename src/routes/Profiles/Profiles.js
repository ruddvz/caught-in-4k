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

    const saveProfiles = (newProfiles) => {
        setProfiles(newProfiles);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfiles));
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

    const onSelectProfile = (profile) => {
        localStorage.setItem('c4k_current_profile', JSON.stringify(profile));
        window.location.hash = '#/';
    };

    const currentAvatar = React.useMemo(() => {
        if (view === 'add') return AVAILABLE_AVATARS[newAvatarIndex];
        const p = profiles[focusedIndex];
        return p ? (p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar) : null;
    }, [view, profiles, focusedIndex, newAvatarIndex]);

    return (
        <div className={styles['profiles-page-container']}>
            {/* Dynamic Background */}
            <div className={styles['dynamic-bg']} style={{ backgroundImage: currentAvatar ? `url(${currentAvatar})` : 'none' }} />
            <div className={styles['bg-overlay']} />
            
            <div className={classnames(styles['profiles-content'], 'animation-fade-in')}>
                
                {view === 'select' && (
                    <div className={styles['select-view']}>
                        <h1 className={styles['welcome-text']}>Welcome back</h1>
                        
                        <div className={styles['main-profile-display']}>
                            {profiles.length > 0 ? (
                                <div 
                                    className={styles['focus-avatar']} 
                                    style={{ backgroundImage: `url(${currentAvatar})` }}
                                    onClick={() => onSelectProfile(profiles[focusedIndex])}
                                >
                                    <div className={styles['play-hint']}>Tap to start</div>
                                </div>
                            ) : (
                                <div className={styles['empty-avatar']} onClick={() => setView('add')}>
                                    <span>+</span>
                                </div>
                            )}
                            <h2 className={styles['focus-name']}>
                                {profiles.length > 0 ? profiles[focusedIndex].name : 'New Story'}
                            </h2>
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
                                    </div>
                                ))}
                                
                                {profiles.length < 4 && (
                                    <div className={styles['mini-card']} onClick={() => setView('add')}>
                                        <div className={classnames(styles['mini-avatar'], styles['add-node'])}>
                                            <span>+</span>
                                        </div>
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
                            <h1 className={styles['add-title']}>New Profile</h1>
                            
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
                                    placeholder="Who is this?" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className={styles['modal-actions']}>
                                <Button 
                                    className={classnames(styles['modal-btn'], styles['primary-btn'])} 
                                    onClick={handleCreateProfile}
                                    disabled={!newName.trim()}
                                >
                                    Start Browsing
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
