# Caught in 4K — Design System v3

> Living design document. Keep this updated after every major design change.

---

## 1. Design Identity

| Attribute | Value |
|---|---|
| **Aesthetic** | Matte Slate + Soft Neumorphic — rounded cards, deep shadows, no hard edges |
| **Layout Model** | Widget Dashboard — content broken into floating, rounded widget cards |
| **Typography** | `Inter` or `Outfit` via Google Fonts (system sans-serif fallback) |

---

## 2. Design Tokens

### Colors

| Token | Value | Usage |
|---|---|---|
| `--bg-body` | `#1e2029` | App base background |
| `--bg-surface-1` | `#2a2c38` | Widget cards, nav pills, carousels |
| `--bg-surface-2` | `#3b3e4f` | Elevated elements inside cards |
| `--accent-primary` | `#ffffff` | Primary CTAs (Watch button, active tab) |
| `--accent-secondary` | `#ff4d4f` | Badges, warnings, remove actions |
| `--accent-tertiary` | `#ffd043` | Ratings, stars, IMDb tags |
| `--text-primary` | `#f8f9fa` | Headings and primary body text |
| `--text-secondary` | `#9ca3af` | Subtitles, duration, disabled state |

### Radii & Shadows

| Token | Value | Usage |
|---|---|---|
| `--radius-card` | `32px` | All large widget panels and poster cards |
| `--radius-pill` | `999px` | Nav bar, filter buttons, CTAs |
| `--radius-avatar` | `16px` | Cast/crew squircle portraits |
| `--shadow-soft` | `0 16px 32px rgba(0,0,0,0.2)` | Card depth, no neon glow |

---

## 3. Typography

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero Title | `clamp(2rem, 4vw, 3.5rem)` | `800` | Tight letter-spacing `-0.04em` |
| Section Heading | `1.6rem` | `800` | Carousel row titles |
| Card Title | `1.1rem` | `800` | Below poster, truncated 1 line |
| Meta Text | `0.9rem` | `600` | Rating, year. Color: `--text-secondary` |
| Nav Label | `1rem` | `700` | Top nav tabs |
| Bottom Nav Label | `0.65rem` | `700` | Icon label below icon on mobile |

---

## 4. Components

### 4a. Top Navigation
- Full-width transparent bar, `z-index: 1001`.
- **Left:** Logo (`3.5rem` icon, links to `#/`).
- **Center:** Pill nav (`--bg-surface-1`, `border-radius: 999px`) containing 6 tabs: Board, Search, Discover, Library, Addons, Settings.
  - Tab labels: **Title Case** (e.g. "Board", "Discover") — consistent across top and bottom nav.
  - Active tab: white background (`--accent-primary`), dark text.
- **Right:** Fullscreen button + Profile circle.
- **Mobile (<640px):** Top nav center pill is hidden. A **bottom nav pill** takes over (see 4b).

### 4b. Mobile Bottom Navigation
- Fixed at bottom of screen, full-width, `border-radius: 2.25rem 2.25rem 0 0`.
- Frosted glass: `background: rgba(13,17,23,0.95)`, `backdrop-filter: blur(50px)`.
- Each tab: icon stacked above text label. Label is Title Case.
- Safe area bottom inset applied via `calc(env(safe-area-inset-bottom) + 1.25rem)`.

### 4c. Hero Banners (Board)
- Massive floating rounded card: `border-radius: 2rem`, `height: calc(100vh - 4rem)`.
- Background image fills the card with `object-fit: cover`, `brightness(0.7)`.
- Two-layer gradient overlay (bottom-to-top + left-to-right) for text legibility.
- Content: title, meta badges, two CTA pill buttons — all left-aligned at bottom of card.
- **Mobile:** `height: calc(100vh - 9rem)`, `border-radius: 1.5rem`.

