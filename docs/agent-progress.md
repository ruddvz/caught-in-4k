# Agent Progress — Stremio Parity Plan

Reference plan: `CAUGHT_IN_4K_STREMIO_PARITY_FULL_AGENT_PLAN.md`

## Phase 00 — Baseline, safety, and repo hygiene

- [x] Create progress/blocker/testing docs
- [x] Remove `.env.local` from tracking
- [x] Clean `.gitignore`
- [x] Resolve package manager conflict
- [x] Fix license consistency
- [x] Add commit hash fallback in Webpack
- [x] Run baseline checks

## Phase 01 — Stremio upstream dependency parity

- [x] Upgrade Stremio runtime packages
- [x] Upgrade Webpack/toolchain packages
- [x] Upgrade i18n packages
- [x] Upgrade Workbox
- [x] Regenerate lockfile with pnpm
- [x] Run full checks

## Phase 02 — Core/provider architecture migration

- [x] Add CoreProvider pattern (`src/core/`)
- [x] Move core lifecycle out of monolithic App
- [x] FileDropProvider, ShortcutsProvider, Platform provider verified
- [x] Preserve C4K auth/access/subscription/background agents

## Phase 03 — Gamepad and focus/navigation

- [x] GamepadContext / GamepadProvider (`src/services/Gamepad/`)
- [x] GamepadNavigation — analog → `window.navigate`, A → click
- [x] Settings toggle (`Interface` + `useC4KSettings.gamepadNavigation`)
- [x] Modal overflow — existing safe-area tokens + spatial-navigation contain

## Phase 04 — Player parity and iOS safe areas

- [x] Player control bar safe-area padding
- [x] iOS PWA safe-area overlap (tokens + control bar)
- [x] Safari fullscreen (`webkitEnterFullscreen` in `useFullscreen`)
- [x] Media session (`useMediaSession.ts`)
- [x] Subtitle hook (`useSubtitles.js`)
- [x] HDR badge when stream metadata mentions HDR / Dolby Vision / HLG
- [~] Full upstream control-bar redesign — deferred (C4K styling sufficient)

## Phase 05 — Details/Search/Discover/Library parity

- [x] MetaDetails safe-area (`padding-top` env safe-area)
- [x] Rating tooltips on MetaPreview `Ratings`
- [x] Discover empty-filter crash fix
- [~] Last-watched scroll — existing `Video.js` `scrollIntoView`
- [~] Loading layout shift — existing skeleton patterns
- [~] Library empty states — existing copy

## Phase 06 — Settings/Addons/Calendar

- [x] Settings sections: Interface, Streaming, Info wired in dashboard
- [x] Translations scan restored
- [x] Calendar export and router wire-up
- [x] Addons legal/safety notice copy

## Phase 07 — iOS PWA manifest, offline, update

- [x] Manifest icons/screenshots/labels
- [x] iOS meta tags
- [x] Offline banner
- [x] Update prompt (`PwaUpdateBanner`)
- [x] Workbox verification script
- [x] PWA e2e tests

## Phase 08 — Cinematic Gold Glass design system

- [x] Canonical tokens (`src/styles/tokens.css`)
- [x] README + DESIGN rewritten for Cinematic Gold Glass
- [~] Full route visual pass — incremental; script `pnpm visual-regression` for baselines
- [~] Visual regression CI artifact — owner reviews first capture

## Phase 09 — Backend/security/payments

- [x] api-proxy Zod validation (`api-proxy/schemas.js`) on canon-take, checkout, access verify
- [x] `POST /api/access/verify` + client `verifyAccessKeyWithApi`
- [x] Supabase RLS migration file + unit test for policy strings
- [!] Supabase RLS live verification — blocked (owner project; see `docs/implementation-blockers.md`)
- [!] Stripe webhook live verification — blocked (owner secrets)
- [x] Access key gate — client + optional server verify

## Phase 10 — Testing, a11y, performance

- [x] Unit tests (Discover, routes, i18n, api-proxy schemas, access key API, RLS migration)
- [x] Playwright e2e smoke + iOS viewport
- [~] Accessibility — incremental aria on new UI
- [~] Performance — bundle size warnings documented in build

## Phase 11 — Final docs and release readiness

- [x] environment.md, pwa-ios.md, security.md
- [x] stremio-upstream-sync.md
- [x] release-notes-draft.md
- [x] README/DESIGN parity with design system

## Final acceptance checklist (Section 19)

- [x] `.env.local` not tracked
- [x] Single package manager (pnpm)
- [x] License metadata consistent
- [x] Stremio runtime packages updated
- [x] Core/provider architecture stable
- [x] Calendar exported
- [x] Player safe-area, Safari fullscreen, subtitles hook, media keys
- [x] MetaDetails safe areas + rating tooltips
- [x] Discover empty filter crash fixed
- [x] Settings organized (Interface / Streaming / About)
- [x] Addons safe/legal copy
- [x] PWA manifest and iOS meta tags
- [x] Offline and update flows
- [!] Supabase RLS verified in owner env
- [!] Stripe server-verified in owner env
- [x] API proxy request validation
- [x] Design tokens unified
- [x] Mobile layouts e2e at 390 width
- [x] Tests, build, SW verification (run each release)
