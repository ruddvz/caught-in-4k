// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo, useCallback } from 'react';
import classnames from 'classnames';
import { TopNavigationBar } from '../NavBar';
import Icon from '@stremio/stremio-icons/react';
import Button from 'stremio/components/Button';
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'Home', icon: 'home', href: '/', ariaLabel: 'Home' },
    { id: 'search', label: 'Search', icon: 'search', href: '/search', ariaLabel: 'Search and Discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '/library', ariaLabel: 'Library' },
    { id: 'addons', label: 'Addons', icon: 'addons', href: '/addons', ariaLabel: 'Addons' },
    { id: 'profile', label: 'Profile', icon: 'settings', href: '/settings', ariaLabel: 'Profile and Settings' },
];

const PROFILE_ROUTES = new Set([
    'settings',
    'profiles',
    'admin',
    'subscribe',
    'calendar',
    'settingsShortcuts',
]);

const isTabActive = (tabId: string, route?: string) => {
    if (!route) {
        return false;
    }
    switch (tabId) {
        case 'board':
            return route === 'board';
        case 'search':
            return route === 'search' || route === 'discover';
        case 'library':
            return route === 'library' || route === 'continue_watching';
        case 'addons':
            return route === 'addons';
        case 'profile':
            return PROFILE_ROUTES.has(route);
        default:
            return route === tabId;
    }
};

const HIDE_BOTTOM_NAV_ROUTES = new Set(['intro', 'authPreview']);

type Props = {
    className: string,
    route?: string,
    query?: string,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, children }: Props) => {
    const hideBottomNav = route ? HIDE_BOTTOM_NAV_ROUTES.has(route) : false;

    const renderTab = useCallback((tab: typeof TABS[number]) => (
        <Button
            key={tab.id}
            href={tab.href}
            className={classnames(styles['bottom-nav-tab'], { [styles['active']]: isTabActive(tab.id, route) })}
            title={tab.label}
            aria-label={tab.ariaLabel}
            aria-current={isTabActive(tab.id, route) ? 'page' : undefined}
        >
            <Icon name={tab.icon} className={styles['bottom-tab-icon']} />
            <span className={styles['bottom-tab-label']}>{tab.label}</span>
        </Button>
    ), [route]);

    return (
        <div className={classnames(className, styles['main-nav-bars-container'], styles['c4k-app-shell'], { [styles[`route-${route}`]]: !!route })}>
            <TopNavigationBar
                className={styles['top-nav-bar']}
                route={route}
                query={query}
                tabs={TABS}
            />
            <div className={classnames(styles['nav-content-container'], styles['c4k-route-scroll'])}>{children}</div>
            {!hideBottomNav ? (
                <nav className={styles['mobile-bottom-nav']} aria-label="Primary">
                    {TABS.map(renderTab)}
                </nav>
            ) : null}
        </div>
    );
});

export default MainNavBars;
