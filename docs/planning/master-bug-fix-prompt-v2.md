# Caught in 4K — Master Bug Fix Prompt
## 20 confirmed bugs. 5 sessions. Read this fully before starting any session.

---

## MANDATORY SETUP — EVERY SESSION

1. Read `.github/workflow-101.md` in full — follow phases 0–8 as a checklist.
2. Read `docs/CODEMAPS/OVERVIEW.md` for project architecture.
3. Read only the CODEMAPS files listed for that session.
4. Do NOT scan the full src/ directory — use CODEMAPS only.
5. Use `/plan` before any session touching 3+ files.
6. Use `/build-fix` to implement. Use `/code-review` after completing.
7. Run `pnpm run build` at the end of every session — zero errors required before commit.

---

## PROJECT IDENTITY — ALWAYS TRUE

Name: Caught in 4K. Tagline: Raw. Real. Rated. (never all caps, always with periods)
Stack: React 18 + TypeScript + LESS (CSS Modules) + Webpack 5
Run locally: pnpm start → http://localhost:3000
Base background: rgba(8, 6, 16, 1) — never change this
Accent color: dynamic from profile avatar — CSS var: --primary-accent-color
NEVER reference the legacy product name (`Stremio`), "fork", or "add-ons" in user-facing text

---

## HOW TO USE THIS PROMPT

There are 5 sessions. Each session has 3–5 phases.
**After each session: run the verification checklist. All items must pass before committing.**
Do not start the next session until the current one is verified and committed.
Do not combine sessions — they are ordered by dependency.

---

# ═══════════════════════════════════════════════════
# SESSION 1 — OVERFLOW FIXES (CRITICAL)
# Bugs: Settings scroll, Settings dropdowns, Detail summary hidden, Canon Take stuck
# These are ALL the same root problem: overflow: hidden cutting off content
# CODEMAPS: routes.md (Settings, MetaDetails), components.md (MetaPreview, CanonTakeBox)
# ═══════════════════════════════════════════════════

Root cause confirmed: fixed height containers with `overflow: hidden` clip content.
- Settings: `.settings-content` is 552px tall, content is 1660px
- Detail page: `.description-widget` is 49px tall, content is 180px

---

## Phase 1.1 — Fix Settings Panel Scroll + Dropdowns

**Files:** `src/routes/Settings/Settings.tsx` and companion .less

**Step 1 — Find the blocking element:**
Open the Settings LESS file. Search for `overflow: hidden`.
The confirmed blocked class compiles to `.settings-content-co5eU` in the DOM.
Find the original uncompiled class name and change:
`overflow: hidden` → `overflow-y: auto`
Also remove any fixed pixel `height` — use `height: 100%` or remove entirely.

**Step 2 — Fix dropdown z-index:**
With overflow fixed, dropdowns should work. Also verify z-index:
```css
.dropdown-menu, [class*="menu-container"] {
    z-index: 50;
    position: absolute;
}
```

**Step 3 — Mobile settings scroll:**
```css
@media (max-width: 768px) {
    .settings-container {
        overflow-y: auto;
        height: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: calc(70px + env(safe-area-inset-bottom) + 24px);
    }
}
```

---

## Phase 1.2 — Fix Detail Page Summary + Genres + Cast Hidden (Desktop + Mobile)

**Files:**
- `src/components/MetaPreview/MetaPreview.js` (410 lines) and companion .less
- `src/routes/MetaDetails/MetaDetails.js` (245 lines)

**Confirmed:** `.description-widget` has `overflow: hidden`, height 49px, content 180px.
`meta-links-widget` has `height: 43px`, scrollHeight 248px — only 1 genre visible.

**Step 1 — Open MetaPreview LESS file. Read the ACTUAL class names. Do not guess.**
Search for `overflow: hidden` and find every instance.

**Step 2 — Fix description:**
On the real class name found in the file:
```css
.[real-description-class] {
    overflow: visible;
    height: auto;
    max-height: none;
}
```

**Step 3 — Fix meta-links (genres, cast, directors):**
```css
.[real-meta-links-class] {
    height: auto;
    overflow: visible;
}
```

**Step 4 — Mobile overflow fix (additional):**
```css
@media (max-width: 768px) {
    .[real-description-class],
    .[real-meta-links-class] {
        overflow: visible !important;
        height: auto !important;
        max-height: none !important;
    }
}
```

**Step 5 — Make left panel scrollable on mobile:**
```css
@media (max-width: 768px) {
    .[real-left-panel-class] {
        overflow-y: auto;
        max-height: calc(100dvh - 56px - 70px);
        -webkit-overflow-scrolling: touch;
    }
}
```

