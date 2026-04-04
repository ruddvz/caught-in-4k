// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo } from 'react';
import classnames from 'classnames';
import { TopNavigationBar } from '../NavBar';
// @ts-expect-error stremio-icons package lacks TS declarations
import Icon from '@stremio/stremio-icons/react';
// @ts-expect-error button module is resolved through the stremio alias
import Button from 'stremio/components/Button';
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'Board', icon: 'home', href: '/' },
    { id: 'search', label: 'Search', icon: 'search', href: '/search' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '/library' },
    { id: 'addons', label: 'Addons', icon: 'addons', href: '/addons' },
    { id: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

type Props = {
    className: string,
    route?: string,
    query?: string,
    children?: React.ReactNode,
};

const MainNavBars = memo(({ className, route, query, children }: Props) => {
    return (
        <div className={classnames(className, styles['main-nav-bars-container'], { [styles[`route-${route}`]]: !!route })}>
            <TopNavigationBar
                className={styles['top-nav-bar']}
                route={route}
                query={query}
                tabs={TABS}
            />
            <div className={styles['nav-content-container']}>{children}</div>
            <div className={styles['mobile-bottom-nav']}>
                {TABS.slice(0, 6).map((tab) => (
                    <Button
                        key={tab.id}
                        href={tab.href}
                        className={classnames(styles['bottom-nav-tab'], { [styles['active']]: route === tab.id })}
                    >
                        <Icon name={tab.icon} className={styles['bottom-tab-icon']} />
                        <span className={styles['bottom-tab-label']}>{tab.label}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
});

export default MainNavBars;

