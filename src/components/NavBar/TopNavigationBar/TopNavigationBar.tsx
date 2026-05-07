import React, { memo } from 'react';
import classnames from 'classnames';
import Icon from '@stremio/stremio-icons/react';
import Button from 'stremio/components/Button';
import AppLogo from 'stremio/components/AppLogo/AppLogo';
import { useTranslation } from 'react-i18next';
import { buildAppHref, navigateToAppHref } from 'stremio/common/navigation';
const { useAuth } = require('stremio/common/AuthProvider');
const { getCurrentProfile } = require('stremio/common/profileStore');
import styles from './styles.less';
import useFullscreen from '../../../common/useFullscreen';
// Inline Tabler SVG icons — zero bundle cost (see NavIcons.tsx)
import { IconSearch, IconMaximize, IconMinimize, IconUser } from './NavIcons';

type Props = {
    className?: string;
    route?: string;
    query?: string;
    tabs: { id: string; label: string; icon: string; href: string }[];
};

const TopNavigationBar = memo(({ className, route, query, tabs }: Props) => {
    const { t } = useTranslation();
    const auth = useAuth();
    const [fullscreen, , , toggleFullscreen] = useFullscreen() as [boolean, unknown, unknown, () => void];

    const onFullscreenClick = React.useCallback(() => {
        toggleFullscreen();
    }, [toggleFullscreen]);

    const onSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const nextQuery = event.target.value;
        navigateToAppHref(nextQuery.length > 0 ? buildAppHref('/search', { search: nextQuery }) : '/search', { replace: true });
    }, []);

    const [currentProfile, setCurrentProfile] = React.useState<any>(null);

    const readProfile = React.useCallback(() => {
        const stored = getCurrentProfile(localStorage, auth);
        if (stored) {
            try {
                setCurrentProfile(JSON.parse(stored));
            } catch (_error) {
                setCurrentProfile(null);
            }
        } else {
            setCurrentProfile(null);
        }
    }, [auth]);

    React.useEffect(() => {
        readProfile();
        window.addEventListener('storage', readProfile);
        window.addEventListener('c4k-profile-changed', readProfile);
        return () => {
            window.removeEventListener('storage', readProfile);
            window.removeEventListener('c4k-profile-changed', readProfile);
        };
    }, [readProfile]);

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'], { [styles['route-board']]: route === 'board' })}>
            <div className={styles['left-section']}>
                <a href={buildAppHref('/')} className={styles['logo-wrapper']} aria-label="Caught in 4K — Home">
                    <AppLogo variant="compact" className={styles['logo']} />
                </a>
            </div>

            <div className={styles['center-section']}>
                {route === 'search' ? (
                    <div className={styles['search-input-wrapper']}>
                        <IconSearch className={styles['search-icon']} strokeWidth={1.5} aria-hidden="true" />
                        <input
                            autoFocus
                            className={styles['search-input']}
                            placeholder={t('SEARCH')}
                            value={query || ''}
                            onChange={onSearchChange}
                        />
                    </div>
                ) : (
                    <div className={styles['nav-pill-wrapper']}>
                        <div className={styles['nav-pill']}>
                            {tabs.map((tab) => (
                                <Button
                                    key={tab.id}
                                    href={tab.href}
                                    className={classnames(styles['nav-tab'], { [styles['active']]: route === tab.id })}
                                >
                                    <Icon name={tab.icon} className={styles['tab-icon']} />
                                    <span className={styles['tab-label']}>{tab.label}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles['right-section']}>
                <Button
                    className={classnames(styles['action-btn'], styles['fullscreen-btn'])}
                    onClick={onFullscreenClick}
                    title={t(fullscreen ? 'EXIT_FULLSCREEN' : 'ENTER_FULLSCREEN')}
                    aria-label={t(fullscreen ? 'EXIT_FULLSCREEN' : 'ENTER_FULLSCREEN')}
                >
                    {fullscreen
                        ? <IconMinimize className={styles['icon']} strokeWidth={1.5} aria-hidden="true" />
                        : <IconMaximize className={styles['icon']} strokeWidth={1.5} aria-hidden="true" />
                    }
                </Button>

                <Button
                    className={classnames(styles['action-btn'], styles['profile-btn'])}
                    href="/profiles"
                    title={currentProfile?.name ? `${t('Profiles')}: ${currentProfile.name}` : t('Profiles')}
                    aria-label={currentProfile?.name ? `${t('Profiles')}: ${currentProfile.name}` : t('Profiles')}
                >
                    <IconUser className={styles['icon']} strokeWidth={1.5} aria-hidden="true" />
                </Button>
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;

