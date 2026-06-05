# iOS PWA Behavior

## Install

- Add to Home Screen uses `manifest.json` icons (192/512, any + maskable) and `apple-mobile-web-app-*` meta tags in `src/index.html`.
- `viewport-fit=cover` enables safe-area env variables.

## Safe areas

Global tokens in `src/styles/tokens.css`:

- `--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left`
- App shell variables in `src/App/styles.less`
- Player control bar uses bottom safe padding.

## Offline

- `body.c4k-offline` shows `OfflineBanner` when the network is unavailable.
- Workbox caches static assets; API/auth/billing routes must not be cached incorrectly (see `webpack.config.js` runtime caching).

## Updates

- When a new service worker is waiting, `c4k-sw-update-ready` fires and `PwaUpdateBanner` prompts refresh.
- Set `DISABLE_SERVICE_WORKER=1` at build time to skip registration (local debugging).

## Keyboard

- Search and forms use scroll padding in Settings/Subscribe routes; avoid fixed bottom nav covering focused fields on small screens.