---

## Phase 1.3 — Fix Detail Card Collapsing as Streams Load (iPhone Bug)

**Files:** `src/components/MetaPreview/MetaPreview.js` and companion .less

**Problem:** On iPhone, the top info card (poster, title, badges, action buttons)
collapses/shifts height when addon streams load in, causing a jarring visual jump.

**Root cause:** The streams section is likely inside the same container as the info card.
As stream items populate, the container height changes.

**Fix:**
1. Open MetaPreview. Confirm the streams/addons section is a SEPARATE container
   from the title/poster/buttons info card. If they are in the same container, separate them.
2. Give the info card a stable minimum height:
```css
@media (max-width: 768px) {
    .[real-info-card-class] {
        min-height: fit-content;
        flex-shrink: 0;
        transition: none;  /* no animated height change */
    }
}
```
3. The streams section must render below the info card in independent DOM flow —
   not inside the card itself.

---

## Phase 1.4 — Canon Take Timeout Fallback

**File:** `src/components/CanonTakeBox/CanonTakeBox.js` (66 lines)

**Problem:** Canon Take shows skeleton indefinitely when no data exists.

```jsx
const [timedOut, setTimedOut] = React.useState(false);

React.useEffect(() => {
    if (!canonTake) {
        const timer = setTimeout(() => setTimedOut(true), 12000);
        return () => clearTimeout(timer);
    }
    setTimedOut(false);
}, [canonTake]);

if (timedOut && !canonTake) {
    return <div className={styles['canon-take-fallback']}>
        No take yet — check back soon.
    </div>;
}
```

```css
.canon-take-fallback {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    font-style: italic;
    padding: 0.75rem 1rem;
}
```

---

## ✅ SESSION 1 VERIFICATION CHECKLIST

Settings (`#/settings`):
- [ ] Page scrolls freely — all options reachable including Play in External Player
- [ ] Language, Font Size, Font Color, Background Opacity dropdowns all open
- [ ] Mobile: settings stacks single column and scrolls vertically

Detail page (any movie):
- [ ] SUMMARY text fully visible
- [ ] GENRES, CAST, DIRECTORS all visible
- [ ] Mobile: opening a movie — top info card does NOT shift/collapse as streams load
- [ ] Canon Take loads OR shows "No take yet" after 12 seconds — never stuck

`pnpm run build` → zero errors → commit.

---

# ═══════════════════════════════════════════════════
# SESSION 2 — MOBILE NAVIGATION + HERO FIXES (CRITICAL)
# Bugs: Bottom nav not rendering, top bar missing on detail, nav active tab wrong shape,
#       hero empty space, wrong trailer, no swipe on hero
# CODEMAPS: components.md (MainNavBars, TopNavigationBar), routes.md (Board/HeroShelf)
# ═══════════════════════════════════════════════════

---

## Phase 2.1 — Fix Mobile Bottom Nav: Always Render + Correct Breakpoints

**Files:**
- `src/components/MainNavBars/MainNavBars.tsx` (54 lines)
- Bottom nav LESS file

**Confirmed problem:** At ≤768px the top nav pill is hidden with `display: none !important`.
The `.mobile-bottom-nav` CSS class exists but the component is NEVER MOUNTED in the DOM.
Result: iPhone/iPad users have zero navigation.

**Step 1 — Ensure bottom nav is always in the JSX:**
The bottom nav must ALWAYS be rendered in React JSX.
Visibility is controlled by CSS only — never by JavaScript conditional mounting.

```jsx
// MainNavBars.tsx structure:
return (
    <>
        <TopNavigationBar ... />   {/* hidden on mobile via CSS */}
        <BottomNavBar tabs={TABS} activeTab={activeTab} />  {/* hidden on desktop via CSS */}
    </>
);
```

**Step 2 — Fix breakpoints (no gap at 768px):**
```css
/* Top nav: hide at and below 768px */
@media (max-width: 768px) {
    .top-nav-container { display: none !important; }
}

/* Bottom nav: show at and below 768px, hide above */
@media (min-width: 769px) {
    .bottom-nav-container { display: none !important; }
}
@media (max-width: 768px) {
    .bottom-nav-container { display: flex !important; }
}
```

**Step 3 — Bottom nav container styles:**
Find the ACTUAL class name in the bottom nav LESS file before applying.
```css
@media (max-width: 768px) {
    .[real-bottom-nav-class] {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        flex-wrap: nowrap;
        height: 70px;
        padding: 8px 8px;
        padding-bottom: max(8px, env(safe-area-inset-bottom));
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 100;
        background: rgba(8, 6, 16, 0.95);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
}
```

