# Caught in 4K

[![Build](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml/badge.svg)](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml)
[![GitHub Pages](https://img.shields.io/website?label=Live%20Demo&logo=github&up_message=online&down_message=offline&url=https%3A%2F%2Fruddvz.github.io%2Fcaught-in-4k%2F)](https://ruddvz.github.io/caught-in-4k/main)

**Caught in 4K (C4K)** is a cinematic, iPhone-first PWA for watch discovery — movies, shows, watchlists, Canon Takes, and profiles. Architecture is inspired by [Stremio Web](https://github.com/Stremio/stremio-web) with C4K-specific auth, subscriptions, and design.

## Features

- **Cinematic Gold Glass** design system (`src/styles/tokens.css`)
- **iOS PWA** — safe areas, offline banner, update prompt, installable manifest
- **Canon Takes** and satisfaction meter (C4K-only)
- **Profiles, Supabase auth, Stripe subscriptions** (when configured)
- **Gamepad navigation** (optional, Settings → Interface)
- **Lawful add-on positioning** — user-configured sources only

## Setup

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- [pnpm](https://pnpm.io/) 10+

### Install

```bash
pnpm install
```

Copy `.env.example` to `.env.local` for local development. See [docs/environment.md](docs/environment.md).

### Development

```bash
pnpm start
```

### Quality checks

```bash
pnpm lint
pnpm test
pnpm run scan-translations
pnpm run build
pnpm run verify-service-worker
pnpm e2e
```

Optional: `pnpm run visual-regression` (serves `build/` and captures screenshots to `test-results/visual/`).

### API proxy (Canon Takes / Stripe)

```bash
node api-proxy.js
```

See [docs/security.md](docs/security.md).

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/environment.md](docs/environment.md) | Environment variables |
| [docs/pwa-ios.md](docs/pwa-ios.md) | iOS PWA behavior |
| [docs/security.md](docs/security.md) | API proxy, RLS, access keys |
| [docs/stremio-upstream-sync.md](docs/stremio-upstream-sync.md) | Upstream parity notes |
| [docs/agent-progress.md](docs/agent-progress.md) | Implementation plan status |
| [DESIGN.md](DESIGN.md) | Cinematic Gold Glass design system |

## Theme

Canonical tokens live in `src/styles/tokens.css`. Legacy LESS variables in `src/App/caught-in-4k-theme.less` are gradually aligned to tokens.

## License

Caught in 4K is available under the [GPLv2 license](LICENSE.md). See [NOTICE.md](NOTICE.md) for Stremio upstream attribution.
