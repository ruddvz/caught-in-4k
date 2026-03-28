# C4K Plan
Last updated: 2026-03-27

---

## ACTIVE BUGS

All confirmed, not yet fixed. Structured by session.

### [F5] Hero Arrow Removal
**Severity:** Medium | **Status:** Open
**Files:** `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`
**Fix:**
- Remove left/right navigation arrows entirely from hero carousel (remove DOM elements and all associated CSS)
- Remove "Previous" / "Next" title labels if present
- Dots-only carousel navigation — no arrows
**Agent:** Structure

---

### [F6] Canon Take Redesign — One-Line Compact
**Severity:** Medium | **Status:** Open
**Files:** `src/common/pollinationsApi.js`, `src/components/CanonTakeBox/CanonTakeBox.js`, `src/components/CanonTakeBox/styles.less`
**Fix:**
- Canon Take must NOT be labeled "Canon Take" — remove that label entirely
- Display as a single line of text (truncate with ellipsis if too long; no wrapping)
- Prompt: must produce a single punchy sentence (≤15 words) — no intro, no "Canon Take:" prefix
- Font: `1rem`, `font-weight: 500`; padding tightened to `0.75rem 1rem`
- Integrate the one-liner into the Satisfaction Meter card (see F7) instead of as a separate box
**Agent:** Soul (prompt), Structure (styles/layout)

---

### [F7] Satisfaction Meter — Dial + Verdict + Canon One-Liner + 3 Ratings
**Severity:** Medium | **Status:** Open
**Files:** `src/components/SatisfactionMeterDial/` (new or existing), `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`, `src/components/index.ts`
**Fix:**
- Ensure the component actually mounts and renders — investigate why it wasn't showing up (check imports, conditional guards, data availability)
- SVG 180° dial: averages IMDB + RT + Metacritic (requires ≥2 sources; else hide entire card)
- 5-tier verdict label shown prominently below dial needle:
  - 0–39: "Certified Flop"
  - 40–59: "Mid at Best"
  - 60–74: "Worth a Watch"
  - 75–89: "Slaps Hard"
  - 90–100: "Absolute Cinema"
- Below the verdict label: Canon one-liner (single line, from F6) — this replaces the separate CanonTakeBox
- Below the dial section: display 3 individual rating pills in one row — IMDB (score/10), Rotten Tomatoes (%), Metacritic (score/100)
  - Use correct logos/icons for each service
  - If a rating is unavailable, hide that pill — don't show "N/A"
- Needle animates on mount and carousel rotation
- Visible on desktop; on mobile (≤768px) show compact version: verdict label + one-liner + 3 rating pills (hide the SVG dial arc itself to save space)
- Glass card style matching existing elevation system
**Agent:** Structure
**Blocking:** F6 (Canon one-liner prompt)

---

### [F8] Hero Mobile Gap — Show Trailer Button to Hero Bottom
**Severity:** Medium | **Status:** Open
**Files:** `src/routes/Board/HeroShelf/HeroShelf.js`, `src/routes/Board/HeroShelf/styles.less`
**Fix:**
- On mobile (≤768px) there is a large negative/empty space below the "Show Trailer" / action buttons and the bottom edge of the hero section
- Remove excess `padding-bottom`, `margin-bottom`, or `min-height` on hero container that causes this gap
- Hero bottom should be flush with or very close to the buttons — no large empty zone
- Verify against S2.4 fix (which addressed a similar gap) — this may be a regression or a different element
**Agent:** Structure

---

### [BUG-S2.3] Top Bar Missing on Detail Page Mobile
**Severity:** Major | **Status:** Open
**Files:** `src/routes/MetaDetails/MetaDetails.js`, `src/components/MainNavBars/MainNavBars.tsx`
**Fix:** `position: sticky; top: 0; z-index: 100` on top bar.

---

## RESOLVED BUGS

