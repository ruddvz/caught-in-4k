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
- **Previous fix**: Used `position: fixed` on `.hero-background` and `.hero-gradient` to escape scroll clipping.
- **Current fix**: Reverted to `position: absolute` with `width: 100%; height: 100%` — this keeps the hero contained within its section and prevents it from bleeding over catalog rows below. The fixed approach caused the hero background to cover the entire viewport.

### ✅ YouTube Trailer Button Restored
- The hero's "TRAILER" button (which links to YouTube trailers via `item.trailerStreams`) has been restored as a secondary glass button next to the primary "SHOW" button. It only renders when a trailer stream is available for the current hero item.

### ✅ Catalog Calendar Removed
- The calendar tab and all calendar-related features were removed.

### ✅ Cyan Highlight System
- Selected nav tab: Cyan background + glow — established.
- Hero primary button: Updated to neon cyan (was white).
- All buttons: `focus-visible` now shows a cyan outline ring globally.
- Button component: `outline-color` updated from gray to cyan.

---

## 6. Design Scenarios & Future Ideas

### ~~6a. Scroll-Linked Hero Fade~~ ✅ IMPLEMENTED
**Implemented**: Hero fades from opacity 1→0 as user scrolls past 30%–80% of hero height. Uses debounced scroll handler in `Board.js` with `heroOpacity` state applied to wrapper div.

### 6b. Parallax Hero Background (Priority: MEDIUM)
**Problem**: Hero looks static.  
**Idea**: Apply a subtle `transform: translateY(scrollTop * 0.3)` to the hero background as the user scrolls. The image scrolls at 30% of normal speed creating depth. Can be done with either `position: fixed` (on mobile) or with JS transform on desktop.

### ~~6c. Glassmorphic Row Section Headers~~ ✅ IMPLEMENTED
**Implemented**: Row title containers now have `border-left: 3px solid var(--primary-accent-color)`, `background: rgba(255,255,255,0.04)`, `border-radius: 0 8px 8px 0`, and left padding. Font size uses `clamp()` for fluid scaling.

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

### ~~6i. Search Bar Glow~~ ✅ IMPLEMENTED
**Implemented**: TextInput now has `:focus` styles with `box-shadow: 0 0 0 2px var(--primary-accent-color), 0 0 16px rgba(0,240,255,0.2)` and `border-color` update.

### 6j. Contextual Color Palette from Hero Image (Priority: HIGH — WOW FACTOR)
**Idea**: When the hero changes slide, extract the dominant color from the hero background image using `canvas` + `getImageData()`. Temporarily shift the UI accent color to a tint of the movie's color palette. The nav glow, button, and dots shift to match the content. Revert after leaving the hero.  
**Files**: `HeroShelf.js` — add canvas sampling, dispatch to a React context or CSS variable update.

### ~~6k. Streaming Server Toast Redesign~~ ✅ IMPLEMENTED
**Implemented**: Warning container restyled as frosted glass pill with `backdrop-filter: blur(20px)`, `border-radius: 999px`, accent-colored Install CTA, and `slideUpToast` animation. Mobile layout uses rounded corners.

### ~~6l. Hero Carousel Progress Bar~~ ✅ IMPLEMENTED
**Implemented**: 2px progress bar at bottom of hero with `@keyframes heroProgressFill` animation over 15s. Resets via React `key={currentIndex}` on the fill element. Uses accent color with cyan glow.

### ~~6m. Content Card Skeleton Loading~~ ✅ IMPLEMENTED
**Implemented**: MetaRowPlaceholder poster and title skeletons now use `background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%)` with `@keyframes shimmer` animation at 1.5s interval.

### 6n. Canon Take Box Animation (Priority: LOW)
**Problem**: The Canon Take box on the hero appears instantly, which feels abrupt.
**Idea**: Animate it in with a slide-up + fade: `transform: translateY(10px); opacity: 0` → `transform: translateY(0); opacity: 1` with a 300ms ease transition, triggered when the hero slide is active.

### ~~6o. "Continue Watching" Progress Bars~~ ✅ IMPLEMENTED
**Implemented**: Progress bar in MetaItem restyled — 3px height, positioned at card bottom (0.5rem inset), uses `var(--primary-accent-color)` with `box-shadow: 0 0 6px rgba(0,240,255,0.4)` glow. Dark track uses 15% white opacity.

### ~~6p. Mobile Swipe Gestures for Hero~~ ✅ IMPLEMENTED
**Implemented**: Touch event handlers (`onTouchStart`/`onTouchEnd`) on hero container. Tracks X delta; if > 50px, triggers `goToNext` or `goToPrev`. No library needed.

### ~~6q. Micro-Interaction: Button Haptic Press Effect~~ ✅ IMPLEMENTED
**Implemented**: Button component now has `&:active { transform: scale(0.97); transition: transform 50ms ease; }` for physical press feel.

### ~~6r. Adaptive Font Sizing with clamp()~~ ✅ IMPLEMENTED
**Implemented**: Hero title uses `clamp(1.3rem, 4vw, 4rem)`, hero description uses `clamp(0.9rem, 1.2vw, 1.15rem)`, row headers use `clamp(1.2rem, 1.8vw, 1.6rem)`. Smooth scaling without media query jumps.

### 6s. Nav Pill Collapse to Icons-Only on Scroll (Priority: LOW)
**Problem**: The vertical nav pill takes up horizontal space on narrower desktops.
**Idea**: When the user scrolls down past the hero, the nav pill transitions from showing icons + labels to icons only (collapsed mode). On hover, it expands back. This gives more room for content. Use a CSS transition on width + text opacity.

---

## 7. Responsive Breakpoints

| Name | Max Width | Layout |
|---|---|---|
| Desktop | > 1000px | Vertical nav pill left, hero full-height |
| Tablet / `@xsmall` | 641px–1000px | Hero height 24rem, narrower content |
| Mobile / `@minimum` | ≤ 640px | Nav bar at bottom, hero height `clamp(24rem, 56vh, 34rem)` |

---

## 8. Design Priority Roadmap

| Priority | Item | Impact |
|---|---|---|
| ~~**HIGH**~~ | ~~6k. Streaming server toast redesign~~ | ✅ IMPLEMENTED |
| ~~**HIGH**~~ | ~~6o. Continue Watching progress bars~~ | ✅ IMPLEMENTED |
| **HIGH** | 6j. Contextual color palette from hero | Wow factor, differentiator |
| ~~**HIGH**~~ | ~~6a. Scroll-linked hero fade~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6l. Hero carousel progress bar~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6m. Skeleton loading cards~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6p. Mobile swipe gestures~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6r. Adaptive font sizing~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6c. Glassmorphic row headers~~ | ✅ IMPLEMENTED |
| ~~**MEDIUM**~~ | ~~6i. Search bar glow~~ | ✅ IMPLEMENTED |
| **MEDIUM** | 6f. Responsive grid for tablets | Better mid-size screen experience |
| **LOW** | 6b. Parallax hero background | Subtle depth effect |
| **LOW** | 6n. Canon Take box animation | Polish |
| ~~**LOW**~~ | ~~6q. Button haptic press effect~~ | ✅ IMPLEMENTED |
| **LOW** | 6s. Nav pill collapse on scroll | Space optimization |
| **LOW** | 6d. Animated "Now Playing" indicator | Fun detail |
| **LOW** | 6e. Card hover preview | Netflix-style, complex to implement |
| **LOW** | 6g. Theme toggle: Dark / Ultra-Dark | Niche OLED benefit |
| **LOW** | 6h. Animated hero dot indicators | Minor polish |
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
