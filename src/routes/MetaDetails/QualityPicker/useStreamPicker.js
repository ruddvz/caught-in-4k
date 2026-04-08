// Copyright (C) 2024 Caught In 4K

const React = require('react');
const { classifyStream, isWithinSizeLimit, TIERS } = require('./streamClassifier');

const createInitialTiers = () => {
    const tiers = {};
    for (const tier of TIERS) {
        tiers[tier] = { status: 'loading', candidates: [], bestStream: null };
    }
    return tiers;
};

const flattenStreams = (rawStreams) => {
    return rawStreams
        .filter((group) => group.content.type === 'Ready')
        .reduce((acc, group) => {
            const streams = group.content.content.map((stream) => ({
                ...stream,
                addonName: group.addon.manifest.name,
                transportUrl: group.addon.transportUrl,
            }));
            return acc.concat(streams);
        }, []);
};

const groupByTier = (streams) => {
    const groups = {};
    for (const tier of TIERS) {
        groups[tier] = [];
    }

    for (const stream of streams) {
        const { tier, sizeGB } = classifyStream(stream);
        if (tier !== null && isWithinSizeLimit(tier, sizeGB)) {
            groups[tier].push({ ...stream, _sizeGB: sizeGB });
        }
    }

    return groups;
};

const rankCandidates = (candidates) => {
    return [...candidates].sort((a, b) => {
        const sizeA = a._sizeGB ?? Infinity;
        const sizeB = b._sizeGB ?? Infinity;
        return sizeA - sizeB;
    });
};

const useStreamPicker = (rawStreams) => {
    const [tiers, setTiers] = React.useState(createInitialTiers);
    const hasStreamsLoading = React.useMemo(() => {
        return rawStreams.some((group) => group.content.type === 'Loading');
    }, [rawStreams]);

    const allStreams = React.useMemo(() => flattenStreams(rawStreams), [rawStreams]);
    const grouped = React.useMemo(() => groupByTier(allStreams), [allStreams]);

    React.useEffect(() => {
        const newTiers = {};
        for (const tier of TIERS) {
            const candidates = grouped[tier];
            const ranked = rankCandidates(candidates);

            let status;
            if (candidates.length === 0) {
                status = 'unavailable';
            } else if (hasStreamsLoading) {
                status = 'loading';
            } else {
                status = ranked.length > 0 ? 'available' : 'unavailable';
            }

            newTiers[tier] = {
                status,
                candidates: ranked,
                bestStream: ranked.length > 0 ? ranked[0] : null,
            };
        }
        setTiers(newTiers);
    }, [grouped, hasStreamsLoading]);

    const selectQuality = React.useCallback((tier) => {
        const tierData = tiers[tier];
        if (!tierData || !tierData.bestStream) return null;

        return {
            stream: tierData.bestStream,
            candidates: tierData.candidates.filter((candidate) => typeof candidate?.deepLinks?.player === 'string' && candidate.deepLinks.player.length > 0),
        };
    }, [tiers]);

    return {
        tiers,
        allStreams,
        selectQuality,
        hasStreamsLoading,
    };
};

module.exports = useStreamPicker;
