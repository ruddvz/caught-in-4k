'use strict';

const manifest = Object.freeze({
    id: 'live.c4k.quality',
    version: '0.2.0',
    name: 'C4K Quality',
    description: 'Quality-first stream resolver for authorised C4K movie libraries.',
    resources: [
        {
            name: 'stream',
            types: ['movie'],
            idPrefixes: ['tt'],
        },
    ],
    types: ['movie'],
    catalogs: [],
    idPrefixes: ['tt'],
    behaviorHints: {
        adult: false,
        p2p: false,
        configurable: false,
    },
});

module.exports = { manifest };
