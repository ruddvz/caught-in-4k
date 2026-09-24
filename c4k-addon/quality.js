'use strict';

const SOURCE_SCORES = Object.freeze({
    'uhd-bluray-remux': 500,
    'uhd-bluray-encode': 420,
    'bluray-remux': 350,
    'web-dl': 300,
    'bluray-encode': 260,
    'web-rip': 210,
    'direct-stream': 160,
    unknown: 0,
});

const HDR_SCORES = Object.freeze({
    'dolby-vision': 70,
    'hdr10-plus': 58,
    hdr10: 48,
    hlg: 32,
    sdr: 0,
});

const AUDIO_SCORES = Object.freeze({
    'truehd-atmos': 80,
    'dts-x': 76,
    truehd: 68,
    'dts-hd-ma': 64,
    'eac3-atmos': 48,
    eac3: 36,
    dts: 32,
    ac3: 24,
    aac: 14,
});

const THREE_D_SCORES = Object.freeze({
    mvc: 260,
    'frame-packing': 240,
    'full-sbs': 160,
    'half-sbs': 100,
    'top-bottom': 90,
    'over-under': 90,
});

const SOURCE_LABELS = Object.freeze({
    'uhd-bluray-remux': 'UHD Blu-ray Remux',
    'uhd-bluray-encode': 'UHD Blu-ray encode',
    'bluray-remux': 'Blu-ray Remux',
    'web-dl': 'WEB-DL',
    'bluray-encode': 'Blu-ray encode',
    'web-rip': 'WEBRip',
    'direct-stream': 'Direct stream',
    unknown: 'Source',
});

const TOKEN_LABELS = Object.freeze({
    'dolby-vision': 'Dolby Vision',
    'hdr10-plus': 'HDR10+',
    hdr10: 'HDR10',
    hlg: 'HLG',
    sdr: 'SDR',
    hevc: 'HEVC',
    h265: 'HEVC',
    av1: 'AV1',
    avc: 'AVC',
    h264: 'AVC',
    'truehd-atmos': 'TrueHD Atmos',
    'dts-x': 'DTS:X',
    truehd: 'TrueHD',
    'dts-hd-ma': 'DTS-HD MA',
    'eac3-atmos': 'E-AC-3 Atmos',
    eac3: 'E-AC-3',
    dts: 'DTS',
    ac3: 'AC-3',
    aac: 'AAC',
    'imax-1.90': 'IMAX 1.90:1',
    'imax-1.43': 'IMAX 1.43:1',
    'imax-variable': 'IMAX variable ratio',
    'imax-enhanced': 'IMAX Enhanced',
    mvc: 'MVC 3D',
    'frame-packing': 'Frame-packed 3D',
    'full-sbs': 'Full SBS 3D',
    'half-sbs': 'Half SBS 3D',
    'top-bottom': 'Top/Bottom 3D',
    'over-under': 'Over/Under 3D',
});

const IMAX_PRESENTATIONS = new Set([
    'imax-1.90',
    'imax-1.43',
    'imax-variable',
    'imax-enhanced',
]);

const normaliseToken = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');

const normaliseTokenList = (value) => {
    const values = Array.isArray(value) ? value : [value];
    return values.map(normaliseToken).filter(Boolean);
};

const maxMappedScore = (tokens, scoreMap) => tokens.reduce(
    (highest, token) => Math.max(highest, scoreMap[token] || 0),
    0,
);

const getResolutionScore = (resolution) => {
    const height = Number(resolution) || 0;
    if (height >= 2160) return 220;
    if (height >= 1440) return 140;
    if (height >= 1080) return 90;
    if (height >= 720) return 35;
    return 0;
};

const getBitrateScore = (bitrateMbps) => {
    const bitrate = Number(bitrateMbps) || 0;
    return Math.min(100, Math.max(0, bitrate * 1.25));
};

const getPresentationScore = (presentationTokens, profile) => {
    const hasImax = presentationTokens.some((token) => IMAX_PRESENTATIONS.has(token));
    if (!hasImax) return 0;
    return profile === 'imax' ? 160 : 40;
};

const getThreeDScore = (threeD, profile) => {
    if (profile !== '3d') return 0;
    return THREE_D_SCORES[normaliseToken(threeD)] || 0;
};

