/**
 * Media Session + desktop shell playback sync (aligned with upstream stremio-web).
 * Keeps OS media controls and embedded shell transport in sync with the HTML5 player.
 */

import { useEffect } from 'react';

import useShell from '../../common/useShell';

type MediaStatus = {
    paused: boolean;
};

const useMediaSession = (
    videoState: { paused: boolean | null },
    player: Record<string, unknown>,
    onPlayRequested: () => void,
    onPauseRequested: () => void,
    onNextVideoRequested: () => void
) => {
    const shell = useShell();

    // Playback state
    useEffect(() => {
        if (navigator.mediaSession) {
            const playbackState =
                videoState.paused === null ? 'none' : videoState.paused ? 'paused' : 'playing';
            navigator.mediaSession.playbackState = playbackState;
        }

        if (shell.active) {
            shell.send('media.status', {
                paused: !!videoState.paused,
            });
        }

        return () => {
            if (navigator.mediaSession) {
                navigator.mediaSession.playbackState = 'none';
            }
        };
    }, [shell.active, videoState.paused]);

    // Metadata (Now Playing)
    useEffect(() => {
        const mi = player.metaItem as { type?: string; content?: any } | undefined;
        const metaItem = mi && mi.type === 'Ready' ? mi.content ?? null : null;
        const selected = player.selected as { streamRequest?: { path?: { id?: string } } } | undefined;
        const videoId = selected?.streamRequest?.path?.id ?? null;
        const video =
            metaItem && Array.isArray(metaItem.videos)
                ? metaItem.videos.find(({ id }: { id: string }) => id === videoId)
                : null;

        const videoInfo = video?.season && video?.episode ? ` (${video.season}x${video.episode})` : null;
        const videoTitle = video ? `${video.title}${videoInfo}` : null;
        const metaTitle = metaItem ? metaItem.name : null;
        const imageUrl = metaItem ? metaItem.logo : null;

        const title = videoTitle ?? metaTitle;
        const artist = videoTitle && metaTitle ? metaTitle : undefined;
        const artwork = imageUrl ? [{ src: imageUrl }] : undefined;

        if (title) {
            if (navigator.mediaSession) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title,
                    artist,
                    artwork,
                });
            }

            if (shell.active) {
                shell.send('media.metadata', {
                    title,
                    artist,
                    artUrl: imageUrl,
                });
            }
        }
    }, [player.metaItem, player.selected, shell.active]);

    // Action handlers + reverse sync from shell
    useEffect(() => {
        if (navigator.mediaSession) {
            navigator.mediaSession.setActionHandler('play', onPlayRequested);
            navigator.mediaSession.setActionHandler('pause', onPauseRequested);
        }

        const nextVideoCallback = player.nextVideo ? onNextVideoRequested : null;
        if (navigator.mediaSession && nextVideoCallback) {
            navigator.mediaSession.setActionHandler('nexttrack', nextVideoCallback);
        }

        const onMediaStatus = ({ paused }: MediaStatus) => {
            if (paused) {
                onPauseRequested();
            } else {
                onPlayRequested();
            }
        };

        shell.on('media.status', onMediaStatus);

        return () => {
            if (navigator.mediaSession) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('nexttrack', null);
            }
            shell.off('media.status', onMediaStatus);
        };
    }, [player.nextVideo, onPlayRequested, onPauseRequested, onNextVideoRequested]);
};

export default useMediaSession;