### 4d. Board Carousels
- Each section is a `MetaRow` with a horizontal scroll container (`overflow-x: auto`).
- Fixed item widths: `180px` (poster/square), `320px` (landscape).
- `margin-bottom: 2.5rem` between all rows for consistent spacing.
- Placeholder items use same widths so they don't shift on load.

### 4e. Discover Page
- **Desktop:** Two-column flex row. Left = scrollable poster grid. Right = `28rem` wide MetaPreview side panel.
- **Mobile/Tablet:** MetaPreview fully hidden. Full width grid only.
- Grid: `repeat(auto-fill, minmax(160px, 1fr))` on desktop, `minmax(100px, 1fr)` on mobile.
- Filter row: pill-style dropdowns visible on desktop, collapsed to a filter-button modal on mobile.

### 4f. MetaPreview (Detail Sidebar)
- Sits in a `32px`-radius glass container with soft drop shadow.
- Top: background blur hero image with title + meta info overlay.
- Below: description text, genre links, action buttons.

---

## 5. Animations

- **Card Hover:** `translateY(-8px)` + increased shadow opacity. No 3D rotation.
- **Row Entrance:** `opacity: 0 → 1` + `translateY(20px → 0)` with staggered delay per row (`var(--row-index) * 100ms`).
- **Pill Transition:** `transition: background 0.3s ease` for active state toggle.
- **Hero Image:** `transform: scale(1.05)` on slide hover over `1.2s`.

---

## 6. Known Issues & Bugs (Fix These Next)

| # | Issue | Location | Status |
|---|---|---|---|
| 1 | Discover MetaPreview doesn't hide on iPad-size screens properly | `Discover/styles.less` @small breakpoint | 🔴 Needs testing |
| 2 | `env(safe-area-inset-top)` padding is duplicated across 5+ routes | `MainNavBars.less` | 🟡 Tech debt |
| 3 | Continue Watching items may still show incorrect poster widths on first load | `MetaRowPlaceholder` + `MetaRow` | 🟡 Monitor |
| 4 | Bottom nav active state uses white pill but dark icon may not contrast well on all wallpaper covers | `MainNavBars.less` | 🟡 Review |
| 5 | Hero text overflows on ultrawide monitors (>2000px) | `HeroShelf/styles.less` | 🔴 Cap `max-width` on content |

---

## 7. Suggested Design Improvements

These are prioritized improvements that would meaningfully elevate the UI. (✅ = Completed)

### 🚀 Completed Improvements

- [x] **A. Load `Inter` from Google Fonts**: Standardized typeface to Inter for a premium feel.
- [x] **B. Skeleton Loading Screens**: Implemented high-fidelity skeleton rows on Board and Discover.
- [x] **C. Hero Banner Carousel Polish**: Added 8s autoplay and smoother slide transitions.
- [x] **D. Category Quick-Filter Bar**: Added genre pills to the Board page.
- [x] **E. Poster Progress Indicators**: Added 6px rounded progress bars on "Continue Watching" items.
- [x] **F. Glassmorphism Active Tab**: Refined Top Navigation pill with 24px backdrop-blur.
- [x] **G. Smooth Page Transitions**: Global route fade-in/up animation applied.
- [x] **H. MetaItem Rating Chip Redesign**: IMDb scores now render as floating yellow glass pills.

### 🎨 Remaining Polish

- [ ] **I. Settings & Addons Widget Wrap**: Ensure Settings/Addons use dash-card container styles.
- [ ] **J. Empty State illustrations**: Replace generic images with high-quality dashboard assets.

---

## 8. Agent Instructions

- **Always use** `var(--bg-surface-1/2)` for backgrounds. Never hardcode `#000` or `#fff`.
- **Always use** `var(--radius-card)` or `var(--radius-pill)`. No raw `px` border-radius values.
- **Tab labels** must be **Title Case** in the `TABS` array and rendered directly (no `.toUpperCase()` or `t()`).
- **Mobile first:** always add a `@media (max-width: @minimum)` block for any new component.
- Before adding any new LESS rule, open the existing file and check for conflicts with existing classes.
