import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon } from 'stremio/components';
import { useServices } from 'stremio/services';
import { usePlatform, useToast } from 'stremio/common';
import { Section, Option, Link } from '../components';
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
        !profile.auth ?
            `url('${require('/assets/images/anonymous.png')}')`
            :
            profile.auth.user.avatar ?
                `url('${profile.auth.user.avatar}')`
                :
                `url('${require('/assets/images/default_avatar.png')}')`
    ), [profile.auth]);

    const onExportData = useCallback(() => {
        loadDataExport();
    }, []);

    const onLogout = useCallback(() => {
        core.transport.dispatch({
            action: 'Ctx',
            args: { action: 'Logout' }
        });
    }, []);

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
    }, [isTraktAuthenticated, profile.auth]);

    useEffect(() => {
        if (dataExport.exportUrl) {
            platform.openExternal(dataExport.exportUrl);
        }
    }, [dataExport.exportUrl]);

    useEffect(() => {
        if (isTraktAuthenticated && traktAuthStarted) {
            core.transport.dispatch({
                action: 'Ctx',
                args: { action: 'InstallTraktAddon' }
            });
            setTraktAuthStarted(false);
        }
    }, [isTraktAuthenticated, traktAuthStarted]);

    return (
        <div ref={ref} className={styles['account-widget']}>
            <div className={styles['account-header']}>
                <div className={styles['avatar-container']} style={{ backgroundImage: avatar }} />
                <div className={styles['user-details']}>
                    <div className={styles['email-label']} title={profile.auth === null ? t('ANONYMOUS_USER') : profile.auth.user.email}>
                        {profile.auth === null ? t('ANONYMOUS_USER') : profile.auth.user.email}
                    </div>
                    {profile.auth ? (
                        <Link label={t('LOG_OUT')} onClick={onLogout} className={styles['logout-link']} />
                    ) : (
                        <Link label={t('LOG_IN')} href={'#/intro'} className={styles['logout-link']} />
                    )}
                </div>
            </div>

            <div className={styles['account-actions']}>
                {profile?.auth?.user && (
                    <Option label={t('SETTINGS_DATA_EXPORT')}>
                        <Button className={'button'} onClick={onExportData}>
                            {t('SETTINGS_DATA_EXPORT')}
                        </Button>
                    </Option>
                )}
                
                <Option label={t('SETTINGS_TRAKT')} icon={'trakt'}>
                    <Button 
                        className={classnames('button', { 'active': isTraktAuthenticated })} 
                        onClick={onToggleTrakt}
                    >
                        {isTraktAuthenticated ? t('LOG_OUT') : t('SETTINGS_TRAKT_AUTHENTICATE')}
                    </Button>
                </Option>
            </div>
        </div>
    );
});

export default General;