---

## Phase 2.2 — Fix Bottom Nav Active Tab: Pill Shape (iPhone Bug)

**Problem:** Active tab shows an accent-colored circle around only the icon.
The design requires a PILL that wraps both the icon AND the label — same concept
as the desktop top nav pill.

**Find the ACTUAL class names in the bottom nav LESS file. Do not guess.**

```css
@media (max-width: 768px) {
    .[real-nav-tab-class] {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        flex: 1;
        min-width: 0;
        padding: 6px 10px;
        border-radius: 9999px;
        transition: background 0.2s ease, color 0.2s ease;
    }

    /* Active: pill wraps icon + label */
    .[real-nav-tab-class].active,
    .[real-nav-tab-class][class*="active"] {
        background: var(--primary-accent-color);
        color: #000000;
        padding: 6px 14px;
        border-radius: 9999px;
    }

    /* Inactive: transparent */
    .[real-nav-tab-class]:not(.active) {
        background: transparent;
        color: rgba(255, 255, 255, 0.5);
    }

    .[real-nav-tab-icon-class] {
        width: 20px;
        height: 20px;
    }

    .[real-nav-tab-label-class] {
        font-size: 9px;
        font-weight: 600;
        white-space: nowrap;
    }
}
```

---

## Phase 2.3 — Restore Top Bar on Detail Page Mobile (iPhone Bug)

**Problem:** On mobile, the detail page (`#/metadetails/...`) top bar
(C4k logo + profile avatar) disappears at certain scroll positions or entirely.
The logo taps to go home; the avatar opens profile selection.
Both must be visible at ALL times on the detail page.

**Files:**
- `src/routes/MetaDetails/MetaDetails.js`
- `src/components/MainNavBars/MainNavBars.tsx`

**Fix:**
Ensure the top bar on mobile is `position: sticky; top: 0` — NOT position relative/absolute.

```css
@media (max-width: 768px) {
    .[real-top-bar-class] {
        position: sticky;
        top: 0;
        z-index: 100;
        background: rgba(8, 6, 16, 0.95);
        backdrop-filter: blur(20px);
        height: 56px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        padding-top: env(safe-area-inset-top);
    }
}
```

Also verify the top bar renders on the MetaDetails route specifically.
If MainNavBars is not included in the MetaDetails layout, add it.

On mobile detail page, the top bar must show:
- Left: C4k logo (tapping navigates to `#/`)
- Right: profile avatar (tapping navigates to `#/profiles`)

---

## Phase 2.4 — Fix Hero Empty Space Below Buttons (iPhone Bug)

**Problem:** Large black empty space below the SHOW/TRAILER buttons before
the carousel dots. Makes the hero look broken.

**File:** `src/routes/Board/HeroShelf/HeroShelf.js` and companion .less

**Step 1 — Open HeroShelf LESS. Find the actual class names for:**
- The action buttons container (SHOW + TRAILER)
- The carousel dots container
- The hero outer container

**Step 2 — Fix:**
```css
@media (max-width: 768px) {
    .[real-hero-container-class] {
        height: calc(100dvh - 56px - 70px); /* viewport - top bar - bottom nav */
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .[real-action-buttons-class] {
        margin-bottom: 16px;  /* tight gap to dots — was likely 60-80px */
        padding-bottom: 0;
        flex-shrink: 0;
    }

    .[real-carousel-dots-class] {
        margin-top: 0;
        padding-bottom: 8px;
        flex-shrink: 0;
    }
}
```

---

## Phase 2.5 — Fix TRAILER Button Playing Wrong Movie + Add Hero Swipe

**File:** `src/routes/Board/HeroShelf/HeroShelf.js`

**Trailer bug:** TRAILER button plays a different film's trailer than the active slide.
Trailer URL must come from the CURRENTLY ACTIVE slide:
```jsx
// Wrong — static first slide:
const trailerHref = catalog[0]?.trailerStreams?.[0]?.deepLinks?.player;

// Correct — reactive to active index:
const activeItem = catalog[activeIndex];
const trailerHref = activeItem?.trailerStreams?.[0]?.deepLinks?.player ?? null;
```
Ensure `trailerHref` recomputes whenever `activeIndex` changes.

**Swipe gesture — no new packages:**
```jsx
const touchStartX = React.useRef(null);

const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
const onTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
    touchStartX.current = null;
};
```
Add `onTouchStart` and `onTouchEnd` to the hero container element.

