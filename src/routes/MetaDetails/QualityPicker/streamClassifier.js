// Copyright (C) 2024 Caught In 4K

const TIER_SIZE_LIMITS = {
    '4k': 20,
    '2k': 15,
    '1080p': 8,
    '720p': 1,
};

const TIERS = ['4k', '2k', '1080p', '720p'];

const RESOLUTION_PATTERNS = [
    { tier: '4k', pattern: /\b(2160p|4k|uhd)\b/i },
    { tier: '2k', pattern: /\b(1440p|2k|qhd)\b/i },
    { tier: '1080p', pattern: /\b(1080p|fhd)\b/i },
    { tier: '720p', pattern: /\b720p\b/i },
];

const SIZE_PATTERN = /(\d+(?:\.\d+)?)\s*(GB|MB|TB)/i;

const parseResolution = (description) => {
    if (typeof description !== 'string') return null;

    for (const { tier, pattern } of RESOLUTION_PATTERNS) {
        if (pattern.test(description)) {
            return tier;
        }
    }

    return null;
};

const parseFileSize = (description) => {
    if (typeof description !== 'string') return null;

    const match = description.match(SIZE_PATTERN);
    if (!match) return null;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    switch (unit) {
        case 'TB': return value * 1024;
        case 'GB': return value;
        case 'MB': return value / 1024;
        default: return null;
    }
};

const classifyStream = (stream) => {
    const description = stream?.description || stream?.name || '';
    const tier = parseResolution(description);
    const sizeGB = parseFileSize(description);

    return { tier, sizeGB };
};

const isWithinSizeLimit = (tier, sizeGB) => {
    if (tier === null) return false;
    if (sizeGB === null) return true;

    const limit = TIER_SIZE_LIMITS[tier];
    return typeof limit === 'number' ? sizeGB <= limit : false;
};

module.exports = {
    TIER_SIZE_LIMITS,
    TIERS,
    parseResolution,
    parseFileSize,
    classifyStream,
    isWithinSizeLimit,
};
