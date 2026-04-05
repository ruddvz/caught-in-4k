const React = require('react');
const { useModelState, withCoreSuspender } = require('stremio/common');
const { useAuth } = require('stremio/common/AuthProvider');
const { sanitizeManagedAddonUrl } = require('stremio/common/managedAddonSecurity');
const { supabase, isSupabaseConfigured } = require('stremio/common/supabaseClient');
const { useServices } = require('stremio/services');

const MANAGED_ADDON_STORAGE_KEY = 'c4k.managed-addon-transport-urls';

const readPersistedManagedAddonTransportUrls = () => {
    if (typeof window === 'undefined') {
        return new Set();
    }

    try {
        const storedValue = window.localStorage.getItem(MANAGED_ADDON_STORAGE_KEY);
        const parsedValue = storedValue ? JSON.parse(storedValue) : [];
        if (!Array.isArray(parsedValue)) {
            return new Set();
        }

        return new Set(parsedValue.map(sanitizeManagedAddonUrl).filter(Boolean));
    } catch (_error) {
        return new Set();
    }
};

const persistManagedAddonTransportUrls = (transportUrls) => {
    if (typeof window === 'undefined') {
        return;
    }

    const normalizedTransportUrls = Array.from(new Set((transportUrls || []).map(sanitizeManagedAddonUrl).filter(Boolean)));
    if (normalizedTransportUrls.length === 0) {
        window.localStorage.removeItem(MANAGED_ADDON_STORAGE_KEY);
        return;
    }

    window.localStorage.setItem(MANAGED_ADDON_STORAGE_KEY, JSON.stringify(normalizedTransportUrls));
};

const buildManagedAddon = async (transportUrl) => {
    const safeTransportUrl = sanitizeManagedAddonUrl(transportUrl);
    if (!safeTransportUrl) {
        throw new Error('Managed addon URL must use https and a public host.');
    }

    const response = await fetch(safeTransportUrl, { redirect: 'manual' });
    if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
        throw new Error('Managed addon manifests cannot redirect.');
    }

    if (!response.ok) {
        throw new Error(`Failed to load addon manifest (${response.status})`);
    }

    const manifest = await response.json();
    return {
        installed: false,
        manifest,
        transportUrl: safeTransportUrl,
    };
};