**Carousel dots — larger touch targets:**
```css
@media (max-width: 768px) {
    .[real-dot-class] {
        padding: 12px 8px;  /* expand touch area around small dots */
        cursor: pointer;
    }
}
```

---

## ✅ SESSION 2 VERIFICATION CHECKLIST

Mobile (test at 390px in DevTools):
- [ ] Bottom nav renders with all 6 tabs visible
- [ ] Active tab is a PILL shape (wraps icon + label), not a circle
- [ ] Accent color applies to active pill
- [ ] At exactly 768px: bottom nav visible, top nav hidden
- [ ] At 769px: top nav visible, bottom nav hidden

Detail page mobile:
- [ ] C4k logo visible top-left at ALL scroll positions
- [ ] Profile avatar visible top-right at ALL scroll positions

Board page mobile:
- [ ] No empty space below SHOW/TRAILER buttons — dots sit tight below buttons
- [ ] TRAILER plays the correct film's trailer (test by switching slides)
- [ ] Swiping left/right on hero changes the slide

`pnpm run build` → zero errors → commit.

---

# ═══════════════════════════════════════════════════
# SESSION 3 — BOARD + DISCOVER LAYOUT BUGS
# Bugs: Board empty gap, Board abrupt end, Discover dropdown z-index,
#       Discover title truncation, Detail right panel dead space
# CODEMAPS: routes.md (Board, Discover, MetaDetails), components.md (MetaItem)
# ═══════════════════════════════════════════════════

---

## Phase 3.1 — Board: Empty Gap After Hero + Abrupt Page End

**File:** `src/routes/Board/Board.js` (164 lines) and companion .less

**Empty gap after hero:**
Reduce excessive `margin-top` or `padding-top` on the first catalog row.
Target: 24–32px gap between hero and first row only.

**Page ends at Public Domain Movies:**
Find the main Board container in Board.less. Fix:
```css
.board-container {
    /* Remove: height: 100vh or overflow: hidden */
    min-height: 100dvh;
    overflow-y: auto;
    padding-bottom: calc(40px + env(safe-area-inset-bottom));
}
```
The page must scroll indefinitely through all catalog rows.

---

## Phase 3.2 — Discover: Dropdown Z-Index + Title Wrapping

**Files:** `src/routes/Discover/styles.less`, `src/components/MetaItem/styles.less`

