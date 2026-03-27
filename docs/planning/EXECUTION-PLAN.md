# C4K Execution Plan
Last updated: 2026-03-27
Source: Synced from Obsidian `C4K-Brain/EXECUTION-PLAN.md`

## Legend
- Done | In Progress | Blocked (dependency) | Not Started

## Parallel Work Available (no dependencies)
- ~~S1.1a Settings overflow fix~~ ✓
- S1.2 Detail page overflow fix (MetaPreview only)
- ~~S1.4 Canon Take timeout~~ ✓ (already implemented)
- S2.4 Hero empty space (HeroShelf only)
- ~~S2.5a TRAILER button fix~~ ✓
- S2.5b Swipe gesture (HeroShelf only)
- ~~S4.1 viewport-fit=cover~~ ✓ (already implemented)
- S4.3 Add to Library feedback (MetaPreview only)
- F3 PWA icon (assets + manifest only)

---

## CRITICAL — Session 1: Overflow Fixes

- [x] **[S1.1a]** Settings page cannot scroll
  > `overflow: hidden` -> `overflow-y: auto` on `.settings-content`. Remove fixed height.
  > Files: `src/routes/Settings/Settings.tsx` + `.less`
  > Agent: Structure

- [x] **[S1.1b]** Settings dropdowns don't open
  > `z-index: 9999 !important` on `.multiselect-menu-dropdown` in Settings.less + Player.less (already done)
  > Depends on: S1.1a
  > Agent: Structure

- [x] **[S1.2]** Detail page summary/genres/cast hidden
  > `height: auto; overflow: visible` on `.description-widget` and `.meta-links-widget` (already done)
  > Files: `src/components/MetaPreview/styles.less`
  > Agent: Structure

- [x] **[S1.3]** Detail card collapses on mobile
  > `flex-shrink: 0` on `.hero-widget` in MetaPreview/styles.less
  > Depends on: S1.2
  > Agent: Structure

- [x] **[S1.4]** Canon Take stuck in skeleton
  > 12-second timeout -> fallback message
  > Files: `src/components/CanonTakeBox/CanonTakeBox.js`
  > Agent: Soul | PARALLEL

---

## CRITICAL — Session 2: Mobile Navigation + Hero

- [x] **[S2.1a]** Mobile bottom nav not rendering
  > `mobile-bottom-nav` div always mounted in MainNavBars.tsx, CSS shows it at ≤768px (already done)
  > Files: `src/components/MainNavBars/MainNavBars.tsx` + `.less`
  > Agent: Structure

- [x] **[S2.1b]** Breakpoint gap at 768px
  > Top nav hides at 768px, bottom nav shows at 768px — aligned (already done)
  > Depends on: S2.1a
  > Agent: Structure

- [x] **[S2.2]** Bottom nav active tab circle -> pill
  > `border-radius: 9999px; padding: 0.4rem 0.8rem` on active tab (already done in MainNavBars.less)
  > Depends on: S2.1a
  > Agent: Structure

- [ ] **[S2.3]** Top bar missing on detail page mobile
  > `position: sticky; top: 0; z-index: 100`
  > Agent: Structure

- [x] **[S2.4]** Hero empty space below buttons
  > `margin-bottom: 16px` on `.hero-actions` in HeroShelf/styles.less
  > Files: `src/routes/Board/HeroShelf/styles.less`
  > Agent: Structure | PARALLEL

- [x] **[S2.5a]** TRAILER button plays wrong movie
  > Reactive `trailerHref` from `item.trailerStreams?.[0]?.deepLinks?.player` (already done)
  > Files: `src/routes/Board/HeroShelf/HeroShelf.js`
  > Agent: Structure | PARALLEL

- [x] **[S2.5b]** No swipe gesture on hero (mobile)
  > Touch handlers with 50px threshold (already done in HeroShelf.js)
  > Files: `src/routes/Board/HeroShelf/HeroShelf.js`
  > Agent: Structure | PARALLEL

---

## MAJOR — Session 3: Board + Discover Layout

- [x] **[S3.1a]** Board page ends abruptly
  > Board uses `overflow-y: auto` + `min-height: 100%` + mobile padding-bottom (already done)
  > Agent: Structure

- [x] **[S3.1b]** Empty gap after hero
  > `hero-shelf-row` has `margin-bottom: 2.5rem`, board-row `margin-top: 0` (already done)
  > Agent: Structure

- [x] **[S3.2a]** Genre dropdown overlaps grid cards
  > `z-index: 20` on `.selectable-inputs-container`, `z-index: 100` on multiselect menu (already done)
  > Agent: Structure

- [x] **[S3.2b]** Titles truncated to one line
  > `-webkit-line-clamp: 2` at `min-width: 769px` in MetaItem/styles.less (already done)
  > Agent: Structure

- [x] **[S3.3]** Detail right panel dead space
  > `height: auto; min-height: 0` on `.streams-list-container` (already done)
  > Agent: Structure

---

## MAJOR — Session 4: Safe Area + Content Padding

- [x] **[S4.1]** viewport-fit=cover missing
  > Add to viewport meta tag in webpack HTML template
  > Agent: Structure | PARALLEL

- [x] **[S4.2]** Content hides behind bottom nav
  > MainNavBars.less `nav-content-container` has `padding-bottom: calc(env(...) + 6rem)` at 768px. Board/Discover/Settings also have explicit `padding-bottom` at mobile. Added 768px rule to Board/styles.less.
  > Depends on: S4.1, S2.1a
  > Agent: Structure

- [x] **[S4.3]** Add to Library no feedback
  > `handleToggleInLibrary` checks `profile?.auth`, redirects `#/intro` (already done)
  > Agent: Structure | PARALLEL

---

## MEDIUM — Features In Progress

- [x] **[F1]** Per-profile accent color (Canvas API) — in progress
- [ ] **[F2]** Profile PIN lock — Depends on: F1
- [ ] **[F3]** PWA icon with black background — PARALLEL
- [ ] **[F4]** Hero swipe gesture — same as S2.5b

---

## ROADMAP — After All Bugs Fixed

- [ ] **[R1]** Canon Take additional LLM fallbacks (OpenRouter/Groq) — Agent: Soul
- [ ] **[R2]** AI poster fallbacks (Pollinations image API) — Agent: Soul
- [ ] **[R3]** Satisfaction Meter one-liners audit — Agent: Soul
- [ ] **[R4]** Rate limiting + helmet.js on api-proxy.js — Agent: Soul
- [ ] **[R5]** PWA improvements (Workbox, install prompt) — Agent: Structure
- [ ] **[R6]** Analytics (Plausible) — Agent: Structure
- [ ] **[R7]** Performance audit — Agent: Guardian
- [ ] **[R8]** CJS -> ESM migration — Agent: Structure

---

## DONE

- [x] Green elevation system (--elevation-1/2/3)
- [x] Tabler Icons in navbar
- [x] Animate.css micro-interactions
- [x] Settings: hide Change Password/Delete Account when logged out
- [x] Settings: Log in button pill shape
- [x] Login page redesign
- [x] Google Sign In button
- [x] posterShape="poster" on Discover grid
- [x] OG meta + Twitter card tags
- [x] Mobile safe area insets on top bar
- [x] Discover dropdowns on one row
- [x] Fullscreen button
- [x] Search icon removed from top-right
- [x] Dark green elevation
