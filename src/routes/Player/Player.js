// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const langs = require('langs');
const { useTranslation } = require('react-i18next');
const { useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { onFileDrop, useSettings, useProfile, useFullscreen, useBinaryState, useToast, useStreamingServer, withCoreSuspender, CONSTANTS, useShell, usePlatform, onShortcut, useC4KSettings } = require('stremio/common');
const { useAuth } = require('stremio/common/AuthProvider');
const { PROFILE_CHANGE_EVENT, getSelectedProfileId } = require('stremio/common/profileStore');
const { HorizontalNavBar, Transition, ContextMenu } = require('stremio/components');
const { createProfileContinueWatchingStore } = require('../../common/profileContinueWatching');
const BufferingLoader = require('./BufferingLoader');
const VolumeChangeIndicator = require('./VolumeChangeIndicator');
const Error = require('./Error');
const ControlBar = require('./ControlBar');
const NextVideoPopup = require('./NextVideoPopup');
const StatisticsMenu = require('./StatisticsMenu');
const OptionsMenu = require('./OptionsMenu');
const SubtitlesMenu = require('./SubtitlesMenu');
const { default: AudioMenu } = require('./AudioMenu');
const SpeedMenu = require('./SpeedMenu');
const { default: SideDrawerButton } = require('./SideDrawerButton');
const { default: SideDrawer } = require('./SideDrawer');
const usePlayer = require('./usePlayer');
const useStatistics = require('./useStatistics');
const useVideo = require('./useVideo');
const useStreamFallback = require('./useStreamFallback');
const useBackgroundStreams = require('./useBackgroundStreams');
const { resolveExternalPlayerFallbackTarget } = require('./resolveExternalPlayerFallbackTarget');
const { getMaxAudioChannels } = require('./getMaxAudioChannels');
const styles = require('./styles');
const Video = require('./Video');
const { default: Indicator } = require('./Indicator/Indicator');
const { default: useMediaSession } = require('./useMediaSession');

const findTrackByLang = (tracks, lang) => tracks.find((track) => track.lang === lang || langs.where('1', track.lang)?.[2] === lang);
const findTrackById = (tracks, id) => tracks.find((track) => track.id === id);

const Player = ({ urlParams, queryParams }) => {
    const { t } = useTranslation();
    const services = useServices();
    const shell = useShell();
    const platform = usePlatform();
    const toast = useToast();
    const forceTranscoding = React.useMemo(() => {
        return queryParams.has('forceTranscoding');
    }, [queryParams]);
    const auth = useAuth();
    const profile = useProfile();
    const [player, videoParamsChanged, streamStateChanged, timeChanged, seek, pausedChanged, ended, nextVideo] = usePlayer(urlParams);
    const [settings] = useSettings();
    const streamingServer = useStreamingServer();
    const statistics = useStatistics(player, streamingServer);
    const video = useVideo();
    const [c4kSettings] = useC4KSettings();
    const playbackSessionKey = React.useMemo(() => {
        return [
            urlParams.stream,
            urlParams.streamTransportUrl,
            urlParams.metaTransportUrl,
            urlParams.type,
            urlParams.id,
            urlParams.videoId,
        ]
            .map((value) => (typeof value === 'string' ? value : ''))
            .join('|');
    }, [urlParams.stream, urlParams.streamTransportUrl, urlParams.metaTransportUrl, urlParams.type, urlParams.id, urlParams.videoId]);
    const fallback = useStreamFallback(video.state, video.events, playbackSessionKey);
    useBackgroundStreams(urlParams, fallback, playbackSessionKey);
    const externalFallbackTriggeredRef = React.useRef(false);
    const externalFallbackTarget = React.useMemo(() => {
        return resolveExternalPlayerFallbackTarget({
            exhausted: fallback.exhausted,
            externalPlayerFallbackEnabled: c4kSettings.externalPlayerFallback,
            playerType: profile.settings.playerType,
            selectedStream: player?.selected?.stream,
            videoStream: video.state.stream,
            platformName: platform.name,
        });
    }, [c4kSettings.externalPlayerFallback, fallback.exhausted, platform.name, player?.selected?.stream, profile.settings.playerType, video.state.stream]);

    React.useEffect(() => {
        externalFallbackTriggeredRef.current = false;
    }, [playbackSessionKey]);

    // When the internal fallback chain is exhausted and the user has opted in
    // to external-player fallback, redirect to their configured external player
    // (VLC, MPV, Infuse, etc.) for the currently-selected stream instead of
    // dead-ending in the Error UI. Guarded so it fires exactly once per
    // exhaustion event.
    React.useEffect(() => {
        if (!externalFallbackTarget) return;
        if (externalFallbackTriggeredRef.current) return;

        externalFallbackTriggeredRef.current = true;
        toast.show({
            type: 'success',
            title: 'All internal sources failed — handing off to external player',
            timeout: 4000,
        });

        if (externalFallbackTarget.download && typeof document !== 'undefined' && document.body) {
            const link = document.createElement('a');
            link.href = externalFallbackTarget.href;
            link.download = externalFallbackTarget.download;
            link.rel = 'noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        window.location.assign(externalFallbackTarget.href);
    }, [externalFallbackTarget, toast]);
    const routeFocused = useRouteFocused();
    const historyStore = React.useMemo(() => createProfileContinueWatchingStore(), []);
    const [selectedProfileId, setSelectedProfileId] = React.useState(() => (
        typeof localStorage !== 'undefined' ? getSelectedProfileId(localStorage, auth) : null
    ));

    const [seeking, setSeeking] = React.useState(false);

    const [casting, setCasting] = React.useState(() => {
        return services.chromecast.active && services.chromecast.transport.getCastState() === cast.framework.CastState.CONNECTED;
    });
    const playbackDevices = React.useMemo(() => streamingServer.playbackDevices !== null && streamingServer.playbackDevices.type === 'Ready' ? streamingServer.playbackDevices.content : [], [streamingServer]);

    const bufferingRef = React.useRef();
    const errorRef = React.useRef();

    const [immersed, setImmersed] = React.useState(true);
    const setImmersedDebounced = React.useCallback(debounce(setImmersed, 3000), []);
    const [, , , toggleFullscreen] = useFullscreen();

    const [optionsMenuOpen, , closeOptionsMenu, toggleOptionsMenu] = useBinaryState(false);
    const [subtitlesMenuOpen, , closeSubtitlesMenu, toggleSubtitlesMenu] = useBinaryState(false);
    const [audioMenuOpen, , closeAudioMenu, toggleAudioMenu] = useBinaryState(false);
    const [speedMenuOpen, , closeSpeedMenu, toggleSpeedMenu] = useBinaryState(false);
    const [statisticsMenuOpen, , closeStatisticsMenu, toggleStatisticsMenu] = useBinaryState(false);
    const [nextVideoPopupOpen, openNextVideoPopup, closeNextVideoPopup] = useBinaryState(false);
    const [sideDrawerOpen, , closeSideDrawer, toggleSideDrawer] = useBinaryState(false);

    const menusOpen = React.useMemo(() => {
        return optionsMenuOpen || subtitlesMenuOpen || audioMenuOpen || speedMenuOpen || statisticsMenuOpen || sideDrawerOpen;
    }, [optionsMenuOpen, subtitlesMenuOpen, audioMenuOpen, speedMenuOpen, statisticsMenuOpen, sideDrawerOpen]);

    const closeMenus = React.useCallback(() => {
        closeOptionsMenu();
        closeSubtitlesMenu();
        closeAudioMenu();
        closeSpeedMenu();
        closeStatisticsMenu();
        closeSideDrawer();
    }, []);

    const overlayHidden = React.useMemo(() => {
        return immersed && !casting && video.state.paused !== null && !video.state.paused && !menusOpen && !nextVideoPopupOpen;
    }, [immersed, casting, video.state.paused, menusOpen, nextVideoPopupOpen]);

    const nextVideoPopupDismissed = React.useRef(false);
    const defaultSubtitlesSelected = React.useRef(false);
    const subtitlesEnabled = React.useRef(true);
    const defaultAudioTrackSelected = React.useRef(false);
    const [error, setError] = React.useState(null);

    const isNavigating = React.useRef(false);

    const pressTimer = React.useRef(null);
    const longPress = React.useRef(false);
    const lastSavedPlaybackTimeRef = React.useRef(0);

    const HOLD_DELAY = 200;

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

    const persistProfileContinueWatching = React.useCallback((timeOffset = video.state.time, duration = video.state.duration) => {
        if (!selectedProfileId || player.metaItem?.type !== 'Ready' || !player.selected?.streamRequest?.path?.id) {
            return false;
        }

        if (typeof timeOffset !== 'number' || typeof duration !== 'number' || duration <= 0 || timeOffset <= 0) {
            return false;
        }

        const currentVideo = player.metaItem.content.videos.find((item) => item.id === player.selected.streamRequest.path.id);
        if (!currentVideo) {
            return false;
        }

        historyStore.upsertEntry({
            auth,
            profileId: selectedProfileId,
            entry: {
                metaId: player.metaItem.content.id,
                type: player.metaItem.content.type,
                libraryItemId: player.libraryItem?._id ?? null,
                videoId: currentVideo.id,
                videoReleased: currentVideo.released instanceof Date && !Number.isNaN(currentVideo.released.getTime())
                    ? currentVideo.released.toISOString()
                    : null,
                name: player.metaItem.content.name,
                poster: player.metaItem.content.poster,
                posterShape: player.metaItem.content.posterShape,
                releaseInfo: player.metaItem.content.releaseInfo,
                deepLinks: {
                    metaDetailsStreams: currentVideo.deepLinks?.metaDetailsStreams ?? null,
                    metaDetailsVideos: null,
                    player: currentVideo.deepLinks?.player ?? null,
                },
                timeOffset,
                duration,
            },
        });
        return true;
    }, [auth, historyStore, player.libraryItem, player.metaItem, player.selected, selectedProfileId, video.state.duration, video.state.time]);

    const completeProfileContinueWatching = React.useCallback(() => {
        if (!selectedProfileId || player.metaItem?.type !== 'Ready') {
            return;
        }

        historyStore.markCompleted({
            auth,
            profileId: selectedProfileId,
            metaId: player.metaItem.content.id,
            type: player.metaItem.content.type,
        });
    }, [auth, historyStore, player.metaItem, selectedProfileId]);

    const clearProfileContinueWatching = React.useCallback(() => {
        if (!selectedProfileId || player.metaItem?.type !== 'Ready') {
            return;
        }

        historyStore.dismissEntry({
            auth,
            profileId: selectedProfileId,
            metaId: player.metaItem.content.id,
            type: player.metaItem.content.type,
        });
    }, [auth, historyStore, player.metaItem, selectedProfileId]);

    const queueNextProfileContinueWatching = React.useCallback((nextVideoItem) => {
        if (!selectedProfileId || player.metaItem?.type !== 'Ready' || !nextVideoItem) {
            return;
        }

        historyStore.upsertEntry({
            auth,
            profileId: selectedProfileId,
            entry: {
                metaId: player.metaItem.content.id,
                type: player.metaItem.content.type,
                libraryItemId: player.libraryItem?._id ?? null,
                videoId: nextVideoItem.id,
                videoReleased: nextVideoItem.released instanceof Date && !Number.isNaN(nextVideoItem.released.getTime())
                    ? nextVideoItem.released.toISOString()
                    : null,
                name: player.metaItem.content.name,
                poster: player.metaItem.content.poster,
                posterShape: player.metaItem.content.posterShape,
                releaseInfo: player.metaItem.content.releaseInfo,
                deepLinks: {
                    metaDetailsStreams: nextVideoItem.deepLinks?.metaDetailsStreams ?? null,
                    metaDetailsVideos: nextVideoItem.deepLinks?.metaDetailsVideos ?? null,
                    player: nextVideoItem.deepLinks?.player ?? null,
                },
                timeOffset: 0,
                duration: 0,
                resumeFromStart: true,
            },
        });
    }, [auth, historyStore, player.libraryItem, player.metaItem, selectedProfileId]);

    const onImplementationChanged = React.useCallback(() => {
        video.setSubtitlesSize(settings.subtitlesSize);
        video.setSubtitlesOffset(settings.subtitlesOffset);
        video.setSubtitlesTextColor(settings.subtitlesTextColor);
        video.setSubtitlesBackgroundColor(settings.subtitlesBackgroundColor);
        video.setSubtitlesOutlineColor(settings.subtitlesOutlineColor);
    }, [settings]);

    const handleNextVideoNavigation = React.useCallback((deepLinks, bingeWatching, ended) => {
        if (ended) {
            if (bingeWatching) {
                if (deepLinks.player) {
                    isNavigating.current = true;
                    window.location.replace(deepLinks.player);
                } else if (deepLinks.metaDetailsStreams) {
                    isNavigating.current = true;
                    window.location.replace(deepLinks.metaDetailsStreams);
                }
            } else {
                window.history.back();
            }
        } else {
            if (deepLinks.player) {
                isNavigating.current = true;
                window.location.replace(deepLinks.player);
            } else if (deepLinks.metaDetailsStreams) {
                isNavigating.current = true;
                window.location.replace(deepLinks.metaDetailsStreams);
            }
        }
    }, []);

    const onEnded = React.useCallback(() => {
        // here we need to explicitly check for isNavigating.current
        // the ended event can be called multiple times by MPV inside Shell
        if (isNavigating.current) {
            return;
        }

        const nextVideoItem = window.playerNextVideo;
        if (nextVideoItem !== null) {
            queueNextProfileContinueWatching(nextVideoItem);
        } else {
            completeProfileContinueWatching();
        }

        ended();
        if (nextVideoItem !== null) {
            nextVideo();

            const deepLinks = nextVideoItem.deepLinks;
            handleNextVideoNavigation(deepLinks, profile.settings.bingeWatching, true);

        } else {
            window.history.back();
        }
    }, [completeProfileContinueWatching, ended, handleNextVideoNavigation, nextVideo, profile.settings.bingeWatching, queueNextProfileContinueWatching]);

    const onError = React.useCallback((error) => {
        console.error('Player', error);
        if (error.critical) {
            setError(error);
        } else {
            toast.show({
                type: 'error',
                title: t('ERROR'),
                message: error.message,
                timeout: 3000
            });
        }
    }, []);

    const onSubtitlesTrackLoaded = React.useCallback(() => {
        toast.show({
            type: 'success',
            title: t('PLAYER_SUBTITLES_LOADED'),
            message: t('PLAYER_SUBTITLES_LOADED_EMBEDDED'),
            timeout: 3000
        });
    }, []);

    const onExtraSubtitlesTrackLoaded = React.useCallback((track) => {
        toast.show({
            type: 'success',
            title: t('PLAYER_SUBTITLES_LOADED'),
            message:
                track.exclusive ? t('PLAYER_SUBTITLES_LOADED_EXCLUSIVE') :
                    track.local ? t('PLAYER_SUBTITLES_LOADED_LOCAL') :
                        t('PLAYER_SUBTITLES_LOADED_ORIGIN', { origin: track.origin }),
            timeout: 3000
        });
    }, []);

    const onExtraSubtitlesTrackAdded = React.useCallback((track) => {
        if (track.local) {
            video.setExtraSubtitlesTrack(track.id);
        }
    }, []);

    const onPlayRequested = React.useCallback(() => {
        video.setPaused(false);
        setSeeking(false);
    }, []);

    const onPlayRequestedDebounced = React.useCallback(debounce(onPlayRequested, 200), []);

    const onPauseRequested = React.useCallback(() => {
        video.setPaused(true);
    }, []);

    const onPauseRequestedDebounced = React.useCallback(debounce(onPauseRequested, 200), []);
    const onMuteRequested = React.useCallback(() => {
        video.setMuted(true);
    }, []);

    const onUnmuteRequested = React.useCallback(() => {
        video.setMuted(false);
    }, []);

    const onVolumeChangeRequested = React.useCallback((volume) => {
        video.setVolume(volume);
    }, []);

    const onSeekRequested = React.useCallback((time) => {
        video.setTime(time);
        seek(time, video.state.duration, video.state.manifest?.name);
    }, [video.state.duration, video.state.manifest]);

    const onPlaybackSpeedChanged = React.useCallback((rate) => {
        video.setPlaybackSpeed(rate);
    }, []);

    const onSubtitlesTrackSelected = React.useCallback((id) => {
        video.setSubtitlesTrack(id);
        streamStateChanged({
            subtitleTrack: {
                id,
                embedded: true,
            },
        });
    }, [streamStateChanged]);

    const onExtraSubtitlesTrackSelected = React.useCallback((id) => {
        video.setExtraSubtitlesTrack(id);
        streamStateChanged({
            subtitleTrack: {
                id,
                embedded: false,
            },
        });
    }, [streamStateChanged]);

    const onAudioTrackSelected = React.useCallback((id) => {
        video.setAudioTrack(id);
        streamStateChanged({
            audioTrack: {
                id,
            },
        });
    }, [streamStateChanged]);

    const onExtraSubtitlesDelayChanged = React.useCallback((delay) => {
        video.setSubtitlesDelay(delay);
        streamStateChanged({ subtitleDelay: delay });
    }, [streamStateChanged]);

    const onIncreaseSubtitlesDelay = React.useCallback(() => {
        const delay = video.state.extraSubtitlesDelay + 250;
        onExtraSubtitlesDelayChanged(delay);
    }, [video.state.extraSubtitlesDelay, onExtraSubtitlesDelayChanged]);

    const onDecreaseSubtitlesDelay = React.useCallback(() => {
        const delay = video.state.extraSubtitlesDelay - 250;
        onExtraSubtitlesDelayChanged(delay);
    }, [video.state.extraSubtitlesDelay, onExtraSubtitlesDelayChanged]);

    const onSubtitlesSizeChanged = React.useCallback((size) => {
        video.setSubtitlesSize(size);
        streamStateChanged({ subtitleSize: size });
    }, [streamStateChanged]);

    const onUpdateSubtitlesSize = React.useCallback((delta) => {
        const sizeIndex = CONSTANTS.SUBTITLES_SIZES.indexOf(video.state.subtitlesSize);
        const size = CONSTANTS.SUBTITLES_SIZES[Math.max(0, Math.min(CONSTANTS.SUBTITLES_SIZES.length - 1, sizeIndex + delta))];
        onSubtitlesSizeChanged(size);
    }, [video.state.subtitlesSize, onSubtitlesSizeChanged]);

    const onSubtitlesOffsetChanged = React.useCallback((offset) => {
        video.setSubtitlesOffset(offset);
        streamStateChanged({ subtitleOffset: offset });
    }, [streamStateChanged]);

    const onDismissNextVideoPopup = React.useCallback(() => {
        closeNextVideoPopup();
        nextVideoPopupDismissed.current = true;
    }, []);

    const navigateToNextVideo = React.useCallback((nextVideoItem, bingeWatching, ended) => {
        if (nextVideoItem === null) {
            return;
        }

        queueNextProfileContinueWatching(nextVideoItem);
        nextVideo();
        handleNextVideoNavigation(nextVideoItem.deepLinks, bingeWatching, ended);
    }, [handleNextVideoNavigation, nextVideo, queueNextProfileContinueWatching]);

    const onNextVideoRequested = React.useCallback(() => {
        if (player.nextVideo !== null) {
            navigateToNextVideo(player.nextVideo, profile.settings.bingeWatching, false);
        }
    }, [navigateToNextVideo, player.nextVideo, profile.settings.bingeWatching]);

    useMediaSession(video.state, player, onPlayRequested, onPauseRequested, onNextVideoRequested);

    const onVideoClick = React.useCallback(() => {
        if (video.state.paused !== null && !longPress.current) {
            if (video.state.paused) {
                onPlayRequestedDebounced();
            } else {
                onPauseRequestedDebounced();
            }
        }
    }, [video.state.paused, longPress.current]);

    const onVideoDoubleClick = React.useCallback(() => {
        onPlayRequestedDebounced.cancel();
        onPauseRequestedDebounced.cancel();
        toggleFullscreen();
    }, [toggleFullscreen]);

    const onContainerMouseDown = React.useCallback((event) => {
        if (!event.nativeEvent.optionsMenuClosePrevented) {
            closeOptionsMenu();
        }
        if (!event.nativeEvent.subtitlesMenuClosePrevented) {
            closeSubtitlesMenu();
        }
        if (!event.nativeEvent.audioMenuClosePrevented) {
            closeAudioMenu();
        }
        if (!event.nativeEvent.speedMenuClosePrevented) {
            closeSpeedMenu();
        }
        if (!event.nativeEvent.statisticsMenuClosePrevented) {
            closeStatisticsMenu();
        }

        closeSideDrawer();
    }, []);

    const onContainerMouseMove = React.useCallback((event) => {
        setImmersed(false);
        if (!event.nativeEvent.immersePrevented) {
            setImmersedDebounced(true);
        } else {
            setImmersedDebounced.cancel();
        }
    }, []);

    const onContainerMouseLeave = React.useCallback(() => {
        setImmersedDebounced.cancel();
        setImmersed(true);
    }, []);

    const onBarMouseMove = React.useCallback((event) => {
        event.nativeEvent.immersePrevented = true;
    }, []);

    onFileDrop(CONSTANTS.SUPPORTED_LOCAL_SUBTITLES, async (filename, buffer) => {
        video.addLocalSubtitles(filename, buffer);
    });

    React.useEffect(() => {
        setError(null);
        video.unload();
        lastSavedPlaybackTimeRef.current = 0;

        const streamContent = player.stream?.type === 'Ready' ? player.stream.content : null;
        const settingsLoading = streamingServer.settings?.type === 'Loading';
        // Web builds often never leave Loading until a local server is configured.
        // Direct HTTP / embeddable streams do not need server settings — only wait when
        // the pipeline requires convertStream to talk to the server (torrent/magnet/proxy).
        const mustWaitForServerSettings = Boolean(
            streamContent && settingsLoading && (
                (typeof streamContent.url === 'string' && streamContent.url.indexOf('magnet:') === 0) ||
                typeof streamContent.infoHash === 'string' ||
                Boolean(streamContent.behaviorHints && streamContent.behaviorHints.proxyHeaders)
            )
        );

        if (player.selected && streamContent && !mustWaitForServerSettings) {
            const fallbackTime = player.libraryItem !== null &&
                player.selected.streamRequest !== null &&
                player.selected.streamRequest.path !== null &&
                player.libraryItem.state.video_id === player.selected.streamRequest.path.id ?
                player.libraryItem.state.timeOffset
                :
                0;

            const streamPayload = {
                ...streamContent,
                subtitles: Array.isArray(player.selected.stream.subtitles) ?
                    player.selected.stream.subtitles.map((subtitles) => ({
                        ...subtitles,
                        label: subtitles.url
                    }))
                    :
                    []
            };
            // @stremio/stremio-video treats any string externalUrl as "external only" and
            // refuses to pick an implementation — empty strings from addons break playback.
            if (typeof streamPayload.externalUrl === 'string' && streamPayload.externalUrl.trim().length === 0) {
                delete streamPayload.externalUrl;
            }

            const serverBase = streamingServer.baseUrl;
            const selectedTransport = streamingServer.selected?.transportUrl;
            const streamingServerURL = casting && serverBase ?
                serverBase
                :
                (serverBase ? selectedTransport : (selectedTransport || null));

            video.load({
                stream: streamPayload,
                autoplay: true,
                time: historyStore.resolveResumeTime({
                    auth,
                    profileId: selectedProfileId,
                    libraryItemId: player.libraryItem?._id ?? null,
                    metaId: player.metaItem?.type === 'Ready' ? player.metaItem.content.id : (typeof urlParams.id === 'string' ? urlParams.id : null),
                    type: player.metaItem?.type === 'Ready' ? player.metaItem.content.type : (typeof urlParams.type === 'string' ? urlParams.type : null),
                    videoId: player.selected?.streamRequest?.path?.id ?? null,
                    fallbackTime,
                }),
                forceTranscoding: forceTranscoding || casting,
                maxAudioChannels: getMaxAudioChannels(settings.surroundSound),
                hardwareDecoding: settings.hardwareDecoding,
                assSubtitlesStyling: settings.assSubtitlesStyling,
                videoMode: settings.videoMode,
                platform: platform.name,
                streamingServerURL,
                streamingServerSettings: streamingServer.settings?.type === 'Ready' ?
                    streamingServer.settings.content
                    :
                    null,
                seriesInfo: player.seriesInfo,
            }, {
                chromecastTransport: services.chromecast.active ? services.chromecast.transport : null,
                shellTransport: services.shell.active ? services.shell.transport : null,
            });
        }
    }, [auth, casting, forceTranscoding, historyStore, player.libraryItem, player.metaItem, player.selected, player.seriesInfo, player.stream, player.selected?.stream, selectedProfileId, services.chromecast.active, services.shell.active, settings.assSubtitlesStyling, settings.hardwareDecoding, settings.surroundSound, settings.videoMode, streamingServer.baseUrl, streamingServer.selected.transportUrl, streamingServer.settings, urlParams.id, urlParams.type]);
    React.useEffect(() => {
        if (video.state.stream !== null) {
            const tracks = player.subtitles.map((subtitles) => ({
                ...subtitles,
                label: subtitles.url
            }));
            video.addExtraSubtitlesTracks(tracks);
        }
    }, [player.subtitles, video.state.stream]);

    React.useEffect(() => {
        !seeking && timeChanged(video.state.time, video.state.duration, video.state.manifest?.name);
    }, [video.state.time, video.state.duration, video.state.manifest, seeking]);

    React.useEffect(() => {
        if (seeking || video.state.time === null || video.state.duration === null) {
            return;
        }

        const roundedTime = Math.max(0, Math.round(video.state.time));
        if (roundedTime <= 0) {
            if (lastSavedPlaybackTimeRef.current > 0) {
                clearProfileContinueWatching();
                lastSavedPlaybackTimeRef.current = 0;
            }

            return;
        }

        if (lastSavedPlaybackTimeRef.current !== 0) {
            if (roundedTime < lastSavedPlaybackTimeRef.current) {
                if (persistProfileContinueWatching(roundedTime, video.state.duration)) {
                    lastSavedPlaybackTimeRef.current = roundedTime;
                }

                return;
            }

            if (roundedTime - lastSavedPlaybackTimeRef.current < 5) {
                return;
            }
        }

        if (persistProfileContinueWatching(roundedTime, video.state.duration)) {
            lastSavedPlaybackTimeRef.current = roundedTime;
        }
    }, [clearProfileContinueWatching, persistProfileContinueWatching, seeking, video.state.duration, video.state.time]);

    React.useEffect(() => {
        if (video.state.paused !== null) {
            pausedChanged(video.state.paused);

            if (video.state.paused) {
                persistProfileContinueWatching();
            }
        }
    }, [pausedChanged, persistProfileContinueWatching, video.state.paused]);

    React.useEffect(() => {
        videoParamsChanged(video.state.videoParams);
    }, [video.state.videoParams]);

    React.useEffect(() => {
        if (player.nextVideo !== null && !nextVideoPopupDismissed.current) {
            if (video.state.time !== null && video.state.duration !== null && video.state.time < video.state.duration && (video.state.duration - video.state.time) <= settings.nextVideoNotificationDuration) {
                openNextVideoPopup();
            } else {
                closeNextVideoPopup();
            }
        }
        if (player.nextVideo) {
            // This is a workaround for the fact that when we call onEnded nextVideo from the player is already set to null since core unloads the stream
            // we explicitly set it to a global variable so we can access it in the onEnded function
            // this is not a good solution but it works for now
            window.playerNextVideo = player.nextVideo;
        } else {
            window.playerNextVideo = null;
        }
    }, [player.nextVideo, video.state.time, video.state.duration]);

    // Auto subtitles track selection
    React.useEffect(() => {
        if (!defaultSubtitlesSelected.current) {
            if (settings.subtitlesLanguage === null) {
                video.setSubtitlesTrack(null);
                video.setExtraSubtitlesTrack(null);
                defaultSubtitlesSelected.current = true;
                return;
            }

            const savedTrackId = player.streamState?.subtitleTrack?.id;
            const subtitlesTrack = savedTrackId ?
                findTrackById(video.state.subtitlesTracks, savedTrackId) :
                findTrackByLang(video.state.subtitlesTracks, settings.subtitlesLanguage);

            const extraSubtitlesTrack = savedTrackId ?
                findTrackById(video.state.extraSubtitlesTracks, savedTrackId) :
                findTrackByLang(video.state.extraSubtitlesTracks, settings.subtitlesLanguage);

            if (subtitlesTrack && subtitlesTrack.id) {
                video.setSubtitlesTrack(subtitlesTrack.id);
                defaultSubtitlesSelected.current = true;
            } else if (extraSubtitlesTrack && extraSubtitlesTrack.id) {
                video.setExtraSubtitlesTrack(extraSubtitlesTrack.id);
                defaultSubtitlesSelected.current = true;
            }
        }
    }, [video.state.subtitlesTracks, video.state.extraSubtitlesTracks, player.streamState]);

    // Auto audio track selection
    React.useEffect(() => {
        if (!defaultAudioTrackSelected.current) {
            const savedTrackId = player.streamState?.audioTrack?.id;
            const audioTrack = savedTrackId ?
                findTrackById(video.state.audioTracks, savedTrackId) :
                findTrackByLang(video.state.audioTracks, settings.audioLanguage);

            if (audioTrack && audioTrack.id) {
                video.setAudioTrack(audioTrack.id);
                defaultAudioTrackSelected.current = true;
            }
        }
    }, [video.state.audioTracks, player.streamState]);

    // Saved subtitles settings
    React.useEffect(() => {
        if (video.state.stream !== null) {
            const delay = player.streamState?.subtitleDelay;
            if (typeof delay === 'number') {
                video.setSubtitlesDelay(delay);
            }

            const size = player.streamState?.subtitleSize;
            if (typeof size === 'number') {
                video.setSubtitlesSize(size);
            }

            const offset = player.streamState?.subtitleOffset;
            if (typeof offset === 'number') {
                video.setSubtitlesOffset(offset);
            }
        }
    }, [video.state.stream, player.streamState]);

    React.useEffect(() => {
        defaultSubtitlesSelected.current = false;
        defaultAudioTrackSelected.current = false;
        nextVideoPopupDismissed.current = false;
        // we need a timeout here to make sure that previous page unloads and the new one loads
        // avoiding race conditions and flickering
        setTimeout(() => isNavigating.current = false, 1000);
    }, [video.state.stream]);

    React.useEffect(() => {
        if ((!Array.isArray(video.state.subtitlesTracks) || video.state.subtitlesTracks.length === 0) &&
            (!Array.isArray(video.state.extraSubtitlesTracks) || video.state.extraSubtitlesTracks.length === 0)) {
            closeSubtitlesMenu();
        }
    }, [video.state.subtitlesTracks, video.state.extraSubtitlesTracks]);

    React.useEffect(() => {
        if (!Array.isArray(video.state.audioTracks) || video.state.audioTracks.length === 0) {
            closeAudioMenu();
        }
    }, [video.state.audioTracks]);

    React.useEffect(() => {
        if (video.state.playbackSpeed === null) {
            closeSpeedMenu();
        }
    }, [video.state.playbackSpeed]);

    React.useEffect(() => {
        const toastFilter = (item) => item?.dataset?.type === 'CoreEvent';
        toast.addFilter(toastFilter);
        const onCastStateChange = () => {
            setCasting(services.chromecast.active && services.chromecast.transport.getCastState() === cast.framework.CastState.CONNECTED);
        };
        const onChromecastServiceStateChange = () => {
            onCastStateChange();
            if (services.chromecast.active) {
                services.chromecast.transport.on(
                    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
                    onCastStateChange
                );
            }
        };
        const onCoreEvent = ({ event }) => {
            if (event === 'PlayingOnDevice') {
                onPauseRequested();
            }
        };
        services.chromecast.on('stateChanged', onChromecastServiceStateChange);
        services.core.transport.on('CoreEvent', onCoreEvent);
        onChromecastServiceStateChange();
        return () => {
            toast.removeFilter(toastFilter);
            services.chromecast.off('stateChanged', onChromecastServiceStateChange);
            services.core.transport.off('CoreEvent', onCoreEvent);
            if (services.chromecast.active) {
                services.chromecast.transport.off(
                    cast.framework.CastContextEventType.CAST_STATE_CHANGED,
                    onCastStateChange
                );
            }
        };
    }, []);

    React.useEffect(() => {
        if (settings.pauseOnMinimize && (shell.windowClosed || shell.windowHidden)) {
            onPauseRequested();
        }
    }, [settings.pauseOnMinimize, shell.windowClosed, shell.windowHidden]);

    onShortcut('playPause', () => {
        if (!menusOpen && !nextVideoPopupOpen && video.state.paused !== null) {
            if (video.state.paused) {
                onPlayRequested();
                setSeeking(false);
            } else if (!pressTimer.current) {
                onPauseRequested();
            }
        }
    }, [menusOpen, nextVideoPopupOpen, video.state.paused, pressTimer.current, onPlayRequested, onPauseRequested]);

    onShortcut('seekForward', (combo) => {
        if (!menusOpen && !nextVideoPopupOpen && video.state.time !== null) {
            const seekDuration = combo === 1 ? settings.seekShortTimeDuration : settings.seekTimeDuration;
            setSeeking(true);
            onSeekRequested(video.state.time + seekDuration);
        }
    }, [menusOpen, nextVideoPopupOpen, video.state.time, onSeekRequested]);

    onShortcut('seekBackward', (combo) => {
        if (!menusOpen && !nextVideoPopupOpen && video.state.time !== null) {
            const seekDuration = combo === 1 ? settings.seekShortTimeDuration : settings.seekTimeDuration;
            setSeeking(true);
            onSeekRequested(video.state.time - seekDuration);
        }
    }, [menusOpen, nextVideoPopupOpen, video.state.time, onSeekRequested]);

    onShortcut('mute', () => {
        if (menusOpen || nextVideoPopupOpen) return;
        video.state.muted === true ? onUnmuteRequested() : onMuteRequested();
    }, [video.state.muted, menusOpen, nextVideoPopupOpen]);

    onShortcut('volumeUp', () => {
        if (!menusOpen && !nextVideoPopupOpen && video.state.volume !== null) {
            onVolumeChangeRequested(Math.min(video.state.volume + 5, 200));
        }
    }, [menusOpen, nextVideoPopupOpen, video.state.volume]);

    onShortcut('volumeDown', () => {
        if (!menusOpen && !nextVideoPopupOpen && video.state.volume !== null) {
            onVolumeChangeRequested(Math.min(video.state.volume - 5, 200));
        }
    }, [menusOpen, nextVideoPopupOpen, video.state.volume]);

    onShortcut('subtitlesDelay', (combo) => {
        if (menusOpen || nextVideoPopupOpen) return;
        combo === 1 ? onIncreaseSubtitlesDelay() : onDecreaseSubtitlesDelay();
    }, [onIncreaseSubtitlesDelay, onDecreaseSubtitlesDelay, menusOpen, nextVideoPopupOpen]);

    onShortcut('subtitlesSize', (combo) => {
        if (menusOpen || nextVideoPopupOpen) return;
        combo === 1 ? onUpdateSubtitlesSize(-1) : onUpdateSubtitlesSize(1);
    }, [onUpdateSubtitlesSize, menusOpen, nextVideoPopupOpen]);

    onShortcut('toggleSubtitles', () => {
        if (menusOpen || nextVideoPopupOpen) return;
        const savedTrack = player.streamState?.subtitleTrack;

        if (subtitlesEnabled.current) {
            video.setSubtitlesTrack(null);
            video.setExtraSubtitlesTrack(null);
        } else if (savedTrack?.id) {
            savedTrack.embedded ? video.setSubtitlesTrack(savedTrack.id) : video.setExtraSubtitlesTrack(savedTrack.id);
        }

        subtitlesEnabled.current = !subtitlesEnabled.current;
    }, [player.streamState, menusOpen, nextVideoPopupOpen]);

    onShortcut('subtitlesMenu', () => {
        closeMenus();
        if (video.state?.subtitlesTracks?.length > 0 || video.state?.extraSubtitlesTracks?.length > 0) {
            toggleSubtitlesMenu();
        }
    }, [video.state.subtitlesTracks, video.state.extraSubtitlesTracks, toggleSubtitlesMenu]);

    onShortcut('audioMenu', () => {
        closeMenus();
        if (video.state?.audioTracks?.length > 0) {
            toggleAudioMenu();
        }
    }, [video.state.audioTracks, toggleAudioMenu]);

    onShortcut('infoMenu', () => {
        closeMenus();
        if (player.metaItem?.type === 'Ready') {
            toggleSideDrawer();
        }
    }, [player.metaItem, toggleSideDrawer]);

    onShortcut('speedMenu', () => {
        closeMenus();
        if (video.state.playbackSpeed !== null) {
            toggleSpeedMenu();
        }
    }, [video.state.playbackSpeed, toggleSpeedMenu]);

    onShortcut('statisticsMenu', () => {
        closeMenus();
        const stream = player.selected?.stream;
        if (streamingServer?.statistics?.type !== 'Err' && (typeof stream === 'string' || typeof stream === 'number')) {
            toggleStatisticsMenu();
        }
    }, [player.selected, streamingServer.statistics, toggleStatisticsMenu]);

    onShortcut('playNext', () => {
        closeMenus();
        if (window.playerNextVideo !== null) {
            navigateToNextVideo(window.playerNextVideo, false, false);
        }
    }, [closeMenus, navigateToNextVideo]);

    onShortcut('exit', () => {
        closeMenus();
        !settings.escExitFullscreen && window.history.back();
    }, [settings.escExitFullscreen]);

    React.useLayoutEffect(() => {
        const onKeyDown = (e) => {
            if (e.code !== 'Space' || e.repeat) return;
            if (menusOpen || nextVideoPopupOpen) return;

            longPress.current = false;

            pressTimer.current = setTimeout(() => {
                longPress.current = true;
                onPlaybackSpeedChanged(2);
            }, HOLD_DELAY);
        };

        const onKeyUp = (e) => {
            if (e.code !== 'Space' && e.code !== 'ArrowRight' && e.code !== 'ArrowLeft') return;

            if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
                setSeeking(false);
                return;
            }
            if (e.code === 'Space') {
                clearTimeout(pressTimer.current);
                pressTimer.current = null;
                onPlaybackSpeedChanged(1);
            }
        };

        const onWheel = ({ deltaY }) => {
            if (menusOpen || video.state.volume === null) return;

            if (deltaY > 0) {
                onVolumeChangeRequested(Math.max(video.state.volume - 5, 0));
            } else {
                if (video.state.volume < 100) {
                    onVolumeChangeRequested(Math.min(video.state.volume + 5, 100));
                }
            }
        };

        const onMouseDownHold = (e) => {
            if (e.button !== 0) return; // left mouse button only
            if (!video.containerRef.current?.contains(e.target)) return;
            if (menusOpen || nextVideoPopupOpen) return;

            longPress.current = false;

            pressTimer.current = setTimeout(() => {
                longPress.current = true;
                onPlaybackSpeedChanged(2);
            }, HOLD_DELAY);
        };

        const onMouseUp = (e) => {
            if (e.button !== 0) return;

            clearTimeout(pressTimer.current);

            if (longPress.current) {
                onPlaybackSpeedChanged(1);
            }
        };

        if (routeFocused) {
            window.addEventListener('keyup', onKeyUp);
            window.addEventListener('keydown', onKeyDown);
            window.addEventListener('wheel', onWheel);
            window.addEventListener('mousedown', onMouseDownHold);
            window.addEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('mousedown', onMouseDownHold);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [routeFocused, menusOpen, nextVideoPopupOpen, video.state.volume]);

    // Cancel an in-flight hold-to-speed-up when a menu/popup opens mid-hold.
    // Otherwise the 2x timer fires (or stays active) while the user is in a
    // menu and there's no key/mouse-up to restore 1x speed. Upstream fix.
    React.useEffect(() => {
        if (!menusOpen && !nextVideoPopupOpen) return;
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
            pressTimer.current = null;
        }
        if (longPress.current) {
            longPress.current = false;
            onPlaybackSpeedChanged(1);
        }
    }, [menusOpen, nextVideoPopupOpen]);

    React.useEffect(() => {
        video.events.on('error', onError);
        video.events.on('ended', onEnded);
        video.events.on('subtitlesTrackLoaded', onSubtitlesTrackLoaded);
        video.events.on('extraSubtitlesTrackLoaded', onExtraSubtitlesTrackLoaded);
        video.events.on('extraSubtitlesTrackAdded', onExtraSubtitlesTrackAdded);
        video.events.on('implementationChanged', onImplementationChanged);

        return () => {
            video.events.off('error', onError);
            video.events.off('ended', onEnded);
            video.events.off('subtitlesTrackLoaded', onSubtitlesTrackLoaded);
            video.events.off('extraSubtitlesTrackLoaded', onExtraSubtitlesTrackLoaded);
            video.events.off('extraSubtitlesTrackAdded', onExtraSubtitlesTrackAdded);
            video.events.off('implementationChanged', onImplementationChanged);
        };
    }, []);

    React.useLayoutEffect(() => {
        return () => {
            setImmersedDebounced.cancel();
            onPlayRequestedDebounced.cancel();
            onPauseRequestedDebounced.cancel();
        };
    }, []);

    return (
        <div className={classnames(styles['player-container'], { [styles['overlayHidden']]: overlayHidden })}
            onMouseDown={onContainerMouseDown}
            onMouseMove={onContainerMouseMove}
            onMouseOver={onContainerMouseMove}
            onMouseLeave={onContainerMouseLeave}>
            <Video
                ref={video.containerRef}
                className={styles['layer']}
                onClick={onVideoClick}
                onDoubleClick={onVideoDoubleClick}
            />
            {
                !video.state.loaded ?
                    <div className={classnames(styles['layer'], styles['background-layer'])}>
                        <img className={styles['image']} src={player?.metaItem?.content?.background} />
                    </div>
                    :
                    null
            }
            {
                (video.state.buffering || !video.state.loaded) && !error && !fallback.exhausted ?
                    <BufferingLoader
                        ref={bufferingRef}
                        className={classnames(styles['layer'], styles['buffering-layer'])}
                        attemptNumber={fallback.enabled ? fallback.attemptNumber : null}
                        totalCandidates={fallback.enabled ? fallback.totalCandidates : null}
                    />
                    :
                    null
            }
            {
                error !== null ?
                    <Error
                        ref={errorRef}
                        className={classnames(styles['layer'], styles['error-layer'])}
                        stream={video.state.stream}
                        {...error}
                    />
                    : fallback.exhausted ?
                        <Error
                            ref={errorRef}
                            className={classnames(styles['layer'], styles['error-layer'])}
                            stream={video.state.stream}
                            code={1}
                            message={`All ${fallback.totalCandidates} stream sources failed. Try a different quality or addon.`}
                        />
                        :
                        null
            }
            {
                menusOpen ?
                    <div className={styles['layer']} />
                    :
                    null
            }
            {
                video.state.volume !== null && overlayHidden ?
                    <VolumeChangeIndicator
                        muted={video.state.muted}
                        volume={video.state.volume}
                    />
                    :
                    null
            }
            <ContextMenu on={[video.containerRef, bufferingRef, errorRef]} autoClose>
                <OptionsMenu
                    className={classnames(styles['layer'], styles['menu-layer'])}
                    stream={player?.selected?.stream}
                    playbackDevices={playbackDevices}
                    extraSubtitlesTracks={video.state.extraSubtitlesTracks}
                    selectedExtraSubtitlesTrackId={video.state.selectedExtraSubtitlesTrackId}
                />
            </ContextMenu>
            <HorizontalNavBar
                className={classnames(styles['layer'], styles['nav-bar-layer'])}
                title={player.title !== null ? player.title : ''}
                backButton={true}
                fullscreenButton={true}
                onMouseMove={onBarMouseMove}
                onMouseOver={onBarMouseMove}
            />
            {
                player.metaItem?.type === 'Ready' ?
                    <SideDrawerButton
                        className={classnames(styles['layer'], styles['side-drawer-button-layer'])}
                        onClick={toggleSideDrawer}
                    />
                    :
                    null
            }
            <ControlBar
                className={classnames(styles['layer'], styles['control-bar-layer'])}
                paused={video.state.paused}
                time={video.state.time}
                duration={video.state.duration}
                buffered={video.state.buffered}
                volume={video.state.volume}
                muted={video.state.muted}
                playbackSpeed={video.state.playbackSpeed}
                subtitlesTracks={video.state.subtitlesTracks.concat(video.state.extraSubtitlesTracks)}
                audioTracks={video.state.audioTracks}
                metaItem={player.metaItem}
                nextVideo={player.nextVideo}
                stream={player.selected !== null ? player.selected.stream : null}
                statistics={statistics}
                onPlayRequested={onPlayRequested}
                onPauseRequested={onPauseRequested}
                onNextVideoRequested={onNextVideoRequested}
                onMuteRequested={onMuteRequested}
                onUnmuteRequested={onUnmuteRequested}
                onVolumeChangeRequested={onVolumeChangeRequested}
                onSeekRequested={onSeekRequested}
                onToggleOptionsMenu={toggleOptionsMenu}
                onToggleSubtitlesMenu={toggleSubtitlesMenu}
                onToggleAudioMenu={toggleAudioMenu}
                onToggleSpeedMenu={toggleSpeedMenu}
                onToggleStatisticsMenu={toggleStatisticsMenu}
                onToggleSideDrawer={toggleSideDrawer}
                onMouseMove={onBarMouseMove}
                onMouseOver={onBarMouseMove}
                onTouchEnd={onContainerMouseLeave}
            />
            <Indicator
                className={classnames(styles['layer'], styles['indicator-layer'])}
                videoState={video.state}
                disabled={subtitlesMenuOpen}
            />
            {
                nextVideoPopupOpen ?
                    <NextVideoPopup
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        metaItem={player.metaItem !== null && player.metaItem.type === 'Ready' ? player.metaItem.content : null}
                        nextVideo={player.nextVideo}
                        onDismiss={onDismissNextVideoPopup}
                        onNextVideoRequested={onNextVideoRequested}
                    />
                    :
                    null
            }
            {
                statisticsMenuOpen ?
                    <StatisticsMenu
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        {...statistics}
                    />
                    :
                    null
            }
            <Transition when={sideDrawerOpen} name={'slide-left'}>
                <SideDrawer
                    className={classnames(styles['layer'], styles['side-drawer-layer'])}
                    metaItem={player.metaItem?.content}
                    seriesInfo={player.seriesInfo}
                    closeSideDrawer={closeSideDrawer}
                    selected={player.selected?.streamRequest?.path.id}
                />
            </Transition>
            {
                subtitlesMenuOpen ?
                    <SubtitlesMenu
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        subtitlesTracks={video.state.subtitlesTracks}
                        selectedSubtitlesTrackId={video.state.selectedSubtitlesTrackId}
                        subtitlesOffset={video.state.subtitlesOffset}
                        subtitlesSize={video.state.subtitlesSize}
                        extraSubtitlesTracks={video.state.extraSubtitlesTracks}
                        selectedExtraSubtitlesTrackId={video.state.selectedExtraSubtitlesTrackId}
                        extraSubtitlesOffset={video.state.extraSubtitlesOffset}
                        extraSubtitlesDelay={video.state.extraSubtitlesDelay}
                        extraSubtitlesSize={video.state.extraSubtitlesSize}
                        onSubtitlesTrackSelected={onSubtitlesTrackSelected}
                        onExtraSubtitlesTrackSelected={onExtraSubtitlesTrackSelected}
                        onSubtitlesOffsetChanged={onSubtitlesOffsetChanged}
                        onSubtitlesSizeChanged={onSubtitlesSizeChanged}
                        onExtraSubtitlesOffsetChanged={onSubtitlesOffsetChanged}
                        onExtraSubtitlesDelayChanged={onExtraSubtitlesDelayChanged}
                        onExtraSubtitlesSizeChanged={onSubtitlesSizeChanged}
                    />
                    :
                    null
            }
            {
                audioMenuOpen ?
                    <AudioMenu
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        audioTracks={video.state.audioTracks}
                        selectedAudioTrackId={video.state.selectedAudioTrackId}
                        onAudioTrackSelected={onAudioTrackSelected}
                    />
                    :
                    null
            }
            {
                speedMenuOpen ?
                    <SpeedMenu
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        playbackSpeed={video.state.playbackSpeed}
                        onPlaybackSpeedChanged={onPlaybackSpeedChanged}
                    />
                    :
                    null
            }
            {
                optionsMenuOpen ?
                    <OptionsMenu
                        className={classnames(styles['layer'], styles['menu-layer'])}
                        stream={player.selected.stream}
                        playbackDevices={playbackDevices}
                        extraSubtitlesTracks={video.state.extraSubtitlesTracks}
                        selectedExtraSubtitlesTrackId={video.state.selectedExtraSubtitlesTrackId}
                    />
                    :
                    null
            }
        </div>
    );
};

Player.propTypes = {
    urlParams: PropTypes.shape({
        stream: PropTypes.string,
        streamTransportUrl: PropTypes.string,
        metaTransportUrl: PropTypes.string,
        type: PropTypes.string,
        id: PropTypes.string,
        videoId: PropTypes.string
    }),
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

const PlayerFallback = () => (
    <div className={classnames(styles['player-container'])} />
);

module.exports = withCoreSuspender(Player, PlayerFallback);
