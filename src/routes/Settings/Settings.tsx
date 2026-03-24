// Copyright (C) 2017-2023 Smart code 203358507

import React from 'react';
import classNames from 'classnames';
import { useProfile, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import General from './General';
import ProfileManagement from './ProfileManagement';
import Player from './Player';
// Streaming and Shortcuts are parked — kept imported so they can be re-enabled
// by moving them out of the hidden div below.
import Shortcuts from './Shortcuts';
import styles from './Settings.less';

const Settings = () => {
    const profile = useProfile();

    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div className={classNames(styles['settings-content'], 'animation-fade-in')}>
                {/* 
                    UNIFIED DASHBOARD: 35% Left | 65% Right
                */}
                <div className={styles['dashboard-grid']}>

                    {/* IDENTITY & PROFILES (35%) */}
                    <div className={styles['column-left']}>
                        <div className={styles['widget-card']}>
                            <General profile={profile} />
                        </div>
                        <div className={classNames(styles['widget-card'], styles['profiles-card'])}>
                            <ProfileManagement />
                        </div>
                    </div>

                    {/* PLAYER ENGINE (65%) */}
                    <div className={classNames(styles['column-right'], styles['player-widget'])}>
                        <Player profile={profile} />
                    </div>

                </div>

                {/* GLOBAL FOOTER — center-aligned */}
                <div className={styles['settings-footer']}>
                    <a href="#/tos" className={styles['footer-link']}>Terms of Service</a>
                    <span className={styles['footer-separator']}>|</span>
                    <a href="#/privacy-policy" className={styles['footer-link']}>Privacy Policy</a>
                </div>

                {/* PARKED COMPONENTS */}
                <div style={{ display: 'none' }}>
                    <Shortcuts />
                </div>
            </div>
        </MainNavBars>
    );
};

const SettingsFallback = () => (
    <MainNavBars className={styles['settings-container']} route={'settings'} />
);

export default withCoreSuspender(Settings, SettingsFallback);
