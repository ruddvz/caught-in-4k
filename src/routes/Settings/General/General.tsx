import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button } from 'stremio/components';
import { useServices } from 'stremio/services';

import { usePlatform, useToast } from 'stremio/common';
import { Option, Link } from '../components';
import useDataExport from './useDataExport';
import styles from './General.less';

type Props = {
    profile: Profile,
};

const General = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { t } = useTranslation();
    const { core } = useServices();
    const platform = usePlatform();
    const toast = useToast();
    const [dataExport, loadDataExport] = useDataExport();
    const [traktAuthStarted, setTraktAuthStarted] = useState(false);

    const isTraktAuthenticated = useMemo(() => {
        const trakt = profile?.auth?.user?.trakt;
        return trakt && (Date.now() / 1000) < (trakt.created_at + trakt.expires_in);
    }, [profile.auth]);

    const avatar = useMemo(() => (
        `url('${require('/assets/images/anonymous.png')}')`
    ), []);

    const onExportData = useCallback(() => {
        loadDataExport();
    }, []);

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
            <div className={styles['account-header']}>
                <div className={styles['master-avatar']} style={{ backgroundImage: avatar }} />
                <div className={styles['user-details']}>
                    <div className={styles['display-name']}>
                        Stranger.
                    </div>
                    <Link 
                        label={`${t('LOG_IN')} / ${t('SIGN_UP')}`} 
                        href={'#/intro'} 
                        className={styles['login-link']} 
                    />
                </div>
            </div>
        </div>
    );
});

export default General;

