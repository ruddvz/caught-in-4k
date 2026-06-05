# Stremio Upstream Sync Notes

Reference upstream: https://github.com/Stremio/stremio-web  
Compared branch/tag: development / v5.0.0-beta.37  
Compared on: 2026-06-05

## Ported

| Upstream item | C4K PR | Files changed | Notes |
|---|---|---|---|
| Dependency parity matrix | #27+ | `package.json`, `pnpm-lock.yaml` | core-web 0.58, icons 5.10, video 0.0.79, webpack 5.106 |
| CoreProvider lifecycle | #27–#28 | `src/core/*`, `src/App/App.js` | Wraps existing `services/Core` |
| Calendar route export | #27 | `src/routes/index.js`, `routerViewsConfig.js` | Watch Calendar |
| Discover empty extra crash | #28 | `mapSelectableInputs.js` | Upstream no-selection fix |
| PWA manifest icons/labels | #28 | `manifest.json` | maskable + any entries |
| Offline/update UX | #28 | `OfflineBanner`, `PwaUpdateBanner`, `index.js` | SW update event |
| Safari video fullscreen | #28 | `useFullscreen.ts` | webkitEnterFullscreen |
| Player safe-area padding | #28 | `Player/styles.less` | control bar bottom inset |
| GamepadProvider + GamepadNavigation | complete-parity | `src/services/Gamepad/*` | Analog spatial nav + settings toggle |
| useSubtitles hook | complete-parity | `src/routes/Player/useSubtitles.js` | Track persistence |
| HDR badge | complete-parity | `ControlBar.js` | Stream JSON heuristic |
| api-proxy Zod + access verify | complete-parity | `api-proxy/schemas.js` | canon-take, checkout, access |
| i18n scan | #27 | `tests/i18nScan.test.js` | baseline debt tracked |

## Rejected / Not Applicable

| Upstream item | Reason |
|---|---|
| Full Stremio UI clone | C4K Cinematic Gold Glass identity |
| Stremio `createTransport` core rewrite | C4K keeps `services/Core` wasm transport with CoreProvider wrapper |
| Piracy-oriented search/magnet funnel | Legal product guardrail |

## Deferred

| Item | Blocker | Next action |
|---|---|---|
| Full upstream player control-bar layout | C4K design system | Optional future pass |
| Visual regression screenshots | Golden file approval | Run `pnpm visual-regression` |
| Supabase RLS + Stripe webhook live tests | Owner credentials | See `implementation-blockers.md` |

## Dependency parity

| Package | Before | After | Upstream | Notes |
|---|---:|---:|---:|---|
| @stremio/stremio-core-web | 0.57.0 | 0.58.0 | 0.58.0 | Phase 01 |
| @stremio/stremio-icons | 5.8.0 | 5.10.0 | 5.10.0 | Phase 01 |
| @stremio/stremio-video | 0.0.70 | 0.0.79 | 0.0.79 | Phase 01 |
| webpack | 5.97.0 | 5.106.2 | 5.106.2 | Phase 01 |
| workbox-webpack-plugin | 7.3.0 | 7.4.1 | 7.4.1 | Phase 01 |
