// Copyright (C) 2024 Caught In 4K

const React = require('react');
const { getCurrentAppLocation, normalizeAppHref } = require('../../common/navigation');

const BUFFERING_TIMEOUT_MS = 8000;
const NO_AUDIO_TIMEOUT_MS = 3000;
const SESSION_KEY_CANDIDATES = 'c4k:fallback-candidates';
const SESSION_KEY_INDEX = 'c4k:fallback-index';

const clearPersistedFallback = () => {
    try {
        sessionStorage.removeItem(SESSION_KEY_CANDIDATES);
        sessionStorage.removeItem(SESSION_KEY_INDEX);
    } catch {
        // sessionStorage unavailable
    }
};

// Read persisted candidates, but only if they belong to THIS playback session.
// QualityPicker writes the candidates immediately before navigating to
// `candidates[0].deepLinks.player`. On any subsequent navigation that bypasses
// QualityPicker (Continue Watching, Library, Hero, trailer click), the
// persisted list is stale and must not be used as a fallback for an unrelated
// stream — otherwise a buffering hiccup would silently jump the user to a
// different movie. We validate by checking that the candidate at the persisted
// index has a `deepLinks.player` URL whose hash matches the current URL hash.
const readValidatedCandidates = () => {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY_CANDIDATES);
        if (!raw) return { candidates: [], index: 0 };
        const candidates = JSON.parse(raw);
        if (!Array.isArray(candidates) || candidates.length === 0) {
            clearPersistedFallback();
            return { candidates: [], index: 0 };
        }

        const indexRaw = sessionStorage.getItem(SESSION_KEY_INDEX);
        const index = indexRaw ? parseInt(indexRaw, 10) : 0;
        const safeIndex = Number.isFinite(index) && index >= 0 && index < candidates.length ? index : 0;

        const expectedUrl = candidates[safeIndex]?.deepLinks?.player;
        if (typeof expectedUrl !== 'string' || expectedUrl.length === 0) {
            clearPersistedFallback();
            return { candidates: [], index: 0 };
        }

        const expectedHref = normalizeAppHref(expectedUrl, window.location.origin);
        const currentHref = getCurrentAppLocation().href;
        if (expectedHref !== currentHref) {
            clearPersistedFallback();
            return { candidates: [], index: 0 };
        }

        return { candidates, index: safeIndex };
    } catch {
        clearPersistedFallback();
        return { candidates: [], index: 0 };
    }
};

const writeIndex = (index) => {
    try {
        sessionStorage.setItem(SESSION_KEY_INDEX, String(index));
    } catch {
        // sessionStorage unavailable
    }
};

const navigateToStream = (candidates, nextIndex) => {
    if (nextIndex >= candidates.length) return false;

    const next = candidates[nextIndex];
    const playerUrl = next?.deepLinks?.player;
    if (!playerUrl) return false;

    writeIndex(nextIndex);
    window.location.replace(playerUrl);
    return true;
};

const readInitialFallbackState = () => {
    const validated = readValidatedCandidates();
    return { candidates: validated.candidates, currentIndex: validated.index };
};

