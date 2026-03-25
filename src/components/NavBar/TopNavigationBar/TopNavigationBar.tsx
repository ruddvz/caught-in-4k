import React, { memo, useCallback } from 'react';
import classnames from 'classnames';
// @ts-ignore
import Icon from '@stremio/stremio-icons/react';
// @ts-ignore
import Button from 'stremio/components/Button';
// @ts-ignore
import AppLogo from 'stremio/components/AppLogo/AppLogo';
import { useTranslation } from 'react-i18next';
// @ts-ignore
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
    const [fullscreen, , , toggleFullscreen] = useFullscreen() as [boolean, unknown, unknown, () => void];

    const onFullscreenClick = React.useCallback(() => {
        toggleFullscreen();
    }, [toggleFullscreen]);

    const onSearchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        const currentUrl = new URL(window.location.href);
        if (query.length > 0) {
            currentUrl.hash = `#/search?search=${encodeURIComponent(query)}`;
        } else {
            currentUrl.hash = '#/search';
        }
        window.location.hash = currentUrl.hash;
    }, []);

    const [currentProfile, setCurrentProfile] = React.useState<any>(null);

    const readProfile = React.useCallback(() => {
        const stored = localStorage.getItem('c4k_current_profile');
        if (stored) {
            try {
                setCurrentProfile(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        } else {
            setCurrentProfile(null);
        }
    }, []);

    React.useEffect(() => {
        readProfile();
        // storage fires when another tab changes localStorage
        window.addEventListener('storage', readProfile);
        // c4k-profile-changed fires within the same tab (dispatched by Profiles.js)
        window.addEventListener('c4k-profile-changed', readProfile);
        return () => {
            window.removeEventListener('storage', readProfile);
            window.removeEventListener('c4k-profile-changed', readProfile);
        };
    }, [readProfile]);

    const avatars = [
        require('../../../../assets/images/avatars/c4k-avatar-1.png'),
        require('../../../../assets/images/avatars/c4k-avatar-2.png'),
        require('../../../../assets/images/avatars/c4k-avatar-3.png'),
        require('../../../../assets/images/avatars/c4k-avatar-4.png'),
        require('../../../../assets/images/avatars/c4k-avatar-5.png'),
        require('../../../../assets/images/avatars/c4k-avatar-6.png'),
        require('../../../../assets/images/avatars/c4k-avatar-7.png'),
        require('../../../../assets/images/avatars/c4k-avatar-8.png'),
        require('../../../../assets/images/avatars/c4k-avatar-9.png'),
        require('../../../../assets/images/avatars/c4k-avatar-10.png'),
        require('../../../../assets/images/avatars/c4k-avatar-11.png'),
        require('../../../../assets/images/avatars/c4k-avatar-12.png'),
        require('../../../../assets/images/avatars/c4k-avatar-13.png'),
        require('../../../../assets/images/avatars/c4k-avatar-14.png'),
        require('../../../../assets/images/avatars/c4k-avatar-15.png'),
        require('../../../../assets/images/avatars/c4k-avatar-16.png'),
        require('../../../../assets/images/avatars/c4k-avatar-17.png'),
        require('../../../../assets/images/avatars/c4k-avatar-18.png'),
        require('../../../../assets/images/avatars/c4k-avatar-19.png'),
        require('../../../../assets/images/avatars/c4k-avatar-20.png'),
    ];

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'])}>
            <div className={styles['left-section']}>
                <a href="#/" className={styles['logo-wrapper']} aria-label="Caught in 4K — Home">
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
                            defaultValue={query}
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
                {route !== 'search' && (
                    <Button
                        className={classnames(styles['action-btn'], styles['search-btn-mobile'])}
                        href="#/search"
                        aria-label="Search"
                    >
                        <IconSearch className={styles['icon']} strokeWidth={1.5} aria-hidden="true" />
                    </Button>
                )}
                <Button
                    className={classnames(styles['action-btn'], styles['profile-btn'])}
                    href="#/profiles"
                    aria-label={currentProfile ? `Switch profile — ${currentProfile.name}` : 'Select profile'}
                >
                    {currentProfile ? (
                        <div
                            className={styles['profile-avatar']}
                            style={{ backgroundImage: `url(${avatars[currentProfile.avatarIndex]})` }}
                        />
                    ) : (
                        <IconUser className={styles['icon']} strokeWidth={1.5} aria-hidden="true" />
                    )}
                </Button>
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;