- S1.1a Settings cannot scroll — **FIXED** (overflow-y: auto)
- S1.1b Settings dropdowns don't open — **VERIFIED FIXED** (z-index: 9999 already in place)
- S1.2 Detail page summary/genres/cast hidden — **VERIFIED FIXED** (height: auto; overflow: visible already in place)
- S1.3 Detail card collapses (mobile) — **FIXED** (flex-shrink: 0 on hero-widget)
- S1.4 Canon Take stuck in skeleton — **VERIFIED FIXED** (timeout fallback already implemented)
- S2.1a Mobile bottom nav not rendering — **VERIFIED FIXED** (always mounted in MainNavBars.tsx)
- S2.1b Breakpoint gap at 768px — **VERIFIED FIXED** (breakpoints aligned)
- S2.2 Bottom nav active tab circle → pill — **VERIFIED FIXED** (border-radius: 9999px already in place)
- S2.4 Hero empty space below buttons — **FIXED** (margin-bottom: 16px on .hero-actions) — possible mobile regression tracked as F8
- S2.5a TRAILER button plays wrong movie — **VERIFIED FIXED** (trailerHref reactive from item)
- S2.5b No swipe gesture on hero — **VERIFIED FIXED** (touch handlers already implemented)
- S3.1a Board page ends abruptly — **VERIFIED FIXED** (overflow-y: auto + proper padding)
- S3.1b Empty gap after hero — **VERIFIED FIXED** (margins already correct)
- S3.2a Genre dropdown overlaps grid — **VERIFIED FIXED** (z-index already in place)
- S3.2b Titles truncated to one line — **VERIFIED FIXED** (-webkit-line-clamp: 2 already in place)
- S3.3 Detail right panel dead space — **VERIFIED FIXED** (height: auto already in place)
- S4.1 viewport-fit=cover missing — **VERIFIED FIXED** (already in webpack config)
- S4.2 Content hides behind bottom nav — **FIXED** (padding-bottom added to Board; MainNavBars already handles others)
- S4.3 Add to Library no feedback — **VERIFIED FIXED** (auth redirect already in MetaPreview.js)

---

## EXECUTION PLAN

### Legend
- `[x]` Done | `[ ]` Not Started | `[-]` In Progress | `[!]` Blocked

### Parallel Work Available (no dependencies)
- S1.2 Detail page overflow fix (MetaPreview only)
- S2.4 Hero empty space (HeroShelf only)
- S2.5b Swipe gesture (HeroShelf only)
- S4.3 Add to Library feedback (MetaPreview only)
- F3 PWA icon (assets + manifest only)

---

### CRITICAL — Session 1: Overflow Fixes

- [x] **[S1.1a]** Settings page cannot scroll
- [x] **[S1.1b]** Settings dropdowns don't open
- [x] **[S1.2]** Detail page summary/genres/cast hidden
- [x] **[S1.3]** Detail card collapses on mobile
- [x] **[S1.4]** Canon Take stuck in skeleton

---

### CRITICAL — Session 2: Mobile Navigation + Hero

- [x] **[S2.1a]** Mobile bottom nav not rendering
- [x] **[S2.1b]** Breakpoint gap at 768px
- [x] **[S2.2]** Bottom nav active tab circle → pill
- [x] **[S2.3]** Top bar missing on detail page mobile
- [x] **[S2.4]** Hero empty space below buttons
- [x] **[S2.5a]** TRAILER button plays wrong movie
- [x] **[S2.5b]** No swipe gesture on hero (mobile)

---

### MAJOR — Session 3: Board + Discover Layout

- [x] **[S3.1a]** Board page ends abruptly
- [x] **[S3.1b]** Empty gap after hero
- [x] **[S3.2a]** Genre dropdown overlaps grid cards
- [x] **[S3.2b]** Titles truncated to one line
- [x] **[S3.3]** Detail right panel dead space

---

### MAJOR — Session 4: Safe Area + Content Padding

- [x] **[S4.1]** viewport-fit=cover missing
- [x] **[S4.2]** Content hides behind bottom nav
- [x] **[S4.3]** Add to Library no feedback

---

### MEDIUM — Features In Progress

- [x] **[F1]** Per-profile accent color (Canvas API)
- [x] **[F5]** Hero Arrow Removal (remove left/right arrows + labels entirely, dots only)
- [x] **[F6]** Canon Take Redesign — One-Line (no label, single punchy sentence, integrated into F7)
- [x] **[F7]** Satisfaction Meter — Dial + Verdict + Canon one-liner + 3 rating pills (IMDB, RT, Metacritic); fix visibility bug; mobile compact mode
- [x] **[F8]** Hero Mobile Gap — close space between action buttons and hero bottom
- [ ] **[F2]** Profile PIN lock — Depends on: F1
- [ ] **[F3]** PWA icon with black background — PARALLEL
- [ ] **[F4]** Hero swipe gesture — same as S2.5b

---

### ROADMAP — After All Bugs Fixed

- [ ] **[R1]** Canon Take additional LLM fallbacks (OpenRouter/Groq) — Agent: Soul
- [ ] **[R2]** AI poster fallbacks (Pollinations image API) — Agent: Soul
- [ ] **[R3]** Satisfaction Meter one-liners audit — Agent: Soul
- [ ] **[R4]** Rate limiting + helmet.js on api-proxy.js — Agent: Soul
- [ ] **[R5]** PWA improvements (Workbox, install prompt) — Agent: Structure
- [ ] **[R6]** Analytics (Plausible) — Agent: Structure
- [ ] **[R7]** Performance audit — Agent: Guardian
- [ ] **[R8]** CJS → ESM migration — Agent: Structure

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
