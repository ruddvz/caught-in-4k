// Copyright (C) 2017-2023 Smart code 203358507

import React, { useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
const { buildAppHref } = require('stremio/common/navigation');
import { useProfile, withCoreSuspender } from 'stremio/common';
import { MainNavBars } from 'stremio/components';
import General from './General';
import ProfileManagement from './ProfileManagement';
import Player from './Player';
import Shortcuts from './Shortcuts';
import styles from './Settings.less';

const FOCUSABLE_SELECTOR = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '.stremio-toggle',
    '[role="button"]',
    '.option-button',
].join(', ');

const Settings = () => {
    const { t } = useTranslation();
    const profile = useProfile();
    const containerRef = useRef<HTMLDivElement>(null);
    const isSignedIn = profile.auth !== null;

    const summaryCards = [
        {
            label: t('Mode'),
            value: isSignedIn ? t('Signed in and synced') : t('Guest session'),
        },
        {
            label: t('Profiles'),
            value: t('Locks, switching, and access control'),
        },
        {
            label: t('Playback'),
            value: t('Subtitles, automation, and hardware'),
        },
    ];

    const quickLinks = [
        {
            id: 'settings-account',
            label: t('Account'),
            copy: t('Login, security, and device presence'),
        },
        {
            id: 'settings-profiles',
            label: t('Profiles'),
            copy: t('Switching, locks, and household access'),
        },
        {
            id: 'settings-playback',
            label: t('Playback'),
            copy: t('Subtitles, autoplay, and engine controls'),
        },
    ];

    // KEYBOARD NAVIGATION: Full support for ArrowUp / ArrowDown navigation
    // Through all list items and setting elements in the dashboard.
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

        const container = containerRef.current;
        if (!container) return;

        const activeElement = document.activeElement as HTMLElement | null;
        if (!(activeElement instanceof HTMLElement) || activeElement === document.body) {
            return;
        }

        if (!container.contains(activeElement)) {
            return;
        }

        if (activeElement.closest('input, textarea, select, [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"], [role="dialog"], .multiselect, .multiselect-menu-dropdown')) {
            return;
        }

        const focusable = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)) as HTMLElement[];
        if (focusable.length === 0) return;

        const currentIndex = focusable.indexOf(activeElement);
        if (currentIndex === -1) {
            return;
        }

        let nextIndex: number;

        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        }

        e.preventDefault();
        focusable[nextIndex]?.focus();
        focusable[nextIndex]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const target = document.getElementById(id);
        if (!(target instanceof HTMLElement)) {
            return;
        }

        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <MainNavBars className={styles['settings-container']} route={'settings'}>
            <div ref={containerRef} className={classNames(styles['settings-content'], 'animation-fade-in')}>
                <section className={styles['settings-hero']}>
                    <div className={styles['hero-copy']}>
                        <div className={styles['hero-eyebrow']}>{t('CONTROL ROOM')}</div>
                        <h1 className={styles['hero-title']}>{t('Tune the room, not just the player.')}</h1>
                        <p className={styles['hero-description']}>
                            {t('A cleaner settings layout for account access, profile control, and playback behavior.')} {' '}
                            {t('The visual noise is gone, including the profile artwork treatment.')}
                        </p>
                    </div>

                    <div className={styles['hero-summary-grid']}>
                        {summaryCards.map((card) => (
                            <div key={card.label} className={styles['summary-card']}>
                                <div className={styles['summary-label']}>{card.label}</div>
                                <div className={styles['summary-value']}>{card.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className={styles['settings-layout']}>
                    <aside className={styles['settings-sidebar']}>
                        <div className={styles['sidebar-card']}>
                            <div className={styles['sidebar-label']}>{t('Jump')}</div>
                            <div className={styles['sidebar-links']}>
                                {quickLinks.map((link) => (
                                    <button
                                        key={link.id}
                                        type="button"
                                        className={styles['sidebar-link']}
                                        onClick={() => scrollToSection(link.id)}
                                    >
                                        <span className={styles['sidebar-link-label']}>{link.label}</span>
                                        <span className={styles['sidebar-link-copy']}>{link.copy}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles['sidebar-card']}>
                            <div className={styles['sidebar-label']}>{t('Direction')}</div>
                            <p className={styles['sidebar-note']}>
                                {t('Account surfaces are now text-first. Profile switching stays available without showing the old avatar art in the top bar or the main settings header.')}
                            </p>
                        </div>
                    </aside>

                    <div className={styles['panel-stack']}>
                        <section id="settings-account" tabIndex={-1} className={styles['panel-shell']}>
                            <div className={styles['panel-heading']}>
                                <div className={styles['panel-kicker']}>{t('Identity')}</div>
                                <h2 className={styles['panel-title']}>{t('Account & access')}</h2>
                                <p className={styles['panel-copy']}>
                                    {t('Sign-in state, security controls, device presence, and connected services.')}
                                </p>
                            </div>
                            <General profile={profile} />
                        </section>

                        <section id="settings-profiles" tabIndex={-1} className={styles['panel-shell']}>
                            <div className={styles['panel-heading']}>
                                <div className={styles['panel-kicker']}>{t('Household')}</div>
                                <h2 className={styles['panel-title']}>{t('Profiles & locks')}</h2>
                                <p className={styles['panel-copy']}>
                                    {t('Manage who gets in, who needs a PIN, and which profiles can be removed.')}
                                </p>
                            </div>
                            <ProfileManagement />
                        </section>

                        <section id="settings-playback" tabIndex={-1} className={styles['panel-shell']}>
                            <div className={styles['panel-heading']}>
                                <div className={styles['panel-kicker']}>{t('Playback')}</div>
                                <h2 className={styles['panel-title']}>{t('Player engine')}</h2>
                                <p className={styles['panel-copy']}>
                                    {t('Subtitle styling, autoplay behavior, and advanced playback controls in one place.')}
                                </p>
                            </div>
                            <Player profile={profile} />
                        </section>
                    </div>
                </div>

                <div className={styles['settings-footer']}>
                    <a href={buildAppHref('/tos')} className={styles['footer-link']}>Terms of Service</a>
                    <span className={styles['footer-separator']}>|</span>
                    <a href={buildAppHref('/privacy')} className={styles['footer-link']}>Privacy Policy</a>
                </div>

                <div className={styles['parked-content']}>
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
