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

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'])}>
            <div className={styles['left-section']}>
                <a href="#/" className={styles['logo-wrapper']}>
                    <AppLogo variant="compact" className={styles['logo']} />
                </a>
            </div>
            
            <div className={styles['center-section']}>
                {route === 'search' ? (
                    <div className={styles['search-input-wrapper']}>
                        <Icon name="search" className={styles['search-icon']} />
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
                            {tabs.slice(0, 6).map((tab) => (
                                <Button 
                                    key={tab.id}
                                    href={tab.href}
                                    className={classnames(styles['nav-tab'], { [styles['active']]: route === tab.id })}
                                >
                                    <Icon name={tab.icon} className={styles['tab-icon']} />
                                    <span className={styles['tab-label']}>{t(tab.label.toUpperCase())}</span>
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
                >
                    <Icon name={fullscreen ? 'minimize' : 'maximize'} className={styles['icon']} />
                </Button>
                <Button className={styles['action-btn']} href="#/profiles">
                    <Icon name="person-outline" className={styles['icon']} />
                </Button>
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;