const ManagedAddonSync = () => {
    const auth = useAuth();
    const { core } = useServices();
    const installedAddons = useModelState({
        action: {
            action: 'Load',
            args: {
                model: 'InstalledAddonsWithFilters',
                args: {
                    request: { type: null },
                },
            },
        },
        model: 'installed_addons',
    });
    const managedAddonsRef = React.useRef(new Map());
    const managedTransportUrlsRef = React.useRef(readPersistedManagedAddonTransportUrls());
    const syncInFlightRef = React.useRef(false);
    const resyncRequestedRef = React.useRef(false);
    const authReady = Boolean(auth && auth.loading === false);
    const installedAddonsReady = Boolean(installedAddons && Array.isArray(installedAddons.catalog));
    const syncTargetRef = React.useRef({ authReady: false, canUseManagedAddons: false, userId: null });
    const canUseManagedAddons = Boolean(authReady && auth?.user?.id && auth?.isApproved && auth?.isEntitled);
    const installedAddonsByTransportUrl = React.useMemo(() => {
        const nextMap = new Map();
        (installedAddons?.catalog || []).forEach((addon) => {
            if (typeof addon?.transportUrl === 'string' && addon.transportUrl.length > 0) {
                nextMap.set(addon.transportUrl, addon);
            }
        });
        return nextMap;
    }, [installedAddons]);

    const replaceManagedTransportUrls = React.useCallback((transportUrls) => {
        managedTransportUrlsRef.current = new Set(transportUrls);
        persistManagedAddonTransportUrls(Array.from(managedTransportUrlsRef.current));
    }, []);

    React.useEffect(() => {
        syncTargetRef.current = {
            authReady,
            canUseManagedAddons,
            userId: auth?.user?.id || null,
        };
    }, [auth?.user?.id, authReady, canUseManagedAddons]);

    const uninstallManagedAddons = React.useCallback((transportUrls = Array.from(managedTransportUrlsRef.current)) => {
        const remainingTransportUrls = new Set(managedTransportUrlsRef.current);

        transportUrls.forEach((transportUrl) => {
            const addon = managedAddonsRef.current.get(transportUrl) || installedAddonsByTransportUrl.get(transportUrl);
            if (!addon) {
                remainingTransportUrls.delete(transportUrl);
                return;
            }

            core.transport.dispatch({
                action: 'Ctx',
                args: {
                    action: 'UninstallAddon',
                    args: addon,
                },
            });
            managedAddonsRef.current.delete(transportUrl);
            remainingTransportUrls.delete(transportUrl);
        });

        replaceManagedTransportUrls(Array.from(remainingTransportUrls));
    }, [core, installedAddonsByTransportUrl, replaceManagedTransportUrls]);

    const syncManagedAddons = React.useCallback(async () => {
        const syncTarget = syncTargetRef.current;

        if (!syncTarget.authReady) {
            return;
        }

        if (!installedAddonsReady) {
            return;
        }

        if (!syncTarget.canUseManagedAddons || !isSupabaseConfigured() || !supabase) {
            uninstallManagedAddons();
            resyncRequestedRef.current = false;
            return;
        }

        if (syncInFlightRef.current) {
            resyncRequestedRef.current = true;
            return;
        }

        syncInFlightRef.current = true;
        try {
            const requestedUserId = syncTarget.userId;
            const { data, error } = await supabase
                .from('user_addons')
                .select('addon_transport_url')
                .eq('user_id', requestedUserId)
                .eq('enabled', true);

            if (error) {
                throw error;
            }

            if (
                !syncTargetRef.current.canUseManagedAddons ||
                syncTargetRef.current.userId !== requestedUserId
            ) {
                resyncRequestedRef.current = true;
                return;
            }

            const nextTransportUrls = new Set();
            (data || []).forEach((row) => {
                const safeTransportUrl = sanitizeManagedAddonUrl(row.addon_transport_url);
                if (!safeTransportUrl) {
                    console.error(`[ManagedAddonSync] Skipping unsafe curated addon URL: ${row.addon_transport_url}`);
                    return;
                }

                nextTransportUrls.add(safeTransportUrl);
            });

            Array.from(managedTransportUrlsRef.current).forEach((transportUrl) => {
                if (!nextTransportUrls.has(transportUrl)) {
                    uninstallManagedAddons([transportUrl]);
                }
            });

            for (const transportUrl of nextTransportUrls) {
                if (managedAddonsRef.current.has(transportUrl)) {
                    continue;
                }

                try {
                    const addon = await buildManagedAddon(transportUrl);

                    if (
                        !syncTargetRef.current.canUseManagedAddons ||
                        syncTargetRef.current.userId !== requestedUserId
                    ) {
                        resyncRequestedRef.current = true;
                        return;
                    }

                    core.transport.dispatch({
                        action: 'Ctx',
                        args: {
                            action: 'InstallAddon',
                            args: addon,
                        },
                    });
                    managedAddonsRef.current.set(transportUrl, addon);
                } catch (error) {
                    console.error(`[ManagedAddonSync] Failed to install curated addon: ${transportUrl}`, error);
                }
            }

            replaceManagedTransportUrls(Array.from(nextTransportUrls));
        } catch (error) {
            console.error('[ManagedAddonSync] Failed to synchronize curated addons:', error);
        } finally {
            syncInFlightRef.current = false;
            if (resyncRequestedRef.current) {
                resyncRequestedRef.current = false;
                Promise.resolve().then(() => {
                    syncManagedAddons();
                });
            }
        }
    }, [core, installedAddonsByTransportUrl, installedAddonsReady, replaceManagedTransportUrls, uninstallManagedAddons]);

    React.useEffect(() => {
        syncManagedAddons();
    }, [syncManagedAddons]);

    React.useEffect(() => {
        if (!canUseManagedAddons) {
            return undefined;
        }

        const onWindowFocus = () => {
            syncManagedAddons();
        };

        window.addEventListener('focus', onWindowFocus);
        return () => {
            window.removeEventListener('focus', onWindowFocus);
        };
    }, [canUseManagedAddons, syncManagedAddons]);

    return null;
};

module.exports = withCoreSuspender(ManagedAddonSync);