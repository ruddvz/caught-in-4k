// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const langs = require('langs');
const useSettings = require('stremio/common/useSettings').default;

const findTrackByLang = (tracks, lang) => (
    Array.isArray(tracks)
        ? tracks.find((track) => track.lang === lang || langs.where('1', track.lang)?.[2] === lang)
        : undefined
);

const findTrackById = (tracks, id) => (
    Array.isArray(tracks) ? tracks.find((track) => track.id === id) : undefined
);

/**
 * Subtitle track selection, persistence, and menu state derived from player + video.
 */
const useSubtitles = ({
    player,
    video,
    defaultSubtitlesSelectedRef,
    closeSubtitlesMenu,
}) => {
    const [settings] = useSettings();

    const subtitlesEnabled = React.useMemo(() => {
        return Boolean(
            video.state.selectedSubtitlesTrackId ||
            video.state.selectedExtraSubtitlesTrackId
        );
    }, [video.state.selectedSubtitlesTrackId, video.state.selectedExtraSubtitlesTrackId]);

    React.useEffect(() => {
        if (!defaultSubtitlesSelectedRef || defaultSubtitlesSelectedRef.current) {
            return;
        }

        if (settings.subtitlesLanguage === null) {
            video.setSubtitlesTrack(null);
            video.setExtraSubtitlesTrack(null);
            defaultSubtitlesSelectedRef.current = true;
            return;
        }

        const savedTrackId = player.streamState?.subtitleTrack?.id;
        const subtitlesTrack = savedTrackId
            ? findTrackById(video.state.subtitlesTracks, savedTrackId)
            : findTrackByLang(video.state.subtitlesTracks, settings.subtitlesLanguage);

        const extraSubtitlesTrack = savedTrackId
            ? findTrackById(video.state.extraSubtitlesTracks, savedTrackId)
            : findTrackByLang(video.state.extraSubtitlesTracks, settings.subtitlesLanguage);

        if (subtitlesTrack?.id) {
            video.setSubtitlesTrack(subtitlesTrack.id);
            defaultSubtitlesSelectedRef.current = true;
        } else if (extraSubtitlesTrack?.id) {
            video.setExtraSubtitlesTrack(extraSubtitlesTrack.id);
            defaultSubtitlesSelectedRef.current = true;
        }
    }, [
        video.state.subtitlesTracks,
        video.state.extraSubtitlesTracks,
        player.streamState,
        settings.subtitlesLanguage,
    ]);

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
        const hasSubs =
            (Array.isArray(video.state.subtitlesTracks) && video.state.subtitlesTracks.length > 0) ||
            (Array.isArray(video.state.extraSubtitlesTracks) && video.state.extraSubtitlesTracks.length > 0);
        if (!hasSubs && typeof closeSubtitlesMenu === 'function') {
            closeSubtitlesMenu();
        }
    }, [video.state.subtitlesTracks, video.state.extraSubtitlesTracks, closeSubtitlesMenu]);

    const formatSubtitleLabel = React.useCallback((track) => {
        if (!track) {
            return '';
        }
        if (track.label && typeof track.label === 'string' && !/^https?:\/\//i.test(track.label)) {
            return track.label;
        }
        if (track.lang) {
            return track.lang;
        }
        return track.id || '';
    }, []);

    return {
        subtitlesEnabled,
        formatSubtitleLabel,
        findTrackByLang,
        findTrackById,
    };
};

module.exports = useSubtitles;