const useStreamFallback = (videoState, videoEvents, playbackSessionKey) => {
    const [{ candidates, currentIndex }, setFallbackState] = React.useState(readInitialFallbackState);
    const [exhausted, setExhausted] = React.useState(false);
    const enabled = candidates.length > 1;

    // Inject candidates discovered in the background (e.g. by useBackgroundStreams).
    // Only honored when no persisted candidates exist for this session — we never
    // overwrite a list that QualityPicker put there. Persists the result so a
    // subsequent navigation (window.location.replace from tryNext) can resume.
    const injectCandidates = React.useCallback((list) => {
        if (!Array.isArray(list) || list.length < 2) return;
        if (candidates.length > 0) return;
        try {
            sessionStorage.setItem(SESSION_KEY_CANDIDATES, JSON.stringify(list));
            sessionStorage.removeItem(SESSION_KEY_INDEX);
        } catch {
            // sessionStorage unavailable
        }
        setFallbackState({ candidates: list, currentIndex: 0 });
    }, [candidates.length]);
    const bufferingTimerRef = React.useRef(null);
    const audioTimerRef = React.useRef(null);
    const hasNavigatedRef = React.useRef(false);
    const pendingCriticalErrorRef = React.useRef(false);
    // Latest videoState ref so timer callbacks always read fresh values instead
    // of stale closure captures from when the timer was scheduled.
    const stateRef = React.useRef(videoState);
    React.useEffect(() => { stateRef.current = videoState; }, [videoState]);

    React.useEffect(() => {
        clearTimeout(bufferingTimerRef.current);
        clearTimeout(audioTimerRef.current);
        hasNavigatedRef.current = false;
        pendingCriticalErrorRef.current = false;
        setExhausted(false);
        setFallbackState(readInitialFallbackState());
    }, [playbackSessionKey]);

    const tryNext = React.useCallback(() => {
        if (hasNavigatedRef.current) return;

        const nextIndex = currentIndex + 1;
        if (!navigateToStream(candidates, nextIndex)) {
            setExhausted(true);
        } else {
            hasNavigatedRef.current = true;
        }
    }, [candidates, currentIndex]);

    // Buffering timeout: if stuck buffering with no playback for 8s, try next
    React.useEffect(() => {
        if (!enabled || hasNavigatedRef.current) return;

        const isStuckBuffering = videoState.buffering === true && videoState.time === null;

        if (isStuckBuffering) {
            bufferingTimerRef.current = setTimeout(() => {
                // Re-check live state before firing — buffering may have resolved
                const live = stateRef.current;
                if (live.buffering === true && live.time === null) {
                    tryNext();
                }
            }, BUFFERING_TIMEOUT_MS);
        } else {
            clearTimeout(bufferingTimerRef.current);
        }

        return () => clearTimeout(bufferingTimerRef.current);
    }, [enabled, videoState.buffering, videoState.time, tryNext]);

    // No-audio detection: if playing but no audio tracks after 3s, try next
    React.useEffect(() => {
        if (!enabled || hasNavigatedRef.current) return;

        const isPlaying = videoState.time !== null && videoState.time > 0;
        const hasNoAudio = !Array.isArray(videoState.audioTracks) || videoState.audioTracks.length === 0;

        if (isPlaying && hasNoAudio) {
            audioTimerRef.current = setTimeout(() => {
                // Re-check live state before navigating — tracks may have loaded late
                const live = stateRef.current;
                const stillNoAudio = !Array.isArray(live.audioTracks) || live.audioTracks.length === 0;
                if (stillNoAudio) {
                    tryNext();
                }
            }, NO_AUDIO_TIMEOUT_MS);
        } else {
            clearTimeout(audioTimerRef.current);
        }

        return () => clearTimeout(audioTimerRef.current);
    }, [enabled, videoState.time, videoState.audioTracks, tryNext]);

    React.useEffect(() => {
        if (!enabled || !pendingCriticalErrorRef.current || hasNavigatedRef.current) return;

        pendingCriticalErrorRef.current = false;
        tryNext();
    }, [enabled, tryNext]);

    // Critical error: try next immediately, or remember it until candidates arrive.
    React.useEffect(() => {
        if (!videoEvents) return;

        const onError = (error) => {
            if (!error?.critical || hasNavigatedRef.current) {
                return;
            }

            if (enabled) {
                tryNext();
                return;
            }

            pendingCriticalErrorRef.current = true;
        };

        videoEvents.on('error', onError);
        return () => videoEvents.off('error', onError);
    }, [enabled, videoEvents, tryNext]);

    // Cleanup timers on unmount
    React.useEffect(() => {
        return () => {
            clearTimeout(bufferingTimerRef.current);
            clearTimeout(audioTimerRef.current);
        };
    }, []);

    return {
        attemptNumber: currentIndex + 1,
        totalCandidates: candidates.length,
        exhausted,
        enabled,
        injectCandidates,
    };
};

module.exports = useStreamFallback;
