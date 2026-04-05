// Copyright (C) 2017-2023 Smart code 203358507

require('spatial-navigation-polyfill');
const React = require('react');
const classnames = require('classnames');
const { useTranslation } = require('react-i18next');
const { Router } = require('stremio-router');
const { Core, Shell, Chromecast, DragAndDrop, KeyboardShortcuts, ServicesProvider } = require('stremio/services');
const { NotFound } = require('stremio/routes');
const { addLocationChangeListener, getCurrentAppLocation, getNavigationTargetForEvent, navigateToAppHref } = require('stremio/common/navigation');
const { FileDropProvider, PlatformProvider, ToastProvider, TooltipProvider, ShortcutsProvider, CONSTANTS, withCoreSuspender, useShell, useBinaryState } = require('stremio/common');
const ServicesToaster = require('./ServicesToaster');
const DeepLinkHandler = require('./DeepLinkHandler');
const SearchParamsHandler = require('./SearchParamsHandler');
const ManagedAddonSync = require('./ManagedAddonSync');
const { default: UpdaterBanner } = require('./UpdaterBanner');
const { default: ShortcutsModal } = require('./ShortcutsModal');
const { c4kAgents } = require('../services/BackgroundAgents/C4KBackgroundAgents');
const ErrorDialog = require('./ErrorDialog');
const withProtectedRoutes = require('./withProtectedRoutes');
const routerViewsConfig = require('./routerViewsConfig');
const { AuthProvider } = require('stremio/common/AuthProvider');
const styles = require('./styles');

const RouterWithProtectedRoutes = withCoreSuspender(withProtectedRoutes(Router));

