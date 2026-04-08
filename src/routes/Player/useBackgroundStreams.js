// Copyright (C) 2024 Caught In 4K
//
// Background stream discovery for direct-launch playback paths.
//
// QualityPicker is the only entry that pre-builds a multi-candidate fallback
// list before navigating to the Player. Direct launches (Continue Watching,
// Library, Hero "Watch Now", trailer click) navigate straight into Player with
// only a single stream URL — so useStreamFallback has nothing to fall back to
// when the chosen source dies.
//
// This hook fills that gap. As soon as the Player mounts on a direct-launch
// path, it spawns a background MetaDetails request via the WASM core to fetch
// every stream the user's addons can offer for the same (type, videoId), then
// builds a candidate list and injects it into useStreamFallback. The
// currently-playing URL is pinned at index 0 so the existing fallback machinery
// (buffering timeout, no-audio detection, critical error) just works without
// any extra wiring.
//
// Guards:
//   - Skip when fallback.enabled is already true (QualityPicker took care of it).
//   - Skip when persisted candidates already exist for this hash (handled inside
//     injectCandidates — a no-op when candidates.length > 0).
//   - Skip without urlParams.metaTransportUrl / type / videoId — there's nothing
//     to query.
//   - Inject only once per Player mount (hasInjectedRef).

const React = require('react');
const { useServices } = require('stremio/services');
const { useModelState } = require('stremio/common');

const BACKGROUND_MODEL = 'meta_details';

const buildAction = (urlParams) => {
    if (
        typeof urlParams.metaTransportUrl !== 'string' ||
        typeof urlParams.type !== 'string' ||
        typeof urlParams.id !== 'string' ||
        typeof urlParams.videoId !== 'string'
    ) {
        return { action: 'Unload' };
    }

    return {
        action: 'Load',
        args: {
            model: 'MetaDetails',
            args: {
                metaPath: {
                    resource: 'meta',
                    type: urlParams.type,
                    id: urlParams.id,
                    extra: [],
                },
                streamPath: {
                    resource: 'stream',
                    type: urlParams.type,
                    id: urlParams.videoId,
                    extra: [],
                },
                guessStream: false,
            },
        },
    };
};

const flattenStreams = (rawStreams) => {
    if (!Array.isArray(rawStreams)) return [];
    return rawStreams
        .filter((group) => group?.content?.type === 'Ready')
        .reduce((acc, group) => {
            const addonName = group?.addon?.manifest?.name;
            const list = group.content.content.map((stream) => ({
                deepLinks: stream.deepLinks,
                description: stream.description,
                name: stream.name,
                addonName,
            }));
            return acc.concat(list);
        }, []);
};

// Stable dedupe key per stream — prefer deepLinks.player (the URL the player
// will actually navigate to), fall back to externalPlayer streaming/download.
const streamKey = (stream) => {
    return stream?.deepLinks?.player
        || stream?.deepLinks?.externalPlayer?.streaming
        || stream?.deepLinks?.externalPlayer?.download
        || null;
};

const hrefToHash = (href) => {
    if (typeof href !== 'string' || href.length === 0) return null;
    return href.includes('#') ? href.slice(href.indexOf('#')) : href;
};

const buildRouteSignature = (urlParams) => {
    if (
        typeof urlParams.type !== 'string' ||
        typeof urlParams.id !== 'string' ||
        typeof urlParams.videoId !== 'string'
    ) {
        return null;
    }

    return `/${encodeURIComponent(urlParams.type)}/${encodeURIComponent(urlParams.id)}/${encodeURIComponent(urlParams.videoId)}`;
};

const matchesPlaybackSession = (playerHref, currentHash, routeSignature) => {
    const hash = hrefToHash(playerHref);
    if (typeof hash !== 'string') return false;
    if (hash === currentHash) return true;
    if (typeof routeSignature !== 'string') return false;

    return hash.endsWith(routeSignature) || hash.includes(`${routeSignature}?`);
};

const useBackgroundStreams = (urlParams, fallback, playbackSessionKey) => {
    const { core } = useServices();
    const action = React.useMemo(() => buildAction(urlParams), [urlParams.metaTransportUrl, urlParams.type, urlParams.id, urlParams.videoId]);
    const routeSignature = React.useMemo(() => buildRouteSignature(urlParams), [urlParams.type, urlParams.id, urlParams.videoId]);
    const metaDetails = useModelState({ model: BACKGROUND_MODEL, action });
    const hasInjectedRef = React.useRef(false);

    React.useEffect(() => {
        hasInjectedRef.current = false;
    }, [playbackSessionKey]);

    React.useEffect(() => {
        if (hasInjectedRef.current) return;
        if (!fallback || typeof fallback.injectCandidates !== 'function') return;
        if (fallback.enabled) {
            // QualityPicker already populated the list. Mark as handled so we
            // never overwrite it on a later state tick.
            hasInjectedRef.current = true;
            return;
        }
        if (!metaDetails || !Array.isArray(metaDetails.streams)) return;

        // Wait until at least one addon group has resolved Ready. Loading
        // groups are still in flight and may add more candidates shortly.
        const anyReady = metaDetails.streams.some((g) => g?.content?.type === 'Ready');
        const anyLoading = metaDetails.streams.some((g) => g?.content?.type === 'Loading');
        if (!anyReady) return;

        const flat = flattenStreams(metaDetails.streams);
        if (flat.length === 0) {
            // Nothing usable yet — wait for more groups unless everything is
            // already settled, in which case there is nothing to inject.
            if (!anyLoading) hasInjectedRef.current = true;
            return;
        }

        // Dedupe by player URL.
        const seen = new Set();
        const unique = [];
        for (const s of flat) {
            const key = streamKey(s);
            if (!key || seen.has(key)) continue;
            seen.add(key);
            unique.push(s);
        }

        // Pin the currently-playing URL at index 0 so existing fallback
        // machinery (currentIndex starts at 0, tryNext goes to 1) advances
        // away from the current source on the first hiccup.
        const currentHref = typeof window !== 'undefined' ? window.location.href : null;
        if (!currentHref) return;
        const currentHash = typeof window !== 'undefined' ? window.location.hash : '';
        const relevant = unique.filter((s) => matchesPlaybackSession(s?.deepLinks?.player, currentHash, routeSignature));

        if (relevant.length === 0) {
            if (!anyLoading) hasInjectedRef.current = true;
            return;
        }

        const others = relevant.filter((s) => {
            const url = s?.deepLinks?.player;
            if (typeof url !== 'string') return false;
            // Compare by hash fragment so origin/host differences don't matter.
            const otherHash = hrefToHash(url);
            return otherHash !== currentHash;
        });

        if (others.length === 0) {
            // No alternatives — only the current source is available. Leave
            // fallback disabled and stop polling.
            if (!anyLoading) hasInjectedRef.current = true;
            return;
        }

        const candidates = [
            { deepLinks: { player: currentHref } },
            ...others,
        ];

        fallback.injectCandidates(candidates);
        hasInjectedRef.current = true;

        // Once injected we no longer need the background MetaDetails model
        // occupying core state — release it.
        try {
            core.transport.dispatch({ action: 'Unload' }, BACKGROUND_MODEL);
        } catch {
            // Ignore — core may already be torn down.
        }
    }, [core, fallback?.enabled, fallback?.injectCandidates, metaDetails, routeSignature]);
};

module.exports = useBackgroundStreams;
