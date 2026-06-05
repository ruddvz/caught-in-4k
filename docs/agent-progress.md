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
- [x] Open PR (#27)

## Phase 01 — Stremio upstream dependency parity

- [x] Upgrade Stremio runtime packages
- [x] Upgrade Webpack/toolchain packages
- [x] Upgrade i18n packages (already current)
- [x] Upgrade Workbox
- [x] Regenerate lockfile with pnpm
- [x] Run full checks

## Phase 02 — Core/provider architecture migration

- [x] Add CoreProvider pattern (`src/core/`)
- [x] Move core lifecycle out of monolithic App
- [x] FileDropProvider (existing; verified in App tree)
- [x] ShortcutsProvider (existing; verified)
- [x] Platform provider (existing; bowser upgraded)
- [x] Preserve C4K auth/access/subscription/background agents

## Phase 03 — Gamepad and focus/navigation

- [!] Port GamepadContext/GamepadNavigation — deferred to follow-up PR (no upstream port in this slice)
- [ ] Add setting toggle
- [~] Modal overflow uses existing safe-area work

## Phase 04 — Player parity and iOS safe areas

- [~] Player controls — existing layout; safe-area padding added to control bar
- [x] iOS PWA safe-area overlap (player control bar + global tokens)
- [x] Safari fullscreen (`webkitEnterFullscreen` fallback in `useFullscreen`)
- [x] Media session (`useMediaSession.ts` already present)
- [~] Subtitle hook — existing Player architecture; full upstream hook port deferred
- [~] Playback shortcuts — ShortcutsProvider in place
- [ ] HDR badge / video scale — deferred (needs stream metadata audit)

## Phase 05 — Details/Search/Discover/Library parity

- [~] MetaDetails safe areas — partial via existing styles
- [ ] Rating/action tooltips — partial upstream port deferred
- [~] Mark watched — existing core actions
- [ ] Last watched scroll — deferred
- [x] Discover no-option crash fix
- [~] Loading layout shift — existing patterns
- [~] Search URL handling — existing `searchQuery` tests
- [~] Library hints — existing empty states

## Phase 06 — Settings/Addons/Calendar

- [~] Reorganize Settings — existing sections
- [~] Shortcut labels — existing SettingsShortcuts route
- [x] Translations scan restored
- [~] External players — existing tests
- [~] Addons safety — `managedAddonSecurity` tests
- [x] Calendar export and router wire-up

## Phase 07 — iOS PWA manifest, offline, update

- [x] Manifest icons/screenshots/labels
- [x] iOS meta tags
- [x] Offline banner
- [x] Update prompt (`PwaUpdateBanner`)
- [x] Workbox verification script
- [x] PWA e2e tests

## Phase 08 — Cinematic Gold Glass design system

- [x] Canonical tokens (`src/styles/tokens.css`)
- [~] Route polish — incremental; full visual pass deferred
- [ ] Visual regression screenshots — deferred (CI artifact step)

## Phase 09 — Backend/security/payments

- [~] api-proxy hardening — existing helmet/CORS/rate limit
- [!] Supabase RLS live verification — blocked (owner project)
- [!] Stripe webhook live verification — blocked (owner secrets)
- [~] Access key gate — client invite model documented

## Phase 10 — Testing, a11y, performance

- [x] Unit tests (Discover crash, routes, i18n baseline)
- [x] Playwright e2e smoke + iOS viewport
- [~] Accessibility pass — incremental aria in new banners
- [~] Performance — bundle warnings documented

## Phase 11 — Final docs and release readiness

- [x] environment.md, pwa-ios.md, security.md
- [x] stremio-upstream-sync.md
- [x] release-notes-draft.md
- [~] README/DESIGN full rewrite — partial

## Final acceptance checklist (Section 19)

- [x] `.env.local` not tracked
- [x] Single package manager (pnpm)
- [x] License metadata consistent
- [x] Stremio runtime packages updated
- [x] Core/provider architecture stable
- [x] Calendar exported
- [~] Player safe-area, Safari fullscreen, subtitles, media keys
- [~] MetaDetails safe areas
- [x] Discover empty filter crash fixed
- [~] Settings organized
- [~] Addons safe/legal copy
- [x] PWA manifest and iOS meta tags
- [x] Offline and update flows
- [!] Supabase RLS verified in owner env
- [!] Stripe server-verified in owner env
- [~] API proxy validation
- [x] Design tokens unified (baseline)
- [x] Mobile layouts e2e at 390 width
- [x] Tests, build, SW verification, e2e pass
