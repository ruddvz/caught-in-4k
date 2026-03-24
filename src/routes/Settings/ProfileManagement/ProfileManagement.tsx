import React, { useState, useEffect, useCallback } from 'react';
import classnames from 'classnames';
import styles from './ProfileManagement.less';

const LOCAL_STORAGE_KEY = 'c4k_profiles';
const CURRENT_PROFILE_KEY = 'c4k_current_profile';

/* Mirror of the AVAILABLE_AVATARS array from Profiles.js */
const AVAILABLE_AVATARS: string[] = [
    require('/assets/images/avatars/c4k-avatar-1.png'),
    require('/assets/images/avatars/c4k-avatar-2.png'),
    require('/assets/images/avatars/c4k-avatar-3.png'),
    require('/assets/images/avatars/c4k-avatar-4.png'),
    require('/assets/images/avatars/c4k-avatar-5.png'),
    require('/assets/images/avatars/c4k-avatar-6.png'),
    require('/assets/images/avatars/c4k-avatar-7.png'),
    require('/assets/images/avatars/c4k-avatar-8.png'),
    require('/assets/images/avatars/c4k-avatar-9.png'),
    require('/assets/images/avatars/c4k-avatar-10.png'),
    require('/assets/images/avatars/c4k-avatar-11.png'),
    require('/assets/images/avatars/c4k-avatar-12.png'),
    require('/assets/images/avatars/c4k-avatar-13.png'),
    require('/assets/images/avatars/c4k-avatar-14.png'),
    require('/assets/images/avatars/c4k-avatar-15.png'),
    require('/assets/images/avatars/c4k-avatar-16.png'),
    require('/assets/images/avatars/c4k-avatar-17.png'),
    require('/assets/images/avatars/c4k-avatar-18.png'),
    require('/assets/images/avatars/c4k-avatar-19.png'),
    require('/assets/images/avatars/c4k-avatar-20.png'),
];

type SubProfile = {
    id: string;
    name: string;
    avatarIndex: number;
};

const ProfileManagement = () => {
    const [profiles, setProfiles] = useState<SubProfile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<SubProfile | null>(null);

    const load = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            if (Array.isArray(stored)) setProfiles(stored);
        } catch (_) { /* ignore parse errors */ }

        try {
            const current = JSON.parse(localStorage.getItem(CURRENT_PROFILE_KEY) || 'null');
            setCurrentProfile(current);
        } catch (_) { /* ignore */ }
    };

    useEffect(() => {
        load();
        window.addEventListener('c4k-profile-changed', load);
        return () => window.removeEventListener('c4k-profile-changed', load);
    }, []);

    const handleSelect = useCallback((p: SubProfile) => {
        localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(p));
        window.dispatchEvent(new Event('c4k-profile-changed'));
        setCurrentProfile(p);
    }, []);

    const handleRemove = useCallback((e: React.MouseEvent, profileId: string) => {
        e.stopPropagation();
        setProfiles(prev => {
            const updated = prev.filter(p => p.id !== profileId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
        if (currentProfile?.id === profileId) {
            localStorage.removeItem(CURRENT_PROFILE_KEY);
            setCurrentProfile(null);
        }
    }, [currentProfile]);

    const getAvatarUrl = (p: SubProfile): string =>
        p.avatarIndex !== undefined && p.avatarIndex < AVAILABLE_AVATARS.length
            ? AVAILABLE_AVATARS[p.avatarIndex]
            : AVAILABLE_AVATARS[0];

    return (
        <div className={styles['profile-management']}>
            <div className={styles['widget-label']}>SUB-PROFILES</div>

            <div className={styles['profiles-grid']}>
                {profiles.slice(0, 4).map(p => (
                    <div
                        key={p.id}
                        className={classnames(styles['profile-item'], {
                            [styles['profile-active']]: currentProfile?.id === p.id,
                        })}
                        onClick={() => handleSelect(p)}
                        title={`Switch to ${p.name}`}
                    >
                        <div
                            className={styles['profile-avatar']}
                            style={{ '--avatar-url': `url(${getAvatarUrl(p)})` } as React.CSSProperties}
                        />
                        <span className={styles['profile-name']}>{p.name}</span>
                        {currentProfile?.id === p.id && (
                            <span className={styles['active-badge']}>Active</span>
                        )}
                        <button
                            type="button"
                            className={styles['remove-btn']}
                            onClick={(e) => handleRemove(e, p.id)}
                            title={`Remove ${p.name}`}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                {profiles.length < 4 && (
                    <a href="#/profiles" className={styles['add-profile-card']} title="Add a new profile">
                        <span className={styles['add-icon']}>+</span>
                        <span className={styles['add-label']}>Add Profile</span>
                    </a>
                )}
            </div>

            <a href="#/profiles" className={styles['manage-link']}>Manage Profiles →</a>
        </div>
    );
};

export default ProfileManagement;
