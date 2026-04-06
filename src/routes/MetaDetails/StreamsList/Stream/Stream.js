// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const _i18n = require('i18next');
const t = (...args) => (_i18n.t || _i18n.default?.t || ((x) => x))(...args);
const { useAuth } = require('stremio/common/AuthProvider');
const { PROFILE_CHANGE_EVENT, getSelectedProfileId } = require('stremio/common/profileStore');
const { useProfile, usePlatform, useToast, useBinaryState } = require('stremio/common');
const { Button, Image, Popup } = require('stremio/components');
const { useServices } = require('stremio/services');
const { useRouteFocused } = require('stremio-router');
const { createProfileContinueWatchingStore } = require('../../../../common/profileContinueWatching');
const StreamPlaceholder = require('./StreamPlaceholder');
const { resolveStreamLaunchTarget } = require('./resolveStreamLaunchTarget');
const styles = require('./styles');

const Stream = ({ className, videoId, videoReleased, metaId, metaType, metaName, poster, posterShape, releaseInfo, libraryItemId, addonName, name, description, thumbnail, progress, deepLinks, ...props }) => {
    const auth = useAuth();
    const profile = useProfile();
    const toast = useToast();
    const platform = usePlatform();
    const { core } = useServices();
    const routeFocused = useRouteFocused();
    const historyStore = React.useMemo(() => createProfileContinueWatchingStore(), []);
    const [selectedProfileId, setSelectedProfileId] = React.useState(() => (
        typeof localStorage !== 'undefined' ? getSelectedProfileId(localStorage, auth) : null
    ));

    const [menuOpen, , closeMenu, toggleMenu] = useBinaryState(false);

    React.useEffect(() => {
        const refreshSelectedProfile = () => {
            setSelectedProfileId(typeof localStorage !== 'undefined' ? getSelectedProfileId(localStorage, auth) : null);
        };

        refreshSelectedProfile();
        if (typeof window !== 'undefined') {
            window.addEventListener(PROFILE_CHANGE_EVENT, refreshSelectedProfile);
            return () => {
                window.removeEventListener(PROFILE_CHANGE_EVENT, refreshSelectedProfile);
            };
        }

        return undefined;
    }, [auth]);

    const popupLabelOnMouseUp = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented) {
            if (event.nativeEvent.ctrlKey || event.nativeEvent.button === 2) {
                event.preventDefault();
                toggleMenu();
            }
        }
    }, []);
    const popupLabelOnContextMenu = React.useCallback((event) => {
        if (!event.nativeEvent.togglePopupPrevented && !event.nativeEvent.ctrlKey) {
            event.preventDefault();
        }
    }, [toggleMenu]);
    const popupLabelOnLongPress = React.useCallback((event) => {
        if (event.nativeEvent.pointerType !== 'mouse' && !event.nativeEvent.togglePopupPrevented) {
            toggleMenu();
        }
    }, [toggleMenu]);
    const popupMenuOnPointerDown = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnContextMenu = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnClick = React.useCallback((event) => {
        event.nativeEvent.togglePopupPrevented = true;
    }, []);
    const popupMenuOnKeyDown = React.useCallback((event) => {
        event.nativeEvent.buttonClickPrevented = true;
    }, []);

    const launchTarget = React.useMemo(() => resolveStreamLaunchTarget({
        deepLinks,
        playerType: profile.settings.playerType,
        platformName: platform.name,
    }), [deepLinks, platform.name, profile.settings.playerType]);

    const href = launchTarget.href;
    const download = launchTarget.download;
    const target = launchTarget.target;

    const streamLink = React.useMemo(() => {
        return deepLinks?.externalPlayer?.streaming;
    }, [deepLinks]);

    const downloadLink = React.useMemo(() => {
        return deepLinks?.externalPlayer?.download;
    }, [deepLinks]);

    const markVideoAsWatched = React.useCallback(() => {
        if (typeof videoId === 'string') {
            core.transport.dispatch({
                action: 'MetaDetails',
                args: {
                    action: 'MarkVideoAsWatched',
                    args: [{ id: videoId, released: videoReleased }, true]
                }
            });
        }
    }, [videoId, videoReleased]);

    const primeProfileContinueWatching = React.useCallback(() => {
        if (!launchTarget.isExternal || !selectedProfileId || typeof metaId !== 'string' || typeof metaType !== 'string' || typeof videoId !== 'string') {
            return;
        }

        const existingEntry = historyStore.getEntries({ auth, profileId: selectedProfileId }).find((entry) => (
            !entry.completed && entry.metaId === metaId && entry.type === metaType && entry.videoId === videoId
        ));

        if (existingEntry) {
            return;
        }

        historyStore.upsertEntry({
            auth,
            profileId: selectedProfileId,
            entry: {
                metaId,
                type: metaType,
                libraryItemId: typeof libraryItemId === 'string' ? libraryItemId : null,
                videoId,
                videoReleased: videoReleased instanceof Date && !Number.isNaN(videoReleased.getTime())
                    ? videoReleased.toISOString()
                    : null,
                name: metaName,
                poster,
                posterShape,
                releaseInfo,
                deepLinks: {
                    metaDetailsStreams: deepLinks?.metaDetailsStreams ?? null,
                    metaDetailsVideos: deepLinks?.metaDetailsVideos ?? null,
                    player: deepLinks?.player ?? null,
                },
                timeOffset: 0,
                duration: 0,
                resumeFromStart: true,
            },
        });
    }, [auth, deepLinks, historyStore, launchTarget.isExternal, libraryItemId, metaId, metaName, metaType, poster, posterShape, releaseInfo, selectedProfileId, videoId, videoReleased]);

    const onClick = React.useCallback((event) => {
        if (launchTarget.isExternal) {
            primeProfileContinueWatching();
            markVideoAsWatched();
            toast.show({
                type: 'success',
                title: 'Stream opened in external player',
                timeout: 4000
            });
        }

        if (typeof props.onClick === 'function') {
            props.onClick(event);
        }
    }, [launchTarget.isExternal, markVideoAsWatched, primeProfileContinueWatching, props.onClick, toast]);

    const copyDownloadLink = React.useCallback((event) => {
        event.preventDefault();
        closeMenu();
        if (downloadLink) {
            navigator.clipboard.writeText(downloadLink)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('PLAYER_COPY_DOWNLOAD_LINK_SUCCESS'),
                        timeout: 4000
                    });
                })
                .catch(() => {
                    toast.show({
                        type: 'error',
                        title: t('PLAYER_COPY_DOWNLOAD_LINK_ERROR'),
                        timeout: 4000,
                    });
                });
        }
    }, [downloadLink]);

    const copyStreamLink = React.useCallback((event) => {
        event.preventDefault();
        closeMenu();
        if (streamLink) {
            navigator.clipboard.writeText(streamLink)
                .then(() => {
                    toast.show({
                        type: 'success',
                        title: t('PLAYER_COPY_STREAM_SUCCESS'),
                        timeout: 4000
                    });
                })
                .catch(() => {
                    toast.show({
                        type: 'error',
                        title: t('PLAYER_COPY_STREAM_ERROR'),
                        timeout: 4000,
                    });
                });
        }
    }, [streamLink]);

    const renderThumbnailFallback = React.useCallback(() => (
        <Icon className={styles['placeholder-icon']} name={'ic_broken_link'} />
    ), []);

    const renderLabel = React.useMemo(() => function renderLabel({ className, children, ...props }) {
        return (
            <Button className={classnames(className, styles['stream-container'])} title={addonName} href={href} target={target} download={download} onClick={onClick} {...props}>
                <div className={styles['info-container']}>
                    {
                        typeof thumbnail === 'string' && thumbnail.length > 0 ?
                            <div className={styles['thumbnail-container']} title={name || addonName}>
                                <Image
                                    className={styles['thumbnail']}
                                    src={thumbnail}
                                    alt={' '}
                                    renderFallback={renderThumbnailFallback}
                                />
                            </div>
                            :
                            <div className={styles['addon-name-container']} title={name || addonName}>
                                <div className={styles['addon-name']}>{name || addonName}</div>
                            </div>
                    }
                    {
                        progress !== null && !isNaN(progress) && progress > 0 ?
                            <div className={styles['progress-bar-container']}>
                                <div className={styles['progress-bar']} style={{ width: `${progress}%` }} />
                                <div className={styles['progress-bar-background']} />
                            </div>
                            :
                            null
                    }
                </div>
                <div className={styles['description-container']} title={description}>{description}</div>
                <Icon className={styles['icon']} name={'play'} />
                {children}
            </Button>
        );
    }, [thumbnail, progress, addonName, name, description, href, target, download, onClick]);

    const renderMenu = React.useMemo(() => function renderMenu() {
        return (
            <div className={styles['context-menu-content']} onPointerDown={popupMenuOnPointerDown} onContextMenu={popupMenuOnContextMenu} onClick={popupMenuOnClick} onKeyDown={popupMenuOnKeyDown}>
                <div className={styles['context-menu-title']}>
                    {description}
                </div>
                <Button className={styles['context-menu-option-container']} title={t('CTX_PLAY')}>
                    <Icon className={styles['menu-icon']} name={'play'} />
                    <div className={styles['context-menu-option-label']}>{t('CTX_PLAY')}</div>
                </Button>
                {
                    streamLink &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_COPY_STREAM_LINK')} onClick={copyStreamLink}>
                            <Icon className={styles['menu-icon']} name={'link'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_COPY_STREAM_LINK')}</div>
                        </Button>
                }
                {
                    downloadLink &&
                        <Button className={styles['context-menu-option-container']} title={t('CTX_DOWNLOAD_VIDEO')} onClick={copyDownloadLink}>
                            <Icon className={styles['menu-icon']} name={'download'} />
                            <div className={styles['context-menu-option-label']}>{t('CTX_COPY_VIDEO_DOWNLOAD_LINK')}</div>
                        </Button>
                }
            </div>
        );
    }, [copyStreamLink, onClick]);

    React.useEffect(() => {
        if (!routeFocused) {
            closeMenu();
        }
    }, [routeFocused]);

    return (
        <Popup
            className={className}
            onMouseUp={popupLabelOnMouseUp}
            onLongPress={popupLabelOnLongPress}
            onContextMenu={popupLabelOnContextMenu}
            open={menuOpen}
            onCloseRequest={closeMenu}
            renderLabel={renderLabel}
            renderMenu={renderMenu}
        />
    );
};

Stream.Placeholder = StreamPlaceholder;

Stream.propTypes = {
    className: PropTypes.string,
    videoId: PropTypes.string,
    videoReleased: PropTypes.instanceOf(Date),
    metaId: PropTypes.string,
    metaType: PropTypes.string,
    metaName: PropTypes.string,
    poster: PropTypes.string,
    posterShape: PropTypes.string,
    releaseInfo: PropTypes.string,
    libraryItemId: PropTypes.string,
    addonName: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    thumbnail: PropTypes.string,
    progress: PropTypes.number,
    deepLinks: PropTypes.shape({
        player: PropTypes.string,
        externalPlayer: PropTypes.shape({
            download: PropTypes.string,
            streaming: PropTypes.string,
            playlist: PropTypes.string,
            fileName: PropTypes.string,
            web: PropTypes.string,
            openPlayer: PropTypes.shape({
                ios: PropTypes.string,
                android: PropTypes.string,
                windows: PropTypes.string,
                macos: PropTypes.string,
                linux: PropTypes.string,
            })
        })
    }),
    onClick: PropTypes.func
};

module.exports = Stream;
