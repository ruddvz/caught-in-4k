// Copyright (C) 2017-2023 Smart code 203358507

import React, { useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { useProfile, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import General from './General';
import ProfileManagement from './ProfileManagement';
import Player from './Player';
// Streaming and Shortcuts are parked — kept imported so they can be re-enabled
import Shortcuts from './Shortcuts';
import styles from './Settings.less';

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '.stremio-toggle',
    '[role="button"]',
].join(', ');

const Settings = () => {
    const profile = useProfile();
    const containerRef = useRef<HTMLDivElement>(null);

    // KEYBOARD NAVIGATION: ArrowUp / ArrowDown through all focusable items
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

        const container = containerRef.current;
        if (!container) return;

        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
        if (focusable.length === 0) return;

        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        let nextIndex: number;

        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        }

        e.preventDefault();
        focusable[nextIndex].focus();
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div ref={containerRef} className={classNames(styles['settings-content'], 'animation-fade-in')}>
                {/* UNIFIED DASHBOARD: 35% Left | 65% Right */}
                <div className={styles['dashboard-grid']}>

                    {/* IDENTITY & PROFILES (32%) */}
                    <div className={styles['column-left']}>
                        <div className={styles['widget-card']}>
                            <General profile={profile} />
                        </div>
                        <div className={classNames(styles['widget-card'], styles['profiles-card'])}>
                            <ProfileManagement />
                        </div>
                    </div>

                    {/* PLAYER ENGINE (68%) */}
                    <div className={classNames(styles['column-right'], styles['player-widget'])}>
                        <Player profile={profile} />
                    </div>

                </div>

                {/* GLOBAL FOOTER */}
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
