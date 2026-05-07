import React, { useState, useEffect, useCallback, useMemo } from 'react';
const { buildAppHref } = require('stremio/common/navigation');
import styles from './ProfileManagement.less';

const { useAuth } = require('stremio/common/AuthProvider');
const { MAX_PROFILES, PROFILE_CHANGE_EVENT, createProfileStore } = require('stremio/common/profileStore');
const AVAILABLE_AVATARS: string[] = require('../../../common/profileAvatars');
const PinModal = require('../../Profiles/PinModal/PinModal');

type SubProfile = {
    id: string;
    name: string;
    avatarIndex: number;
    hasPin: boolean;
};

type PinState =
    | { type: 'select'; profile: SubProfile }
    | { type: 'delete'; profileId: string; profileName: string }
    | { type: 'lock-set'; profileId: string }
    | { type: 'lock-remove'; profileId: string }
    | { type: 'master-verify' }
    | { type: 'master-set'; currentCode?: string | null; nextAction?: { type: 'delete'; profileId: string; profileName: string } | null }
    | null;

const getProfileAvatarUrl = (avatarIndex: number) => {
    const normalizedIndex = Number.isInteger(avatarIndex) && avatarIndex >= 0 ? avatarIndex : 0;
    return AVAILABLE_AVATARS[normalizedIndex] || AVAILABLE_AVATARS[0];
};

