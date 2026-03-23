// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo } from 'react';
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
// @ts-ignore
import NavMenu from '../HorizontalNavBar/NavMenu';

type Tab = {
    id: string;
    label: string;
    href: string;
};

type Props = {
    className?: string;
    route?: string;
    tabs: any[];
};

const TopNavigationBar = memo(({ className, route, tabs }: Props) => {
    const { t } = useTranslation();
    
    // Mapping tabs to what we want to show in the pill
    const displayTabs: Tab[] = [
        { id: 'discover', label: 'DISCOVER', href: '#/discover' },
        { id: 'library', label: 'LIBRARY', href: '#/library' },
        { id: 'addons', label: 'ADDONS', href: '#/addons' },
    ];

    return (
        <nav className={classnames(className, styles['top-nav-bar-container'])}>
            <div className={styles['left-section']}>
                <AppLogo variant="compact" className={styles['logo']} />
                <span className={styles['brand-name']}>Caught in 4K</span>
            </div>
            
            <div className={styles['center-section']}>
                <div className={styles['nav-pill']}>
                    {displayTabs.map((tab) => (
                        <Button
                            key={tab.id}
                            className={classnames(styles['nav-tab'], { [styles['active']]: route === tab.id })}
                            href={tab.href}
                        >
                            {t(tab.label)}
                        </Button>
                    ))}
                    <Button className={styles['search-icon-btn']} href="#/search">
                        <Icon name="search" className={styles['icon']} />
                    </Button>
                </div>
            </div>
            
            <div className={styles['right-section']}>
                <Button className={styles['notif-btn']}>
                    <Icon name="notifications-outline" className={styles['icon']} />
                    <div className={styles['notif-dot']} />
                </Button>
                <NavMenu renderLabel={({ onClick }: { onClick: () => void }) => (
                    <Button className={styles['profile-btn']} onClick={onClick}>
                        <Icon name="person-circle-outline" className={styles['icon']} />
                    </Button>
                )} />
            </div>
        </nav>
    );
});

TopNavigationBar.displayName = 'TopNavigationBar';

export default TopNavigationBar;
