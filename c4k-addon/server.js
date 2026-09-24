'use strict';

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { manifest } = require('./manifest');
const { createJellyfinRelayHandler } = require('./mediaRelay');
const { createPlexRelayHandler } = require('./plexRelay');
const { createStreamResolver } = require('./service');

const DEFAULT_PORT = 7000;

const createApp = ({ env = process.env, loadCandidates, fetchImpl = fetch } = {}) => {
    const app = express();
    const resolveStreams = createStreamResolver({ env, loadCandidates });
    const relayJellyfinMedia = createJellyfinRelayHandler({ env, fetchImpl });
    const relayPlexMedia = createPlexRelayHandler({ env, fetchImpl });

    app.disable('x-powered-by');
    app.use(helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }));
    app.use(cors({
        origin: '*',
        methods: ['GET', 'HEAD', 'OPTIONS'],
    }));

    const addonLimiter = rateLimit({
        windowMs: 60 * 1000,
        max: 120,
        standardHeaders: true,
        legacyHeaders: false,
        message: { error: 'Too many C4K add-on requests.' },
    });
    app.use((req, res, next) => {
        if (req.path.startsWith('/media/')) return next();
        return addonLimiter(req, res, next);
    });

    app.head('/media/jellyfin/:itemId/:mediaSourceId', relayJellyfinMedia);
    app.get('/media/jellyfin/:itemId/:mediaSourceId', relayJellyfinMedia);
    app.head('/media/plex/:partId', relayPlexMedia);
    app.get('/media/plex/:partId', relayPlexMedia);

    const registerAddonRoutes = (basePath = '') => {
        app.get(`${basePath}/manifest.json`, (_req, res) => {
            res.set('Cache-Control', 'public, max-age=3600');
            res.json(manifest);
        });

        app.get(`${basePath}/stream/:type/:id.json`, async (req, res) => {
            try {
                const result = await resolveStreams({
                    type: req.params.type,
                    id: req.params.id,
                });
                res.set('Cache-Control', 'private, no-store');
                res.json(result);
            } catch (error) {
                console.error('[C4K Addon] stream lookup failed:', error.message);
                res.set('Cache-Control', 'private, no-store');
                res.status(200).json({ streams: [] });
            }
        });
    };

    registerAddonRoutes('');
    registerAddonRoutes('/addon');

    app.get('/health', (_req, res) => {
        res.json({
            ok: true,
            service: 'c4k-stremio-addon',
            sourceProvider: String(env.C4K_SOURCE_PROVIDER || 'index').toLowerCase(),
            version: manifest.version,
        });
    });

    app.get('/', (_req, res) => {
        res.json({
            name: manifest.name,
            manifest: '/manifest.json',
            alternateManifest: '/addon/manifest.json',
            status: 'ok',
        });
    });

    return app;
};

if (require.main === module) {
    const port = Number(process.env.C4K_ADDON_PORT) || DEFAULT_PORT;
    createApp().listen(port, () => {
        console.warn(`C4K Stremio add-on listening on http://localhost:${port}`);
    });
}

module.exports = {
    DEFAULT_PORT,
    createApp,
};