**Dropdown overlapping grid (Bug #8):**
```css
/* In Discover styles.less */
.selectable-inputs-container {
    z-index: 20;
    position: relative;
}
:global(.multiselect-menu-container) {
    z-index: 100 !important;
    position: absolute;
}
```

**Titles truncated to one line (Bug #12):**
In `src/components/MetaItem/styles.less`, find `.title-label`.
Apply desktop-only change:
```css
@media (min-width: 769px) {
    .title-label {
        white-space: normal;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: 2.5em;
    }
}
```

---

## Phase 3.3 — Detail Right Panel Dead Space

**File:** `src/routes/MetaDetails/StreamsList/StreamsList.js` and .less

**Problem:** Right panel has huge empty green block below 2–3 sources.

Find the streams panel container in the LESS file. Apply:
```css
.[real-streams-panel-class] {
    height: auto;
    min-height: 0;
    overflow-y: auto;
    padding-bottom: 24px;
}
```
Remove any `height: 100vh` or fixed pixel height.

---

## ✅ SESSION 3 VERIFICATION CHECKLIST

Board page:
- [ ] 24–32px gap between hero and first catalog row — no void
- [ ] Page scrolls past Public Domain Movies to the end of available content

Discover page:
- [ ] Genre dropdown appears ABOVE grid cards — not behind them
- [ ] Titles wrap to 2 lines on desktop ("Untitled Peaky Blinders Film" fully readable)

Detail page:
- [ ] Right streaming panel sizes to content — no large empty green block

`pnpm run build` → zero errors → commit.

---

# ═══════════════════════════════════════════════════
# SESSION 4 — SAFE AREA + CONTENT PADDING (MOBILE)
# Ensures no content is hidden behind top or bottom bars on any page
# CODEMAPS: routes.md (all routes), config-and-backend.md (HTML template)
# ═══════════════════════════════════════════════════

---

## Phase 4.1 — Verify viewport-fit=cover is Set

**File:** HTML template (find via webpack.config.js HtmlWebpackPlugin)

Confirm the viewport meta tag includes `viewport-fit=cover`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```
Without this, `env(safe-area-inset-*)` values are always zero on iPhone.

---

## Phase 4.2 — Apply Bottom Padding to All Scrollable Pages

Every scrollable page on mobile must have `padding-bottom` to prevent content
hiding behind the fixed bottom nav bar.

For each route, open its LESS file, find the outermost scrollable container
class name, and apply:
```css
@media (max-width: 768px) {
    .[real-container-class] {
        padding-bottom: calc(70px + env(safe-area-inset-bottom) + 16px);
    }
}
```

Routes to fix (find actual class names in each file):
- `src/routes/MetaDetails/` — detail page scroll container
- `src/routes/Board/` — board page scroll container
- `src/routes/Discover/` — discover page scroll container
- `src/routes/Settings/` — settings page scroll container
- `src/routes/Library/` — library page scroll container
- `src/routes/Addons/` — addons page scroll container

---

## Phase 4.3 — "Add to Library" No Feedback When Logged Out

**File:** `src/components/MetaPreview/MetaPreview.js`

```jsx
const profile = useProfile(); // from stremio/common

const handleAddToLibrary = React.useCallback(() => {
    if (!profile?.auth) {
        window.location.hash = '#/intro';
        return;
    }
    // existing add logic
}, [profile]);
```
Never silently do nothing — always give feedback.

---

## ✅ SESSION 4 VERIFICATION CHECKLIST

On iPhone (real device or DevTools 390px):
- [ ] viewport-fit=cover present in page source
- [ ] Board page: last catalog row fully visible above bottom nav
- [ ] Detail page: streams list fully visible, not cut off by bottom nav
- [ ] Discover page: scrollable to last card with nothing hidden
- [ ] Settings page: all settings reachable by scrolling
- [ ] Library page: last item visible
- [ ] "Add to Library" when not logged in → redirects to login page

`pnpm run build` → zero errors → commit.

---

# ═══════════════════════════════════════════════════
# SESSION 5 — FINAL VERIFICATION + CLEANUP
# Verify all 20 bugs are fixed across all viewports
# ═══════════════════════════════════════════════════

This session is verification only — no new code unless a previous session's fix
is missing or incomplete.

Open the live site at `https://ruddvz.github.io/caught-in-4k/` in incognito.
Test at: 390px (iPhone), 768px (iPad), 1280px (desktop).

## ✅ FINAL CHECKLIST — ALL BUGS

**Settings:**
- [ ] All settings reachable by scrolling
- [ ] All dropdowns open and show options
- [ ] Font Color + Background Opacity show current values
- [ ] Mobile: single column, scrollable

**Detail Page:**
- [ ] Summary text fully visible
- [ ] Genres, Cast, Directors all visible
- [ ] Top info card does NOT collapse as streams load (mobile)
- [ ] Canon Take loads or shows fallback after 12s
- [ ] Streaming panel no dead space
- [ ] "Add to Library" gives feedback when not logged in
- [ ] Mobile: C4k logo and profile avatar always visible at top

**Board Page:**
- [ ] No large gap after hero
- [ ] Scrolls past Public Domain Movies to end
- [ ] TRAILER plays correct film's trailer
- [ ] Hero swipe works on mobile (left/right)
- [ ] No empty space below SHOW/TRAILER buttons on mobile

**Discover Page:**
- [ ] Genre dropdown renders above grid
- [ ] Titles wrap to 2 lines on desktop

**Mobile Navigation:**
- [ ] Bottom nav renders at 375px and 768px — all 6 tabs visible
- [ ] Active tab is a PILL (not a circle) using accent color
- [ ] Top nav visible at 769px+
- [ ] No navigation gap at exactly 768px

**General:**
- [ ] All page content scrollable above bottom nav on mobile
- [ ] Build passes: `pnpm run build` → zero errors

---

## GLOBAL RULES FOR ALL SESSIONS

- Never modify `src/routes/Player/` unless explicitly targeted
- Never modify `README.md`
- Never hardcode colors — use CSS variables from `caught-in-4k-theme.less`
- Never commit `.env.local`
- Never add npm packages without flagging why
- Never remove `withCoreSuspender` HOC from any route
- Minimum footprint — only change what the phase explicitly requires
- Every CSS change touching mobile must be inside `@media (max-width: 768px)`
- Every CSS change touching desktop must be inside `@media (min-width: 769px)`
- Before applying ANY CSS fix: open the actual LESS file, find the real compiled
  class name, use that. NEVER guess class names.
- Every session ends with:
  1. What was completed
  2. Anything incomplete or broken
  3. Exact next step
