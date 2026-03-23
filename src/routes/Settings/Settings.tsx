// Copyright (C) 2017-2023 Smart code 203358507

import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { useProfile, useStreamingServer, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import { SECTIONS } from './constants';
import Menu from './Menu';
import General from './General';
import Interface from './Interface';
import Player from './Player';
import Streaming from './Streaming';
import styles from './Settings.less';

const Settings = () => {
    const profile = useProfile();
    const streamingServer = useStreamingServer();

    const [activeTab, setActiveTab] = useState<string>(SECTIONS.GENERAL);

    const onTabSelect = useCallback((sectionId: string) => {
        setActiveTab(sectionId);
    }, []);

    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div className={classnames(styles['settings-content'], 'animation-fade-in')}>
                <Menu
                    selected={activeTab}
                    onSelect={onTabSelect}
                />

                <div className={styles['tab-content']}>
                    {activeTab === SECTIONS.GENERAL && (
                        <div className={styles['general-layout']}>
                            <div className={styles['left-widget']}>
                                <General profile={profile} />
                                <Interface profile={profile} />
                            </div>
                            <div className={styles['right-widget']}>
                                <Streaming profile={profile} streamingServer={streamingServer} />
                            </div>
                        </div>
                    )}
                    {activeTab === SECTIONS.PLAYER && (
                        <div className={styles['player-layout']}>
                            <Player profile={profile} />
                        </div>
                    )}
                </div>
            </div>
        </MainNavBars>
    );
};

const SettingsFallback = () => (
    <MainNavBars className={styles['settings-container']} route={'settings'} />
);

export default withCoreSuspender(Settings, SettingsFallback);
