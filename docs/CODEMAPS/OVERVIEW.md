# Codebase Overview

> **Purpose**: This directory replaces the phantom `code-review-graph` tool. Any AI session
> should read these files instead of scanning the full codebase. Start here, then drill
> into the module-specific maps linked below.

## Project Identity

- **Name**: Caught in 4K (C4K) — Gen Z-themed AI-powered Stremio Web fork
- **Stack**: React 18 + TypeScript + LESS (CSS Modules) + Webpack 5
- **WASM Core**: `@stremio/stremio-core-web` (Rust-compiled) handles all catalog/library/player state
- **AI Feature**: Gemini 2.0 Flash "Canon Takes" via `api-proxy.js` (Express, port 3001)
- **Deploy**: GitHub Pages (`gh-pages` branch) via GitHub Actions

## Codebase Stats

- ~21,300 lines across ~350 source files in `src/`
- Mixed JS/TS — older files use CommonJS `require`, newer use ES `import`
- Module aliases: `stremio/common`, `stremio/components`, `stremio/services`, `stremio-router`

## Architecture at a Glance

```
URL hash change
  → Router (src/router/) matches regex from routesRegexp
    → Route component mounts (src/routes/)
      → useXxx hook calls useModelState
        → dispatches Load action to WASM core
          → core processes and returns state
            → React re-renders
```

**Key Patterns**:
1. `withCoreSuspender` HOC wraps every route (waits for WASM init)
2. `useModelState` is the universal React ↔ WASM bridge
3. Services layer (Core, Shell, Chromecast) via `useServices()` context
4. Hash-based routing (`#/discover`, `#/library`, `#/settings`, etc.)

## Module Index

| Map File | Covers | Key Files |
|----------|--------|-----------|
| [app-shell.md](./app-shell.md) | `src/App/`, `src/router/` | App.js, Router.js, routerViewsConfig.js |
| [common.md](./common.md) | `src/common/` | hooks, utilities, contexts, constants |
| [components.md](./components.md) | `src/components/` | MetaItem, MetaPreview, NavBar, ModalDialog, MultiselectMenu, etc. |
| [routes.md](./routes.md) | `src/routes/` | Board, Discover, Library, MetaDetails, Player, Settings, Addons, Calendar, Intro |
| [services.md](./services.md) | `src/services/` | Core, Shell, Chromecast, BackgroundAgents, CanonTakesQueue |
| [types.md](./types.md) | `src/types/` | All TypeScript type definitions and model types |
| [config-and-backend.md](./config-and-backend.md) | Root configs, backend, CI/CD | webpack, tsconfig, eslint, api-proxy, Dockerfile, GitHub Actions |

## Dependency Graph (High-Level)

```
src/App/App.js
├── src/router/ (Router, Modal, Route)
├── src/services/ (ServicesProvider → Core, Shell, Chromecast)
├── src/common/ (ToastProvider, TooltipProvider, FileDrop, Shortcuts, Platform)
└── src/routes/
    ├── Board → useBoard → useModelState → Core (WASM)
    ├── Discover → useDiscover → useModelState → Core
    ├── Library → useLibrary → useModelState → Core
    ├── MetaDetails → useMetaDetails → useModelState → Core
    ├── Player → usePlayer + useVideo → useModelState → Core + stremio-video
    ├── Settings → General, Interface, Player sub-components
    ├── Search → useSearch → useModelState → Core
    ├── Addons → useInstalledAddons + useRemoteAddons → useModelState → Core
    ├── Calendar → useCalendar → useModelState → Core
    └── Intro → useServices → Core (login/signup)
```

## C4K-Specific Additions (Fork Divergence)

These files/features do NOT exist in upstream Stremio Web:
- `src/routes/Profiles/` — Netflix-like "Who's watching?" profile selector
- `src/components/CanonTakeBox/` — AI-generated "Canon Take" commentary
- `src/components/TopNavigationBar/` — Custom top nav with pill-shaped tabs
- `src/services/BackgroundAgents/` — Async Canon Takes fetcher
- `src/services/CanonTakesQueue/` — Queue system for batch Canon Takes
- `src/common/useCanonTakes.ts` — Canon Takes state hook
- `src/common/pollinationsApi.js` — Pollinations AI image generation
- `src/common/caught-in-4k-translations.js` — C4K i18n strings
- `api-proxy.js` — Gemini API reverse proxy
- Custom avatars (20 images in `assets/images/avatars/`)
