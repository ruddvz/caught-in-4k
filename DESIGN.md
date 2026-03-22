# Caught in 4K — Design System & Ideas

> Living design document. Update this as the UI evolves.

---

## 1. Design Identity

**Brand**: Caught in 4K — a premium entertainment streaming experience.  
**Aesthetic**: Cinematic dark-glass — deep charcoal backgrounds, neon cyan accents, liquid-glass pill nav.  
**Tone**: Modern, premium, Gen Z-native. Clean hierarchy, cinematic drama.

---

## 2. Color System

| Token | Value | Usage |
|---|---|---|
| `--primary-accent-color` | `rgb(0, 240, 255)` — Neon Cyan | Active tabs, primary buttons, highlights, focus rings |
| `--primary-background-color` | `#0c0c0c` | Body, card backgrounds, scroll content |
| `--secondary-background-color` | `#121212` | Secondary panels, modals |
| `--primary-foreground-color` | `rgba(255,255,255,0.9)` | All text |
| `--outer-glow` | `0 0 20px rgba(0,240,255,0.35)` | Cyan bloom effects |
| `--color-imdb` | `#f5c518` | IMDb rating badge |

**Selection Green**: `#22b365` — used sparingly for confirmation/success states.

---

## 3. Typography

**Font**: `PlusJakartaSans` (bundled in `assets/fonts/`)  
**Scale**:
- Hero title (desktop): `4rem / 800 weight`
- Hero title (mobile): `1.3rem / 800 weight`
- Body / description: `1.15rem / 400 weight`
- UI labels (nav): `0.75rem / 500 weight`

---

## 4. Component Inventory

### Navigation — Vertical Pill (Desktop)
- Glass morphism pill: `backdrop-filter: blur(24px)`, rounded `border-radius: 999px`
- Selected tab: Cyan background tint + cyan glow ring + cyan icon/label color
- Position: `fixed; top: 50%; left: 0.5rem` — floats on the left
- Tabs (6): Board, Search, Discover, Library, Add-ons, Settings

### Navigation — Bottom Bar (Mobile ≤ 640px)
- Same 6 tabs anchored to the bottom of the screen
- `border-radius: 1rem 1rem 0 0` for a card-lift effect
- Same selected highlight as desktop pill

### Hero Section (Board Home)
- Full-viewport cinematic carousel that auto-rotates every 15 seconds
- Background: Movie/show image fills full width including behind the nav pill
- Gradient: Left-side dark (for text legibility) + bottom-to-transparent fade
- Content: Logo or title, year, runtime, IMDb badge, description, Watch button
- Navigation: L/R arrow buttons (appear on hover), dot indicator bar
- Mobile: background image fixed to cover full screen including the notch

### Catalog Rows
- Horizontal scroll rows below the hero
- Poster / landscape / square card shapes depending on content type
- CanonTake badge shown inline on hero items

### Buttons
- Primary hero button: Neon cyan background, black text, cyan outer glow
- Secondary buttons (glass): `rgba(255,255,255,0.12)` frosted background, cyan border on hover
- All buttons: `border-radius: 12px`, smooth scale + glow on hover

---

## 5. Known Issues & Current Fixes

### ✅ Hero Full-Bleed (Desktop Left Side)
- **Issue**: Hero background stopped before the vertical nav pill due to `overflow-x` CSS clipping computed from `overflow-y: auto` on the scroll container.
- **Fix implemented**: `overflow-x: clip; overflow-clip-margin: calc(var(--vertical-nav-bar-size) + 2.5rem)` on `.board-content` allows the hero's negative-margin to extend left to x=0 (viewport left edge). Works on Chrome/Firefox/Safari 16+.
- **Remaining**: On very old Safari (< 16), `overflow-clip-margin` is not supported — the dead space will remain. Consider a fallback.

### ✅ Hero Background Notch (Mobile)
- **Issue**: On iOS/Android with a notch, the hero image started below the status bar area, leaving a dark gap.
- **Fix implemented**: On mobile (≤ 640px), the `.hero-background` and `.hero-gradient` use `position: fixed; top: 0; width: 100vw; height: 100dvh` — they escape the `overflow-y: auto` scroll clipping and cover the full screen including behind the notch. Works with `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style: black-translucent` in index.html.
- **Note**: The background stays fixed (parallax-like) while hero content scrolls. Rows cover it with their dark background.

### ✅ YouTube Trailer Button Removed
- The hero's "TRAILER" button (which linked to YouTube trailers) has been removed. Only the "SHOW/WATCH" button remains. This keeps the UX fully in-app.

### ✅ Catalog Calendar Removed
- The calendar tab and all calendar-related features were removed.

### ✅ Cyan Highlight System
- Selected nav tab: Cyan background + glow — established.
- Hero primary button: Updated to neon cyan (was white).
- All buttons: `focus-visible` now shows a cyan outline ring globally.
- Button component: `outline-color` updated from gray to cyan.

---

## 6. Design Scenarios & Future Ideas

