import React, { useState, useEffect, useCallback } from 'react';
import styles from './ProfileManagement.less';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PinModal = require('../../Profiles/PinModal/PinModal');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { hashPin } = require('../../Profiles/PinModal/PinModal');

const LOCAL_STORAGE_KEY = 'c4k_profiles';
const CURRENT_PROFILE_KEY = 'c4k_current_profile';
const MAX_PROFILES = 4;

/* Mirror of the AVAILABLE_AVATARS array from Profiles.js — DATA PARITY */
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

const DEMO_PROFILES: SubProfile[] = [
    { id: '1', name: 'Rudra', avatarIndex: 1 },
    { id: '2', name: 'hitü', avatarIndex: 2 },
    { id: '3', name: 'dohi', avatarIndex: 3 },
];

const isProfileLocked = (profileId: string) =>
    !!localStorage.getItem(`c4k_profile_pin_${profileId}`);

type PinState =
    | { type: 'delete'; profileId: string; profileName: string }
    | { type: 'lock-set'; profileId: string }
    | { type: 'lock-remove'; profileId: string }
    | null;

const ProfileManagement = () => {
    const [profiles, setProfiles] = useState<SubProfile[]>([]);
    const [pinState, setPinState] = useState<PinState>(null);

    // DATA PARITY: Load from the exact same localStorage key as Profiles.js
    const load = useCallback(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
            if (Array.isArray(stored) && stored.length > 0) {
                setProfiles(stored);
            } else {
                // Seed demo profiles if none exist
                setProfiles(DEMO_PROFILES);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_PROFILES));
            }
        } catch (_) {
            setProfiles(DEMO_PROFILES);
        }
    }, []);

    useEffect(() => {
        load();
        window.addEventListener('c4k-profile-changed', load);
        return () => window.removeEventListener('c4k-profile-changed', load);
    }, [load]);

    const handleSelect = useCallback((p: SubProfile) => {
        localStorage.setItem(CURRENT_PROFILE_KEY, JSON.stringify(p));
        window.dispatchEvent(new Event('c4k-profile-changed'));
    }, []);

    // Phase 6: delete requires master code 0000 only
    const handleDeleteConfirmed = useCallback((profileId: string) => {
        setProfiles(prev => {
            const updated = prev.filter(p => p.id !== profileId);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            window.dispatchEvent(new Event('c4k-profile-changed'));
            return updated;
        });
        setPinState(null);
    }, []);

    // Phase 1 Step 4: set PIN for a profile
    const handlePinSet = useCallback((profileId: string, pinHash: string) => {
        localStorage.setItem(`c4k_profile_pin_${profileId}`, pinHash);
        setPinState(null);
        // Force re-render by updating profiles state (triggers locked state recalc)
        setProfiles(prev => [...prev]);
    }, []);

    // Phase 1 Step 4: remove PIN from a profile
    const handlePinRemoved = useCallback((profileId: string) => {
        localStorage.removeItem(`c4k_profile_pin_${profileId}`);
        setPinState(null);
        setProfiles(prev => [...prev]);
    }, []);

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

            {/* Profile List — SYNCED with Profile Selection page */}
            <div className={styles['profile-list']}>
                {profiles.map((p) => {
                    const locked = isProfileLocked(p.id);
                    return (
                        <div key={p.id} className={styles['profile-row']} onClick={() => handleSelect(p)}>
                            <div
                                className={styles['tiny-avatar']}
                                style={{ backgroundImage: `url(${getAvatarUrl(p)})` }}
                            />
                            <span className={styles['profile-name']}>{p.name}</span>

                            {/* Lock / unlock icon button */}
                            <div
                                className={`${styles['lock-icon']}${locked ? ` ${styles['lock-active']}` : ''}`}
                                title={locked ? 'Disable PIN' : 'Set PIN'}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (locked) {
                                        setPinState({ type: 'lock-remove', profileId: p.id });
                                    } else {
                                        setPinState({ type: 'lock-set', profileId: p.id });
                                    }
                                }}
                            >
                                {locked ? (
                                    // Closed lock
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                    </svg>
                                ) : (
                                    // Open lock
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                        <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                                    </svg>
                                )}
                            </div>

                            {/* Trash delete icon */}
                            <div
                                className={styles['trash-icon']}
                                title="Delete profile"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setPinState({ type: 'delete', profileId: p.id, profileName: p.name });
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CONSTRAINT: Hide [+] Add Profile when exactly MAX_PROFILES */}
            {profiles.length < MAX_PROFILES && (
                <a href="#/profiles" className={styles['add-profile-btn']}>
                    <span className={styles['plus-icon']}>[+]</span> Add Profile
                </a>
            )}

            {/* PIN Modal — delete mode: master code 0000 only */}
            {pinState?.type === 'delete' && (
                <PinModal
                    mode="delete"
                    profileName={pinState.profileName}
                    onSuccess={() => handleDeleteConfirmed(pinState.profileId)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {/* PIN Modal — set mode: two-step enter + confirm */}
            {pinState?.type === 'lock-set' && (
                <PinModal
                    mode="set"
                    onSuccess={(pinHash: string) => handlePinSet(pinState.profileId, pinHash)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {/* PIN Modal — remove mode: profile PIN or 0000 */}
            {pinState?.type === 'lock-remove' && (
                <PinModal
                    mode="remove"
                    profileId={pinState.profileId}
                    onSuccess={() => handlePinRemoved(pinState.profileId)}
                    onCancel={() => setPinState(null)}
                />
            )}
        </div>
    );
};

export default ProfileManagement;
