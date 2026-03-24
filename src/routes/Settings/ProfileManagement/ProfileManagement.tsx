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
    const [profiles] = useState<SubProfile[]>([
        { id: '1', name: 'Rudra', avatarIndex: 1 },
        { id: '2', name: 'hitu', avatarIndex: 2 },
        { id: '3', name: 'dohi', avatarIndex: 3 },
        { id: '4', name: 'Lodo', avatarIndex: 4 },
    ]);
    const [currentProfile, setCurrentProfile] = useState<SubProfile | null>(null);
    const [deletingProfile, setDeletingProfile] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');

    const loadCurrent = () => {
        try {
            const current = JSON.parse(localStorage.getItem(CURRENT_PROFILE_KEY) || 'null');
            setCurrentProfile(current);
        } catch (_) { /* ignore */ }
    };

    useEffect(() => {
        loadCurrent();
        window.addEventListener('c4k-profile-changed', loadCurrent);
        return () => window.removeEventListener('c4k-profile-changed', loadCurrent);
    }, []);

    const handleSelect = useCallback((p: SubProfile) => {
        localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(p));
        window.dispatchEvent(new Event('c4k-profile-changed'));
        setCurrentProfile(p);
    }, []);

    const confirmDelete = useCallback(() => {
        if (accessCode === '1234') { 
            // Mock delete for visualization
            setDeletingProfile(null);
            setAccessCode('');
        } else {
            alert('Invalid Master Access Code');
        }
    }, [accessCode, deletingProfile]);

    const getAvatarUrl = (p: SubProfile): string =>
        p.avatarIndex !== undefined && p.avatarIndex < AVAILABLE_AVATARS.length
            ? AVAILABLE_AVATARS[p.avatarIndex]
            : AVAILABLE_AVATARS[0];

    return (
        <div className={styles['profile-management']}>
            <div className={styles['section-header']}>
                <div className={styles['header-top']}>
                    <svg className={styles['header-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span className={styles['header-text']}>SUB-PROFILES</span>
                </div>
                <div className={styles['header-divider']} />
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
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </div>
                    </div>
                ))}
            </div>

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