const ProfileManagement = () => {
    const auth = useAuth();
    const profileStore = useMemo(() => createProfileStore(), []);
    const [profiles, setProfiles] = useState<SubProfile[]>([]);
    const [pinState, setPinState] = useState<PinState>(null);
    const [hasMasterCode, setHasMasterCode] = useState<boolean | null>(null);

    const refreshProfiles = useCallback(async () => {
        try {
            const [nextProfiles, nextHasMasterCode] = await Promise.all([
                profileStore.loadProfiles({ auth }),
                profileStore.hasMasterCodeConfigured({ auth }),
            ]);
            setProfiles(nextProfiles);
            setHasMasterCode(nextHasMasterCode);
        } catch (error) {
            console.error('Failed to load profile management state', error);
            setProfiles([]);
            setHasMasterCode(false);
        }
    }, [auth, profileStore]);

    useEffect(() => {
        void refreshProfiles();

        const handleProfileChange = () => {
            void refreshProfiles();
        };

        window.addEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
        return () => window.removeEventListener(PROFILE_CHANGE_EVENT, handleProfileChange);
    }, [refreshProfiles]);

    const handleSelect = useCallback((p: SubProfile) => {
        profileStore.selectProfile(p);
    }, [profileStore]);

    const handleDeleteConfirmed = useCallback(async (profileId: string, masterCode: string) => {
        try {
            const deleted = await profileStore.deleteProfile({ auth, profileId, masterCode });
            if (!deleted) {
                return false;
            }

            await refreshProfiles();
            setPinState(null);
            return true;
        } catch (error) {
            return error instanceof Error ? error.message : 'Failed to delete the profile.';
        }
    }, [auth, profileStore, refreshProfiles]);

    const handlePinSet = useCallback(async (profileId: string, pinCode: string) => {
        try {
            await profileStore.setProfilePin({ auth, profileId, pinCode });
            await refreshProfiles();
            setPinState(null);
            return true;
        } catch (error) {
            return error instanceof Error ? error.message : 'Failed to save the profile PIN.';
        }
    }, [auth, profileStore, refreshProfiles]);

    const handlePinRemoved = useCallback(async (profileId: string, code: string) => {
        try {
            const cleared = await profileStore.clearProfilePin({ auth, profileId, code });
            if (!cleared) {
                return false;
            }

            await refreshProfiles();
            setPinState(null);
            return true;
        } catch (error) {
            return error instanceof Error ? error.message : 'Failed to remove the profile PIN.';
        }
    }, [auth, profileStore, refreshProfiles]);

    const handleMasterCodeSet = useCallback(async (
        code: string,
        currentCode?: string | null,
        nextAction?: { type: 'delete'; profileId: string; profileName: string } | null
    ) => {
        try {
            if (currentCode) {
                const rotated = await profileStore.rotateMasterCode({ auth, currentCode, nextCode: code });
                if (!rotated) {
                    return false;
                }
            } else {
                await profileStore.setMasterCode({ auth, code });
            }

            if (typeof auth.refreshProfile === 'function') {
                await auth.refreshProfile();
            }

            if (nextAction?.type === 'delete') {
                return handleDeleteConfirmed(nextAction.profileId, code);
            }

            await refreshProfiles();
            setPinState(null);
            return true;
        } catch (error) {
            return error instanceof Error ? error.message : 'Failed to save the master code.';
        }
    }, [auth, handleDeleteConfirmed, profileStore, refreshProfiles]);

    const beginDeleteFlow = useCallback((profileId: string, profileName: string) => {
        if (hasMasterCode === null) {
            return;
        }

        if (!hasMasterCode) {
            setPinState({ type: 'master-set', nextAction: { type: 'delete', profileId, profileName } });
            return;
        }

        setPinState({ type: 'delete', profileId, profileName });
    }, [hasMasterCode]);

    return (
        <div className={styles['profile-management']}>
            <div className={styles['section-header']}>
                <div className={styles['header-top']}>
                    <svg className={styles['header-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    <span className={styles['header-text']}>PROFILES</span>
                </div>
                <div className={styles['header-divider']} />
            </div>

            {/* Profile List — SYNCED with Profile Selection page */}
            <div className={styles['profile-list']}>
                {profiles.map((p) => {
                    const locked = p.hasPin;
                    const avatarUrl = getProfileAvatarUrl(p.avatarIndex);
                    return (
                        <div
                            key={p.id}
                            className={styles['profile-row']}
                            onClick={() => {
                                if (locked) {
                                    setPinState({ type: 'select', profile: p });
                                    return;
                                }

                                handleSelect(p);
                            }}
                        >
                            <span className={styles['profile-avatar']} aria-hidden="true">
                                <img className={styles['profile-avatar-image']} src={avatarUrl} alt="" />
                            </span>
                            <span className={styles['profile-name']}>{p.name}</span>

                            {/* Lock / unlock icon button */}
                            <button
                                type="button"
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
                            </button>

                            {/* Trash delete icon */}
                            <button
                                type="button"
                                className={styles['trash-icon']}
                                title="Delete profile"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    beginDeleteFlow(p.id, p.name);
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* CONSTRAINT: Hide [+] Add Profile when exactly MAX_PROFILES */}
            <div className={styles['actions-row']}>
                {profiles.length < MAX_PROFILES && (
                    <a href={buildAppHref('/profiles')} className={styles['add-profile-btn']}>
                        <span className={styles['plus-icon']}>[+]</span> Add Profile
                    </a>
                )}

                <button
                    type="button"
                    className={styles['master-code-btn']}
                    disabled={hasMasterCode === null}
                    onClick={() => setPinState(hasMasterCode ? { type: 'master-verify' } : { type: 'master-set', currentCode: null, nextAction: null })}
                >
                    {hasMasterCode === null ? 'Loading Master Code...' : hasMasterCode ? 'Change Master Code' : 'Set Master Code'}
                </button>
            </div>

            {hasMasterCode === false ? (
                <div className={styles['security-note']}>
                    Set a master code before deleting profiles.
                </div>
            ) : null}

            {pinState?.type === 'select' && (
                <PinModal
                    mode="unlock"
                    title={`Unlock ${pinState.profile.name}`}
                    subtitle={`Enter ${pinState.profile.name}'s 4-digit PIN`}
                    onSubmitCode={async (code: string) => {
                        try {
                            const isValid = await profileStore.verifyProfilePin({ auth, profileId: pinState.profile.id, code });
                            if (!isValid) {
                                return false;
                            }

                            handleSelect(pinState.profile);
                            setPinState(null);
                            return true;
                        } catch (error: unknown) {
                            return error instanceof Error ? error.message : 'Failed to verify the profile PIN.';
                        }
                    }}
                    onCancel={() => setPinState(null)}
                />
            )}

            {pinState?.type === 'delete' && (
                <PinModal
                    mode="delete"
                    profileName={pinState.profileName}
                    onSubmitCode={(code: string) => handleDeleteConfirmed(pinState.profileId, code)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {pinState?.type === 'lock-set' && (
                <PinModal
                    mode="set"
                    title="Set Profile PIN"
                    subtitle="Create a 4-digit PIN for this profile"
                    onSuccess={(pinCode: string) => handlePinSet(pinState.profileId, pinCode)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {pinState?.type === 'lock-remove' && (
                <PinModal
                    mode="remove"
                    onSubmitCode={(code: string) => handlePinRemoved(pinState.profileId, code)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {pinState?.type === 'master-set' && (
                <PinModal
                    mode="set-master"
                    title={hasMasterCode ? 'Change Master Code' : 'Set Master Code'}
                    subtitle={pinState.nextAction
                        ? `Set a master code to remove ${pinState.nextAction.profileName}`
                        : 'Create a 4-digit master code for destructive actions'}
                    onSuccess={(code: string) => handleMasterCodeSet(code, pinState.currentCode || null, pinState.nextAction || null)}
                    onCancel={() => setPinState(null)}
                />
            )}

            {pinState?.type === 'master-verify' && (
                <PinModal
                    mode="delete"
                    title="Confirm Current Master Code"
                    subtitle="Enter the current master code before changing it"
                    onSubmitCode={async (code: string) => {
                        try {
                            const isValid = await profileStore.verifyMasterCode({ auth, code });
                            if (!isValid) {
                                return false;
                            }

                            setPinState({ type: 'master-set', currentCode: code, nextAction: null });
                            return true;
                        } catch (error) {
                            return error instanceof Error ? error.message : 'Failed to verify the master code.';
                        }
                    }}
                    onCancel={() => setPinState(null)}
                />
            )}
        </div>
    );
};

export default ProfileManagement;
