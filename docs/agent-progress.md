# Agent Progress — Stremio Parity Plan

Reference plan: `CAUGHT_IN_4K_STREMIO_PARITY_FULL_AGENT_PLAN.md`

## Phase 00 — Baseline, safety, and repo hygiene

- [x] Create progress/blocker/testing docs
- [x] Remove `.env.local` from tracking
- [x] Clean `.gitignore`
- [x] Resolve package manager conflict
- [x] Fix license consistency
- [x] Add commit hash fallback in Webpack
- [~] Run baseline checks
- [~] Open PR

## Phase 01 — Stremio upstream dependency parity

- [ ] Upgrade Stremio runtime packages
- [ ] Upgrade Webpack/toolchain packages
- [ ] Upgrade i18n packages
- [ ] Upgrade Workbox
- [ ] Regenerate lockfile with pnpm
- [ ] Run full checks

## Phase 02 — Core/provider architecture migration

- [ ] Add/port CoreProvider pattern
- [ ] Move core lifecycle out of monolithic App
- [ ] FileDropProvider (verify parity)
- [ ] ShortcutsProvider improvements
- [ ] Platform provider improvements
- [ ] Preserve C4K auth/access/subscription/background agents

## Phase 03 — Gamepad and focus/navigation

- [ ] Port GamepadContext/GamepadNavigation
- [ ] Add setting toggle
- [ ] Fix modal overflow/focus order

## Phase 04 — Player parity and iOS safe areas

- [ ] Player controls + safe areas
- [ ] Safari fullscreen
- [ ] Media session / media keys
- [ ] Subtitle hook + persistence
- [ ] Playback shortcuts fixes
- [ ] HDR badge / video scale

## Phase 05 — Details/Search/Discover/Library parity

- [ ] MetaDetails background/safe areas
- [ ] Rating/action tooltips
- [ ] Mark watched state
- [ ] Last watched scroll
- [ ] Discover no-option crash fix
- [ ] Loading layout shift fixes
- [ ] Search URL handling
- [ ] Library hints and empty states

## Phase 06 — Settings/Addons/Calendar

- [ ] Reorganize Settings sections
- [ ] Shortcut labels and mobile UI
- [ ] Translations scan
- [ ] External players decision
- [ ] Addons safety/copy
- [ ] Calendar export and router wire-up

## Phase 07 — iOS PWA manifest, offline, update

- [ ] Manifest icons/screenshots
- [ ] iOS meta tags
- [ ] Offline fallback
- [ ] Update prompt
- [ ] Workbox verification

## Phase 08 — Cinematic Gold Glass design system

- [ ] Canonical tokens
- [ ] Remove contradictory styles
- [ ] Polish key routes

## Phase 09 — Backend/security/payments

- [ ] Harden api-proxy.js
- [ ] Supabase RLS verification
- [ ] Stripe webhook/entitlements
- [ ] Access key gate security

## Phase 10 — Testing, a11y, performance

- [ ] Unit/component/E2E tests
- [ ] Visual regression screenshots
- [ ] Accessibility pass

## Phase 11 — Final docs and release readiness

- [ ] Finalize README, DESIGN.md, security/PWA docs
- [ ] Release notes
- [ ] Final acceptance checklist

## Final acceptance checklist (Section 19)

See plan Section 19 — updated as phases complete.
