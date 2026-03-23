// Copyright (C) 2017-2023 Smart code 203358507

import React, { memo } from 'react';
import classnames from 'classnames';
import { HorizontalNavBar, VerticalNavBar, TopNavigationBar } from '../NavBar';
import styles from './MainNavBars.less';

const TABS = [
    { id: 'board', label: 'Board', icon: 'home', href: '#/' },
    { id: 'search', label: 'Search', icon: 'search', href: '#/search' },
    { id: 'discover', label: 'Discover', icon: 'discover', href: '#/discover' },
    { id: 'library', label: 'Library', icon: 'library', href: '#/library' },
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
            <TopNavigationBar
                className={styles['top-nav-bar']}
                route={route}
                tabs={TABS}
            />
            <div className={styles['nav-content-container']}>{children}</div>
        </div>
    );
});

export default MainNavBars;

