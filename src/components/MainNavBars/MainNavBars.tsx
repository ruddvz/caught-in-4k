// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo } from 'react';
import classnames from 'classnames';
import AppLogo from 'stremio/components/AppLogo/AppLogo';
import VerticalNavBar from '../NavBar/VerticalNavBar/VerticalNavBar';
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'Board', icon: 'home', href: '#/' },
    { id: 'search', label: 'Search', icon: 'search', href: '#/search' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '#/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '#/library' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', href: '#/calendar' },
    { id: 'addons', label: 'ADDONS', icon: 'addons', href: '#/addons' },
    { id: 'settings', label: 'SETTINGS', icon: 'settings', href: '#/settings' },
];

type Props = {
    className: string,
    route?: string,
    query?: string,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, children }: Props) => {
    return (
        <div className={classnames(className, styles['main-nav-bars-container'])}>
            <div className={styles['logo-container']}>
                <AppLogo variant="compact" className={styles['logo']} />
            </div>
            {/* HorizontalNavBar hidden for clean sidebar-only layout */}
            {/* @ts-ignore */}
            <VerticalNavBar
                className={styles['vertical-nav-bar']}
                selected={route}
                tabs={TABS}
            />
            <div className={styles['nav-content-container']}>{children}</div>
        </div>
    );
});

export default MainNavBars;

