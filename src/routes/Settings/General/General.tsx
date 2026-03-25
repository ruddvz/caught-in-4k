import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import { useServices } from 'stremio/services';
import { usePlatform } from 'stremio/common';
import useDataExport from './useDataExport';
import styles from './General.less';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PinModal = require('../../Profiles/PinModal/PinModal');

type Props = {
    profile: Profile,
};

const General = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const platform = usePlatform();
    const [dataExport, loadDataExport] = useDataExport();
    const [traktAuthStarted, setTraktAuthStarted] = useState(false);
    const [deleteAccountPinOpen, setDeleteAccountPinOpen] = useState(false);

    const isTraktAuthenticated = useMemo(() => {
        const trakt = profile?.auth?.user?.trakt;
        return trakt && (Date.now() / 1000) < (trakt.created_at + trakt.expires_in);
    }, [profile.auth]);

    const avatar = useMemo(() => (
        `url('${require('/assets/images/anonymous.png')}')`
    ), []);

    const onLogout = useCallback(() => {
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'Logout' }
        });
    }, []);

    const onChangePassword = useCallback(() => {
        platform.openExternal('https://www.strem.io/acc-management');
    }, []);

    const onDeleteAccount = useCallback(() => {
        // Gate 1: PIN verification — opens PIN modal
        setDeleteAccountPinOpen(true);
    }, []);

    const onDeleteAccountConfirmed = useCallback(() => {
        setDeleteAccountPinOpen(false);
        // Gate 2: final confirmation dialog before proceeding
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (confirmed) {
            platform.openExternal('https://www.strem.io/acc-management');
        }
    }, [platform]);

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
            {deleteAccountPinOpen && (
                <PinModal
                    mode="delete"
                    title="Confirm Account Deletion"
                    subtitle="Enter your master code to continue"
                    onSuccess={onDeleteAccountConfirmed}
                    onCancel={() => setDeleteAccountPinOpen(false)}
                />
            )}
            <div className={styles['account-header']}>
                <div className={styles['master-avatar']} style={{ backgroundImage: avatar }} />
                <div className={styles['user-details']}>
                    <div className={styles['display-name']}>
                        Stranger.
                    </div>
                </div>
            </div>

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
                        <Button className={classnames(styles['action-btn'], styles['btn-danger'])} onClick={onDeleteAccount}>
                            Delete Account
                        </Button>
                    </>
                ) : (
                    <Button className={styles['login-button']} onClick={() => { window.location.hash = '#/intro'; }}>
                        {t('LOG_IN')} / {t('SIGN_UP')}
                    </Button>
                )}
            </div>
        </div>
    );
});

export default General;