const scoreCandidate = (candidate, options = {}) => {
    const profile = options.profile || 'absolute';
    const source = normaliseToken(candidate.source || 'unknown');
    const hdrTokens = normaliseTokenList(candidate.hdr);
    const audioTokens = normaliseTokenList(candidate.audio);
    const presentationTokens = normaliseTokenList(candidate.presentation);

    const breakdown = {
        source: SOURCE_SCORES[source] || 0,
        resolution: getResolutionScore(candidate.resolution),
        hdr: maxMappedScore(hdrTokens, HDR_SCORES),
        audio: maxMappedScore(audioTokens, AUDIO_SCORES),
        presentation: getPresentationScore(presentationTokens, profile),
        threeD: getThreeDScore(candidate.threeD, profile),
        bitDepth: Number(candidate.bitDepth) >= 10 ? 20 : 0,
        bitrate: getBitrateScore(candidate.bitrateMbps),
        verifiedMetadata: candidate.verified === true ? 20 : 0,
    };

    const score = Object.values(breakdown).reduce((total, value) => total + value, 0);
    return {
        score: Math.round(score * 100) / 100,
        breakdown,
    };
};

const rankCandidates = (candidates, options = {}) => (Array.isArray(candidates) ? candidates : [])
    .map((candidate, index) => ({
        ...candidate,
        _c4kIndex: index,
        _c4kScore: scoreCandidate(candidate, options).score,
    }))
    .sort((left, right) => {
        if (right._c4kScore !== left._c4kScore) {
            return right._c4kScore - left._c4kScore;
        }

        const bitrateDifference = (Number(right.bitrateMbps) || 0) - (Number(left.bitrateMbps) || 0);
        if (bitrateDifference !== 0) return bitrateDifference;

        const sizeDifference = (Number(right.sizeBytes) || 0) - (Number(left.sizeBytes) || 0);
        if (sizeDifference !== 0) return sizeDifference;

        return left._c4kIndex - right._c4kIndex;
    });

const resolutionLabel = (resolution) => {
    const height = Number(resolution) || 0;
    if (height >= 2160) return '2160p';
    if (height >= 1440) return '1440p';
    if (height >= 1080) return '1080p';
    if (height >= 720) return '720p';
    return height > 0 ? `${height}p` : 'Video';
};

const formatBytes = (bytes) => {
    const value = Number(bytes) || 0;
    if (value <= 0) return null;
    const gib = value / (1024 ** 3);
    return `${gib >= 10 ? gib.toFixed(0) : gib.toFixed(1)} GB`;
};

const labelToken = (value) => TOKEN_LABELS[normaliseToken(value)] || String(value || '').trim();

const describeCandidate = (candidate) => {
    const source = normaliseToken(candidate.source || 'unknown');
    const lineOne = [resolutionLabel(candidate.resolution), SOURCE_LABELS[source] || SOURCE_LABELS.unknown]
        .filter(Boolean)
        .join(' • ');

    const videoParts = [
        ...normaliseTokenList(candidate.hdr).map(labelToken),
        candidate.videoCodec ? labelToken(candidate.videoCodec) : null,
        Number(candidate.bitDepth) > 0 ? `${Number(candidate.bitDepth)}-bit` : null,
        Number(candidate.bitrateMbps) > 0 ? `${Number(candidate.bitrateMbps).toFixed(1).replace(/\.0$/, '')} Mbps` : null,
    ].filter(Boolean);

    const featureParts = [
        ...normaliseTokenList(candidate.presentation).map(labelToken),
        candidate.threeD ? labelToken(candidate.threeD) : null,
        ...normaliseTokenList(candidate.audio).map(labelToken),
        formatBytes(candidate.sizeBytes),
    ].filter(Boolean);

    return [lineOne, videoParts.join(' • '), featureParts.join(' • ')]
        .filter((line) => line.length > 0)
        .join('\n');
};

const toStremioStream = (candidate, options = {}) => {
    const profile = options.profile || 'absolute';
    const score = Number(candidate._c4kScore) || scoreCandidate(candidate, { profile }).score;
    const behaviorHints = {
        bingeGroup: `c4k-${profile}-${resolutionLabel(candidate.resolution).toLowerCase()}`,
    };

    if (candidate.filename) behaviorHints.filename = candidate.filename;
    if (Number(candidate.sizeBytes) > 0) behaviorHints.videoSize = Number(candidate.sizeBytes);
    if (candidate.webReady === false) behaviorHints.notWebReady = true;

    return {
        name: `C4K • ${resolutionLabel(candidate.resolution)}`,
        description: `${describeCandidate(candidate)}\nC4K score ${Math.round(score)}`,
        url: candidate.url,
        behaviorHints,
    };
};

module.exports = {
    SOURCE_SCORES,
    scoreCandidate,
    rankCandidates,
    describeCandidate,
    toStremioStream,
};