### 6a. Scroll-Linked Hero Fade (Priority: HIGH)
**Problem**: The fixed hero background stays visible while rows scroll in front (mobile). This is cool but if rows don't fully cover the background, it looks layered.
**Idea**: Use a JavaScript `IntersectionObserver` or `onScroll` to track how far the user has scrolled past the hero. Fade the hero's opacity from 1→0 as the user scrolls past the first 30% of hero height. This creates a silky Netflix-style transition.
**Implementation**: Add `heroFade` state to `Board.js`. Update via `scrollContainerRef.current.onScroll`. Apply `style={{ opacity: heroFade }}` + `pointer-events: none` on hero when faded.

### 6b. Parallax Hero Background (Priority: MEDIUM)
**Problem**: Hero looks static.  
**Idea**: Apply a subtle `transform: translateY(scrollTop * 0.3)` to the hero background as the user scrolls. The image scrolls at 30% of normal speed creating depth. Can be done with either `position: fixed` (on mobile) or with JS transform on desktop.

### 6c. Glassmorphic Row Section Headers (Priority: MEDIUM)
**Problem**: Row titles ("Continue Watching", "Movies", etc.) look generic.
**Idea**: Give each row's title bar a subtle glass-pill treatment — semi-transparent background with a left-border in the accent cyan color. Example: `border-left: 3px solid var(--primary-accent-color); background: rgba(255,255,255,0.04); border-radius: 0 8px 8px 0; padding-left: 0.75rem`.

### 6d. Animated "Now Playing" Indicator (Priority: LOW)
**Idea**: When a Continue Watching item is hovered, show a subtle equalizer animation (3 bars pulsing up/down in cyan). Indicates this item has progress.

### 6e. Card Hover Preview (Priority: LOW)
**Idea**: On desktop, hovering a MetaItem for 1 second shows a compact preview card with the title, year, genre, IMDb score, and a "Watch" button. Similar to Netflix's hover card. Use a CSS `delay` + `opacity` transition.

### 6f. Responsive Grid for Rows (Priority: MEDIUM)
**Problem**: On 640px to 1000px (tablets / small laptops), the hero and rows feel cramped because they use the same layout as desktop (nav on left, content on right).  
**Idea**: Add a dedicated "medium-phone" breakpoint at `~640-900px` where the layout adjusts:
- Nav pill stays on left but is slightly smaller
- Hero uses tighter padding (currently uses desktop padding)
- Row cards get larger touch targets

### 6g. Theme Toggle: Dark / Ultra-Dark (Priority: LOW)
**Idea**: Allow users to toggle between the current `#0c0c0c` charcoal and a true AMOLED black `#000000`. OLED screens benefit from true black (lower battery, better contrast). Could be a Settings toggle.

### 6h. Animated Hero Dot Indicators (Priority: LOW)  
**Current state**: Dots use a pill/stretched animation on `hero-dot-active`. 
**Idea**: Add a CSS progress animation to the active dot — it "fills" over 15 seconds (the auto-rotate interval) to show time remaining before the next slide. The dot's width animates from `0.5rem` → `1.5rem` over 15s, then snaps back.

### 6i. Search Bar Glow (Priority: MEDIUM)
**Idea**: When the search input is focused, add a soft cyan glow to the input's border: `box-shadow: 0 0 0 2px var(--primary-accent-color), 0 0 16px rgba(0,240,255,0.2)`. This extends the highlight system to the search bar.

### 6j. Contextual Color Palette from Hero Image (Priority: HIGH — WOW FACTOR)
**Idea**: When the hero changes slide, extract the dominant color from the hero background image using `canvas` + `getImageData()`. Temporarily shift the UI accent color to a tint of the movie's color palette. The nav glow, button, and dots shift to match the content. Revert after leaving the hero.  
**Files**: `HeroShelf.js` — add canvas sampling, dispatch to a React context or CSS variable update.

---

## 7. Responsive Breakpoints

| Name | Max Width | Layout |
|---|---|---|
| Desktop | > 640px | Vertical nav pill left, hero full-height |
| Mobile | ≤ 640px | Nav bar at bottom, hero height `clamp(24rem, 56vh, 34rem)` |
| `@xsmall` | ≤ 1000px | Hero height 24rem, narrower content |
| `@small` | ≤ 1300px | Hero height 22rem |
| `@medium` | ≤ 1600px | Hero height 28rem |

---

## 8. Files to Know

| File | Purpose |
|---|---|
| `src/App/caught-in-4k-theme.less` | Brand color variables |
| `src/App/styles.less` | Global resets, body/html styles |
| `src/routes/Board/HeroShelf/HeroShelf.js` | Hero carousel logic |
| `src/routes/Board/HeroShelf/styles.less` | Hero visual styles |
| `src/routes/Board/styles.less` | Board layout, scroll container |
| `src/components/NavBar/VerticalNavBar/NavTabButton/styles.less` | Nav tab highlight |
| `src/components/MainNavBars/MainNavBars.less` | Nav layout (desktop/mobile) |
| `src/components/Button/Button.less` | Global button styles |

---

*Last updated: March 2026*
