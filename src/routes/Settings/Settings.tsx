// Copyright (C) 2017-2023 Smart code 203358507

import React from 'react';
import classnames from 'classnames';
import { useProfile, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import General from './General';
import Interface from './Interface';
import Player from './Player';
import styles from './Settings.less';

const Settings = () => {
    const profile = useProfile();


    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div className={classnames(styles['settings-content'], 'animation-fade-in')}>
                {/*
                    LAYOUT ARCHITECTURE:
                    Left Column: 35% - Identity & System
                    Right Column: 65% - Giant Player Widget
                */}
                <div className={styles['dashboard-grid']}>
                    {/* LEFT COLUMN: Identity & System (35%) */}
                    <div className={styles['column-left']}>
                        <div className={styles['widget-card']}>
                            <General profile={profile} />
                        </div>
                        <div className={styles['widget-card']}>
                            <Interface profile={profile} />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: The Giant Player Widget (65%) */}
                    <div className={classnames(styles['column-right'], styles['player-widget'])}>
                        <Player profile={profile} />
                    </div>
                </div>
            </div>
        </MainNavBars>
    );
};

const SettingsFallback = () => (
    <MainNavBars className={styles['settings-container']} route={'settings'} />
);

export default withCoreSuspender(Settings, SettingsFallback);

