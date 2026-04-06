const CONSTANTS = require('./CONSTANTS');

const SOURCE_ORDER = ['imdb', 'rottenTomatoes', 'metacritic'];

const SOURCE_META = {
    imdb: {
        id: 'imdb',
        label: 'IMDb',
        shortLabel: 'IMDb',
        weight: 0.45,
    },
    rottenTomatoes: {
        id: 'rottenTomatoes',
        label: 'Rotten Tomatoes',
        shortLabel: 'RT',
        weight: 0.35,
    },
    metacritic: {
        id: 'metacritic',
        label: 'Metacritic',
        shortLabel: 'MC',
        weight: 0.2,
    },
};

const VERDICTS = [
    { id: 'absolute-cinema', name: 'Absolute Cinema', min: 90, max: 100 },
    { id: 'must-watch', name: 'Must Watch', min: 75, max: 89 },
    { id: 'worth-your-time', name: 'Worth Your Time', min: 60, max: 74 },
    { id: 'for-fans-first', name: 'For Fans First', min: 40, max: 59 },
    { id: 'skip-this-one', name: 'Skip This One', min: 0, max: 39 },
];

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function normalizeNumeric(value) {
    if (value === null || value === undefined) {
        return null;
    }

    const parsed = typeof value === 'number' ? value : parseFloat(String(value).replace('%', ''));
    return Number.isFinite(parsed) ? parsed : null;
}

function formatOneDecimal(value) {
    const rounded = Math.round(value * 10) / 10;
    return rounded.toFixed(1);
}

function createSourceCard(sourceId, rawValue, options = {}) {
    const source = SOURCE_META[sourceId];
    if (!source) {
        return null;
    }

    const numeric = normalizeNumeric(rawValue);
    if (numeric === null) {
        return null;
    }

    let value = numeric;
    let display = String(rawValue);

    if (sourceId === 'imdb') {
        value = clamp(Math.round(numeric * 10), 0, 100);
        display = formatOneDecimal(numeric);
    } else if (sourceId === 'rottenTomatoes') {
        value = clamp(Math.round(numeric), 0, 100);
        display = `${Math.round(numeric)}%`;
    } else {
        value = clamp(Math.round(numeric), 0, 100);
        display = `${Math.round(numeric)}`;
    }

    return {
        ...source,
        value,
        display,
        href: options.href || null,
    };
}

function getSpreadPenalty(spread) {
    if (spread <= 15) {
        return 0;
    }
    if (spread <= 30) {
        return 3;
    }
    if (spread <= 45) {
        return 6;
    }
    return 8;
}

function getVerdictForScore(score) {
    return VERDICTS.find((verdict) => score >= verdict.min && score <= verdict.max) || VERDICTS[VERDICTS.length - 1];
}

function findSupportedLinks(links = []) {
    const supported = {
        imdb: null,
        rottenTomatoes: null,
        metacritic: null,
    };

    links.forEach((link) => {
        if (!link || typeof link.category !== 'string') {
            return;
        }

        const normalizedCategory = link.category.toLowerCase();

        if (!supported.imdb && link.category === CONSTANTS.IMDB_LINK_CATEGORY) {
            supported.imdb = createSourceCard('imdb', link.name, { href: link.url || null });
            return;
        }

        if (!supported.rottenTomatoes && normalizedCategory.includes('tomatoes')) {
            supported.rottenTomatoes = createSourceCard('rottenTomatoes', link.name, { href: link.url || null });
            return;
        }

        if (!supported.metacritic && normalizedCategory.includes('metacritic')) {
            supported.metacritic = createSourceCard('metacritic', link.name, { href: link.url || null });
        }
    });

    return supported;
}

function buildExternalRatingsModel({ links = [], imdbRating = null } = {}) {
    const extracted = findSupportedLinks(Array.isArray(links) ? links : []);

    if (!extracted.imdb) {
        const fallbackImdb = normalizeNumeric(imdbRating);
        if (fallbackImdb !== null) {
            extracted.imdb = createSourceCard('imdb', fallbackImdb);
        }
    }

    const cards = SOURCE_ORDER.map((sourceId) => extracted[sourceId]).filter(Boolean);

    let consensus = null;

    if (cards.length >= 2) {
        const totalWeight = cards.reduce((sum, card) => sum + SOURCE_META[card.id].weight, 0);
        const weightedMean = cards.reduce((sum, card) => {
            return sum + (card.value * SOURCE_META[card.id].weight) / totalWeight;
        }, 0);
        const values = cards.map((card) => card.value);
        const spread = Math.max(...values) - Math.min(...values);
        const penalty = getSpreadPenalty(spread);
        const score = Math.round(clamp(weightedMean - penalty, 0, 100));

        consensus = {
            score,
            spread,
            penalty,
            sourceCount: cards.length,
            verdict: getVerdictForScore(score),
        };
    }

    const model = {
        ...extracted,
        cards,
        consensus,
    };

    model.compactBadge = getCompactRatingBadge(model);

    return model;
}

function getCompactRatingBadge(model) {
    if (!model) {
        return null;
    }

    if (model.consensus) {
        return {
            id: 'consensus',
            label: `${model.consensus.score}%`,
            secondaryLabel: model.consensus.verdict.name,
        };
    }

    const firstAvailable = SOURCE_ORDER.map((sourceId) => model[sourceId]).find(Boolean);
    if (!firstAvailable) {
        return null;
    }

    return {
        id: firstAvailable.id,
        label: firstAvailable.display,
        secondaryLabel: firstAvailable.shortLabel,
    };
}

module.exports = {
    SOURCE_ORDER,
    SOURCE_META,
    VERDICTS,
    buildExternalRatingsModel,
    getCompactRatingBadge,
    getSpreadPenalty,
    getVerdictForScore,
};
