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
    const [deletingProfile, setDeletingProfile] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');

    const load = () => {
        try {
            const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            // For visualization purposes, if empty, inject requested demo profiles
            if (!Array.isArray(stored) || stored.length === 0) {
                const demo = [
                    { id: '1', name: 'Rudra', avatarIndex: 1 },
                    { id: '2', name: 'hitü', avatarIndex: 2 },
                    { id: '3', name: 'dohi', avatarIndex: 3 },
                ];
                setProfiles(demo);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demo));
            } else {
                setProfiles(stored);
            }
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

    const confirmDelete = useCallback(() => {
        if (accessCode === '1234') { // Mock master code
            setProfiles(prev => {
                const updated = prev.filter(p => p.id !== deletingProfile);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
            if (currentProfile?.id === deletingProfile) {
                localStorage.removeItem(CURRENT_PROFILE_KEY);
                setCurrentProfile(null);
            }
            setDeletingProfile(null);
            setAccessCode('');
        } else {
            alert('Invalid Master Access Code');
        }
    }, [accessCode, deletingProfile, currentProfile]);

    const getAvatarUrl = (p: SubProfile): string =>
        p.avatarIndex !== undefined && p.avatarIndex < AVAILABLE_AVATARS.length
            ? AVAILABLE_AVATARS[p.avatarIndex]
            : AVAILABLE_AVATARS[0];

    return (
        <div className={styles['profile-management']}>
            {/* Active User Label */}
            <div className={styles['active-user-section']}>
                <span className={styles['active-label']}>User Cosmo4350</span>
                <span className={styles['status-badge']}>ACTIVE</span>
            </div>

            {/* Profile List */}
            <div className={styles['profile-list']}>
                {profiles.map(p => (
                    <div key={p.id} className={styles['profile-row']} onClick={() => handleSelect(p)}>
                        <div
                            className={styles['tiny-avatar']}
                            style={{ backgroundImage: `url(${getAvatarUrl(p)})` }}
                        />
                        <span className={styles['profile-name']}>{p.name}</span>
                        <div
                            className={styles['trash-icon']}
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeletingProfile(p.id);
                            }}
                        >
                            🗑️
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Profile Button */}
            <a href="#/profiles" className={styles['add-profile-btn']}>
                <span className={styles['plus-icon']}>[+]</span> Add Profile
            </a>

            {/* Master Access Code Modal (Overlaid) */}
            {deletingProfile && (
                <div className={styles['modal-overlay']}>
                    <div className={styles['access-modal']}>
                        <div className={styles['modal-title']}>Master Access Code</div>
                        <div className={styles['modal-desc']}>Secure verification required to delete profile.</div>
                        <input
                            type="password"
                            className={styles['access-input']}
                            placeholder="****"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value)}
                            autoFocus
                        />
                        <div className={styles['modal-actions']}>
                            <button className={styles['cancel-btn']} onClick={() => setDeletingProfile(null)}>Cancel</button>
                            <button className={styles['confirm-btn']} onClick={confirmDelete}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileManagement;
