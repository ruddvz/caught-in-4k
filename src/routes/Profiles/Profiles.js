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

    // Load from local storage
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
        
        // Reset and back to select
        setNewName('');
        setNewAvatarIndex(0);
        setView('select');
    };

    const onSelectProfile = (profile) => {
        // You would typically set a global app state or cookie here.
        // Then we can redirect back to the app home logic.
        // For testing, just writing to a current_profile key.
        localStorage.setItem('c4k_current_profile', JSON.stringify(profile));
        window.location.hash = '#/'; // Go to board page
    };

    const onAddClick = () => setView('add');

    return (
        <div className={styles['profiles-page-container']}>
            <div className={classnames(styles['profiles-content'], 'animation-fade-in')}>
                
                {view === 'select' && (
                    <div className={styles['select-view']}>
                        <h1 className={styles['view-title']}>Who's watching?</h1>
                        <div className={styles['profiles-grid']}>
                            {profiles.map((p) => (
                                <div key={p.id} className={styles['profile-card']} onClick={() => onSelectProfile(p)}>
                                    <div 
                                        className={styles['profile-avatar']} 
                                        style={{ backgroundImage: `url('${p.avatarIndex !== undefined ? AVAILABLE_AVATARS[p.avatarIndex] : p.avatar}')` }}
                                    />
                                    <div className={styles['profile-name']}>{p.name}</div>
                                </div>
                            ))}

                            {profiles.length < 4 && (
                                <div className={classnames(styles['profile-card'], styles['add-btn'])} onClick={onAddClick}>
                                    <div className={styles['profile-avatar']}>
                                        <div className={styles['add-icon']}>+</div>
                                    </div>
                                    <div className={styles['profile-name']}>Add Profile</div>
                                </div>
                            )}
                        </div>

                        <div className={styles['footer-actions']}>
                            <Button className={styles['manage-btn']} href="#/settings">
                                Settings
                            </Button>
                            <Button className={styles['manage-btn']} href="#/">
                                Back Home
                            </Button>
                        </div>
                    </div>
                )}

                {view === 'add' && (
                    <div className={styles['add-view']}>
                        <h1 className={styles['view-title']}>Add Profile</h1>
                        <p className={styles['view-subtitle']}>Create a new browsing experience.</p>

                        <div className={styles['avatar-selection']}>
                            <div className={styles['avatar-label']}>Select an Icon</div>
                            <div className={styles['avatars-scroll']}>
                                {AVAILABLE_AVATARS.map((url, i) => (
                                    <div 
                                        key={i} 
                                        className={classnames(styles['avatar-option'], { [styles['selected']]: i === newAvatarIndex })}
                                        style={{ backgroundImage: `url('${url}')` }}
                                        onClick={() => setNewAvatarIndex(i)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles['input-section']}>
                            <input 
                                className={styles['name-input']} 
                                placeholder="Profile Name" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className={styles['action-buttons']}>
                            <Button 
                                className={classnames(styles['action-btn'], styles['save-btn'])} 
                                onClick={handleCreateProfile}
                                disabled={!newName.trim()}
                            >
                                Create
                            </Button>
                            <Button 
                                className={classnames(styles['action-btn'], styles['cancel-btn'])} 
                                onClick={() => setView('select')}
                            >
                                Back
                            </Button>
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
