// Copyright (C) 2017-2023 Smart code 203358507

import React, { useCallback, useMemo, useRef, useState } from 'react';
import classnames from 'classnames';
import { useRouteFocused } from 'stremio-router';
import { usePlatform, useProfile, useStreamingServer, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import { SECTIONS } from './constants';
import Menu from './Menu';
import General from './General';
import Interface from './Interface';
import Player from './Player';
import Streaming from './Streaming';
import styles from './Settings.less';

const SECTION_COMPONENTS = [
    { id: SECTIONS.GENERAL, key: 'general' },
    { id: SECTIONS.INTERFACE, key: 'interface' },
    { id: SECTIONS.PLAYER, key: 'player' },
    { id: SECTIONS.STREAMING, key: 'streaming' },
];

const Settings = () => {
    const profile = useProfile();
    const platform = usePlatform();
    const streamingServer = useStreamingServer();

    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    const onNavSelect = useCallback((sectionId: string) => {
        setSelectedSection((prev) => prev === sectionId ? null : sectionId);
    }, []);

    const visibleSections = useMemo(() => {
        if (selectedSection) {
            return SECTION_COMPONENTS.filter((s) => s.id === selectedSection);
        }
        return SECTION_COMPONENTS;
    }, [selectedSection]);

    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div className={classnames(styles['settings-content'], 'animation-fade-in')}>
                <Menu
                    selected={selectedSection}
                    streamingServer={streamingServer}
                    onSelect={onNavSelect}
                />

                <div className={classnames(styles['sections-container'], {
                    [styles['single-widget']]: selectedSection !== null,
                })}>
                    {visibleSections.map((section) => {
                        switch (section.id) {
                            case SECTIONS.GENERAL:
                                return <General key={section.key} profile={profile} />;
                            case SECTIONS.INTERFACE:
                                return <Interface key={section.key} profile={profile} />;
                            case SECTIONS.PLAYER:
                                return <Player key={section.key} profile={profile} />;
                            case SECTIONS.STREAMING:
                                return (
                                    <Streaming
                                        key={section.key}
                                        profile={profile}
                                        streamingServer={streamingServer}
                                    />
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
        </MainNavBars>
    );
};

const SettingsFallback = () => (
    <MainNavBars className={styles['settings-container']} route={'settings'} />
);

export default withCoreSuspender(Settings, SettingsFallback);
