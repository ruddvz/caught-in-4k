'use strict';

const { rankCandidates, toStremioStream } = require('./quality');
const { loadAuthorisedCandidates } = require('./sourceProvider');

const SUPPORTED_PROFILES = new Set(['absolute', 'imax', '3d']);
const DEFAULT_MAX_STREAMS = 5;

const isMovieRequest = ({ type, id }) => type === 'movie' && /^tt\d+$/.test(String(id || ''));

const resolveProfile = (value) => {
    const profile = String(value || '').trim().toLowerCase();
    return SUPPORTED_PROFILES.has(profile) ? profile : 'absolute';
};

const resolveMaxStreams = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_STREAMS;
    return Math.min(10, Math.floor(parsed));
};

const createStreamResolver = ({
    loadCandidates = loadAuthorisedCandidates,
    env = process.env,
} = {}) => async ({ type, id }) => {
    if (!isMovieRequest({ type, id })) {
        return { streams: [] };
    }

    const profile = resolveProfile(env.C4K_QUALITY_PROFILE);
    const maxStreams = resolveMaxStreams(env.C4K_MAX_STREAMS);
    const candidates = await loadCandidates({ type, id, env });

    const streams = rankCandidates(candidates, { profile })
        .slice(0, maxStreams)
        .map((candidate) => toStremioStream(candidate, { profile }));

    return { streams };
};

module.exports = {
    createStreamResolver,
    isMovieRequest,
    resolveMaxStreams,
    resolveProfile,
};