const App = () => {
    const translation = useTranslation();
    const i18n = translation.i18n || (Array.isArray(translation) ? translation[1] : null);
    const shell = useShell();
    const onPathNotMatch = React.useCallback(() => {
        return NotFound;
    }, []);
    const services = React.useMemo(() => {
        const core = new Core({
            appVersion: process.env.VERSION,
            shellVersion: null
        });
        return {
            core,
            shell: new Shell(),
            chromecast: new Chromecast(),
            keyboardShortcuts: new KeyboardShortcuts(),
            dragAndDrop: new DragAndDrop({ core })
        };
    }, []);
    const [initialized, setInitialized] = React.useState(false);
    const [shortcutModalOpen,, closeShortcutsModal, toggleShortcutModal] = useBinaryState(false);

    React.useEffect(() => {
        document.body.classList.add('caught-in-4k');

        // Restore dynamic accent color from the last selected profile
        try {
            const savedAccent = localStorage.getItem('c4k_active_profile_accent');
            if (savedAccent) {
                const accent = JSON.parse(savedAccent);
                document.documentElement.style.setProperty('--primary-accent-color', accent.accent);
                document.documentElement.style.setProperty('--outer-glow', accent.glow);
                document.documentElement.style.setProperty('--accent-dark', accent.accentDark);
            }
        } catch (_e) {
            // Keep default cyan accent on any error
        }

        // Start Background Agents
        c4kAgents.start();

        return () => {
            document.body.classList.remove('caught-in-4k');
            c4kAgents.stop();
        };
    }, []);

    const onShortcut = React.useCallback((name) => {
        if (name === 'shortcuts') {
            toggleShortcutModal();
        }
    }, [toggleShortcutModal]);

    React.useEffect(() => {
        let prevPath = getCurrentAppLocation().href;
        const onLocationChange = ({ href }) => {
            if (services.core.active) {
                services.core.transport.analytics({
                    event: 'LocationPathChanged',
                    args: { prevPath }
                });
            }
            prevPath = href;
        };

        return addLocationChangeListener(onLocationChange);
    }, [services.core]);
    React.useEffect(() => {
        const onDocumentClick = (event) => {
            const navigationTarget = getNavigationTargetForEvent(event);

            if (navigationTarget === null) {
                return;
            }

            event.preventDefault();
            navigateToAppHref(navigationTarget.href);
        };

        document.addEventListener('click', onDocumentClick);

        return () => {
            document.removeEventListener('click', onDocumentClick);
        };
    }, []);
    React.useEffect(() => {
        const onCoreStateChanged = () => {
            setInitialized(
                (services.core.active || services.core.error instanceof Error) &&
                (services.shell.active || services.shell.error instanceof Error)
            );
        };
        const onShellStateChanged = () => {
            setInitialized(
                (services.core.active || services.core.error instanceof Error) &&
                (services.shell.active || services.shell.error instanceof Error)
            );
        };
        const onChromecastStateChange = () => {
            if (services.chromecast.active) {
                services.chromecast.transport.setOptions({
                    receiverApplicationId: CONSTANTS.CHROMECAST_RECEIVER_APP_ID,
                    autoJoinPolicy: chrome.cast.AutoJoinPolicy.PAGE_SCOPED,
                    resumeSavedSession: false,
                    language: null,
                    androidReceiverCompatible: true
                });
            }
        };
        services.core.on('stateChanged', onCoreStateChanged);
        services.shell.on('stateChanged', onShellStateChanged);
        services.chromecast.on('stateChanged', onChromecastStateChange);
        services.core.start();
        services.shell.start();
        services.chromecast.start();
        services.keyboardShortcuts.start();
        services.dragAndDrop.start();
        window.services = services;
        return () => {
            services.core.stop();
            services.shell.stop();
            services.chromecast.stop();
            services.keyboardShortcuts.stop();
            services.dragAndDrop.stop();
            services.core.off('stateChanged', onCoreStateChanged);
            services.shell.off('stateChanged', onShellStateChanged);
            services.chromecast.off('stateChanged', onChromecastStateChange);
        };
    }, []);

    // Handle shell events
    React.useEffect(() => {
        const onOpenMedia = (data) => {
            try {
                const { protocol, hostname, pathname, searchParams } = new URL(data);
                if (protocol === CONSTANTS.PROTOCOL) {
                    if (hostname.length) {
                        const transportUrl = `https://${hostname}${pathname}`;
                        navigateToAppHref(`/addons?addon=${encodeURIComponent(transportUrl)}`);
                    } else {
                        navigateToAppHref(`${pathname}${searchParams.toString().length > 0 ? `?${searchParams.toString()}` : ''}`);
                    }
                }
            } catch (e) {
                console.error('Failed to open media:', e);
            }
        };

        shell.on('open-media', onOpenMedia);

        return () => {
            shell.off('open-media', onOpenMedia);
        };
    }, []);

    React.useEffect(() => {
        const onCoreEvent = ({ event, args }) => {
            switch (event) {
                case 'SettingsUpdated': {
                    if (args && args.settings && typeof args.settings.interfaceLanguage === 'string') {
                        i18n.changeLanguage(args.settings.interfaceLanguage);
                    }

                    if (args?.settings?.quitOnClose && shell.windowClosed) {
                        shell.send('quit');
                    }

                    break;
                }
            }
        };
        const onCtxState = (state) => {
            if (state && state.profile && state.profile.settings && typeof state.profile.settings.interfaceLanguage === 'string') {
                i18n.changeLanguage(state.profile.settings.interfaceLanguage);
            }

            if (state?.profile?.settings?.quitOnClose && shell.windowClosed) {
                shell.send('quit');
            }
        };
        const onWindowFocus = () => {
            services.core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'PullAddonsFromAPI'
                }
            });
            services.core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'PullUserFromAPI',
                    args: {}
                }
            });
            services.core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'SyncLibraryWithAPI'
                }
            });
            services.core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'PullNotifications'
                }
            });
        };
        if (services.core.active) {
            onWindowFocus();
            window.addEventListener('focus', onWindowFocus);
            services.core.transport.on('CoreEvent', onCoreEvent);
            services.core.transport
                .getState('ctx')
                .then(onCtxState)
                .catch(console.error);
        }
        return () => {
            if (services.core.active) {
                window.removeEventListener('focus', onWindowFocus);
                services.core.transport.off('CoreEvent', onCoreEvent);
            }
        };
    }, [initialized, shell.windowClosed]);
    return (
        <React.StrictMode>
            <ServicesProvider services={services}>
                {
                    initialized ?
                        services.core.error instanceof Error ?
                            <ErrorDialog className={styles['error-container']} />
                            :
                            <PlatformProvider>
                                <AuthProvider>
                                <ToastProvider className={styles['toasts-container']}>
                                    <TooltipProvider className={styles['tooltip-container']}>
                                        <FileDropProvider className={styles['file-drop-container']}>
                                            <ShortcutsProvider onShortcut={onShortcut}>
                                                {
                                                    shortcutModalOpen && <ShortcutsModal onClose={closeShortcutsModal}/>
                                                }
                                                <ServicesToaster />
                                                <DeepLinkHandler />
                                                <SearchParamsHandler />
                                                <ManagedAddonSync />
                                                <UpdaterBanner className={styles['updater-banner-container']} />
                                                <RouterWithProtectedRoutes
                                                    className={classnames(styles['router'], 'animation-fade-in')}
                                                    viewsConfig={routerViewsConfig}
                                                    onPathNotMatch={onPathNotMatch}
                                                />
                                            </ShortcutsProvider>
                                        </FileDropProvider>
                                    </TooltipProvider>
                                </ToastProvider>
                                </AuthProvider>
                            </PlatformProvider>
                        :
                        <div className={styles['loader-container']} />
                }
            </ServicesProvider>
        </React.StrictMode>
    );
};

module.exports = App;
