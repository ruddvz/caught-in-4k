import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import { useServices } from 'stremio/services';
import { usePlatform } from 'stremio/common';
import useDataExport from './useDataExport';
import DevicesWidget from './DevicesWidget';
import styles from './General.less';
const { navigateToAppHref } = require('stremio/common/navigation');
const { useAuth } = require('stremio/common/AuthProvider');
const { createProfileStore } = require('stremio/common/profileStore');
const { resolveSubscriptionPlanId } = require('stremio/common/subscriptionPlans');
const PinModal = require('../../Profiles/PinModal/PinModal');

type Props = {
    profile: Profile,
};

const General = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const platform = usePlatform();
    const auth = useAuth();
    const profileStore = useMemo(() => createProfileStore(), []);
    const [dataExport] = useDataExport();
    const [traktAuthStarted, setTraktAuthStarted] = useState(false);
    const [deleteAccountPinMode, setDeleteAccountPinMode] = useState<null | 'verify' | 'set'>(null);
    const [hasMasterCode, setHasMasterCode] = useState<boolean | null>(null);

    const isTraktAuthenticated = useMemo(() => {
        const trakt = profile?.auth?.user?.trakt;
        return trakt && (Date.now() / 1000) < (trakt.created_at + trakt.expires_in);
    }, [profile.auth]);

    const avatarSrc = useMemo(() => (
        require('/assets/images/anonymous.png')
    ), []);
    const devicePlanId = useMemo(
        () => resolveSubscriptionPlanId(auth.subscription?.plan ?? null),
        [auth.subscription]
    );
    const deviceUserId = auth.user?.id ?? auth.profile?.id ?? null;
    const showDevicesWidget = Boolean(profile.auth && deviceUserId && devicePlanId);

    useEffect(() => {
        let cancelled = false;

        profileStore.hasMasterCodeConfigured({ auth })
            .then((value) => {
                if (!cancelled) {
                    setHasMasterCode(value);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setHasMasterCode(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [auth, profileStore]);

    const onLogout = useCallback(async () => {
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'Logout' }
        });
        await auth.signOut();
    }, [auth, core]);

    const onChangePassword = useCallback(() => {
        platform.openExternal('https://www.strem.io/acc-management');
    }, [platform]);

    const finalizeAccountDeletion = useCallback(() => {
        setDeleteAccountPinMode(null);
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmed) {
            platform.openExternal('https://www.strem.io/acc-management');
        }
        return true;
    }, [platform]);

    const onDeleteAccount = useCallback(() => {
        if (hasMasterCode === null) {
            return;
        }

        setDeleteAccountPinMode(hasMasterCode ? 'verify' : 'set');
    }, [hasMasterCode]);

    const onToggleTrakt = useCallback(() => {
        if (!isTraktAuthenticated && profile.auth !== null && profile.auth.user !== null && typeof profile.auth.user._id === 'string') {
            platform.openExternal(`https://www.strem.io/trakt/auth/${profile.auth.user._id}`);
            setTraktAuthStarted(true);
        } else {
            core.transport.dispatch({
                action: 'Ctx',
                args: { action: 'LogoutTrakt' }
            });
        }
    }, [isTraktAuthenticated, profile.auth, platform, core]);

    useEffect(() => {
        if (dataExport.exportUrl) {
            platform.openExternal(dataExport.exportUrl);
        }
    }, [dataExport.exportUrl, platform]);

    useEffect(() => {
        if (isTraktAuthenticated && traktAuthStarted) {
            core.transport.dispatch({
                action: 'Ctx',
                args: { action: 'InstallTraktAddon' }
            });
            setTraktAuthStarted(false);
        }
    }, [isTraktAuthenticated, traktAuthStarted, core]);

    return (
        <div ref={ref} className={styles['account-widget']}>
            {deleteAccountPinMode === 'verify' && (
                <PinModal
                    mode="delete"
                    title="Confirm Account Deletion"
                    subtitle="Enter your master code to continue"
                    onSubmitCode={async (code) => {
                        try {
                            const isValid = await profileStore.verifyMasterCode({ auth, code });
                            if (!isValid) {
                                return false;
                            }

                            return finalizeAccountDeletion();
                        } catch (error) {
                            return error instanceof Error ? error.message : 'Failed to verify the master code.';
                        }
                    }}
                    onCancel={() => setDeleteAccountPinMode(null)}
                />
            )}

            {deleteAccountPinMode === 'set' && (
                <PinModal
                    mode="set-master"
                    title="Set Master Code"
                    subtitle="Create a master code before deleting this account"
                    onSuccess={async (code) => {
                        try {
                            await profileStore.setMasterCode({ auth, code });
                            if (typeof auth.refreshProfile === 'function') {
                                await auth.refreshProfile();
                            }
                            setHasMasterCode(true);
                            return finalizeAccountDeletion();
                        } catch (error) {
                            return error.message || 'Failed to save the master code.';
                        }
                    }}
                    onCancel={() => setDeleteAccountPinMode(null)}
                />
            )}
            <div className={styles['account-header']}>
                <img className={styles['master-avatar']} src={avatarSrc} alt="" />
                <div className={styles['user-details']}>
                    <div className={styles['display-name']}>
                        Stranger.
                    </div>
                </div>
            </div>

            {showDevicesWidget ? (
                <DevicesWidget
                    planId={devicePlanId}
                    userId={deviceUserId}
                />
            ) : null}

            <div className={styles['account-actions']}>
                {profile.auth ? (
                    <>
                        <Button className={classnames(styles['action-btn'], styles['btn-logout'])} onClick={onLogout}>
                            {t('LOG_OUT')}
                        </Button>
                        <Button
                            className={classnames(styles['action-btn'], styles['btn-secondary'])}
                            onClick={onToggleTrakt}
                        >
                            {isTraktAuthenticated ? 'Log out of Trakt' : 'Authenticate Trakt'}
                        </Button>
                        <Button className={classnames(styles['action-btn'], styles['btn-secondary'])} onClick={onChangePassword}>
                            Change Password
                        </Button>
                        <Button
                            className={classnames(styles['action-btn'], styles['btn-danger'])}
                            onClick={onDeleteAccount}
                            disabled={hasMasterCode === null}
                        >
                            Delete Account
                        </Button>
                    </>
                ) : (
                    <Button className={styles['login-button']} onClick={() => { navigateToAppHref('/intro'); }}>
                        {t('LOG_IN')} / {t('SIGN_UP')}
                    </Button>
                )}
            </div>
        </div>
    );
});

export default General;
