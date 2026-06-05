# Stremio Upstream Sync Notes

Reference upstream: https://github.com/Stremio/stremio-web  
Compared branch/tag: development / v5.0.0-beta.37  
Compared on: 2026-06-05

## Ported

| Upstream item | C4K PR | Files changed | Notes |
|---|---|---|---|
| Dependency parity matrix | #27+ | `package.json`, `pnpm-lock.yaml` | core-web 0.58, icons 5.10, video 0.0.79, webpack 5.106 |
| CoreProvider lifecycle | TBD | `src/core/*`, `src/App/App.js` | Wraps existing `services/Core` |
| Calendar route export | #27 | `src/routes/index.js`, `routerViewsConfig.js` | Watch Calendar |
| Discover empty extra crash | TBD | `mapSelectableInputs.js` | Upstream no-selection fix |
| PWA manifest icons/labels | TBD | `manifest.json` | maskable + any entries |
| Offline/update UX | TBD | `OfflineBanner`, `PwaUpdateBanner`, `index.js` | SW update event |
| Safari video fullscreen | TBD | `useFullscreen.ts` | webkitEnterFullscreen |
| Player safe-area padding | TBD | `Player/styles.less` | control bar bottom inset |
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
| GamepadContext / GamepadNavigation | Time/complexity in single agent slice | Port from upstream `src/services/Gamepad*` |
| Subtitle dedicated hook refactor | Large Player diff | Compare `routes/Player` with upstream |
| HDR badge / video scale | Stream metadata API | Audit player stream props |
| Visual regression screenshots | Golden file approval | Add CI capture to `test-results/visual/` |
| Supabase RLS + Stripe webhook live tests | Owner credentials | See `implementation-blockers.md` |

## Dependency parity

| Package | Before | After | Upstream | Notes |
|---|---:|---:|---:|---|
| @stremio/stremio-core-web | 0.57.0 | 0.58.0 | 0.58.0 | Phase 01 |
| @stremio/stremio-icons | 5.8.0 | 5.10.0 | 5.10.0 | Phase 01 |
| @stremio/stremio-video | 0.0.70 | 0.0.79 | 0.0.79 | Phase 01 |
| webpack | 5.97.0 | 5.106.2 | 5.106.2 | Phase 01 |
| workbox-webpack-plugin | 7.3.0 | 7.4.1 | 7.4.1 | Phase 01 |
