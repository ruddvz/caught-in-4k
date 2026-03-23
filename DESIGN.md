# Caught in 4K — Design System v2 (Dashboard Redesign)

> Living design system document for the widget-based streaming dashboard.
> This entirely replaces the original "Cinematic Glass" aesthetic.

---

## 1. Design Identity

| Attribute | Value |
|---|---|
| **Form Factor** | Application Dashboard |
| **Aesthetic** | Soft Neumorphic / Matte Slate — no hard edges, no glowing glass borders |
| **Concept** | "Widgetized Streaming" — content is broken into distinct high-radius structural cards |
| **Inspirations** | Premium Dribbble concept layouts, Modern SaaS dashboards |

---

## 2. Design Tokens

### 2a. Color Palette (Matte Slate)

| Token | Value | Usage |
|---|---|---|
| `--bg-body` | `#1e2029` (Deep Slate Blue) | The absolute base background layer of the application. |
| `--bg-surface-1` | `#2a2c38` (Lighter Slate) | Default background for large widget cards, sidebars, and rows. |
| `--bg-surface-2` | `#3b3e4f` (Mid Slate) | Elevated elements inside cards (e.g., inner buttons, search bars). |
| `--accent-primary` | `#ffffff` (Pure White) | For High-contrast primary action pills (like "Watch" toggles). |
| `--accent-secondary` | `#ff4d4f` (Soft Red) | Badges, warnings, secondary action highlights. |
| `--accent-tertiary` | `#ffd043` (Star Yellow) | Ratings, stars, IMDb tags. |
| `--text-primary` | `#f8f9fa` | All main headings and primary body text. |
| `--text-secondary` | `#9ca3af` | Subtitles, duration strings, disabled states. |

### 2b. Radii & Shadows

| Token | Value | Usage |
|---|---|---|
| `--radius-card` | `32px` (`2rem`) | Standard for all large widget panels, hero banners, and category carousels. |
| `--radius-pill` | `999px` | For the top navigation bar, category filter buttons, and standard CTAs. |
| `--radius-avatar` | `16px` | For cast/crew images (squircle look) instead of full circles. |
| `--shadow-soft` | `0 16px 32px rgba(0,0,0,0.2)` | Applied to all major widget cards to create depth without neon glowing borders. |

---

## 3. Typography System

**Font:** System sans-serif or `Inter` / `Outfit` depending on final load.

| Role | Properties |
|---|---|
| Main Titles | `24px` to `36px`, Weight: `700`, tight letter-spacing. |
| Card Headings | `18px` to `22px`, Weight: `600`. |
| Meta Text | `12px` to `14px`, Weight: `400` or `500`, Color: `--text-secondary`. |
| Nav/Pill Labels | `14px`, Weight: `500`. |

---

## 4. Component Layouts

### 4a. Top Navigation (Replaces Sidebar)
- **Position:** Top of the screen, full width minus padding.
- **Layout:** Flex row, `justify-content: space-between`, `align-items: center`.
- **Left:** Brand Logo ("Flix.id" / "Caught in 4k").
- **Center Pill:** `background: var(--bg-surface-1)`, `border-radius: 999px`. It must contain the **6 original legacy navigation icons** (including Search and Add-ons) laid out horizontally as clickable tabs/icons.
- **Right Cluster:** Contains the **Fullscreen (Zoom) toggle button** on the left and the **User profile** circle on the right.
- **Responsiveness (CRITICAL):** Must be perfectly mobile-friendly (e.g., iPhone web app). If the screen is too narrow, the center pill and right cluster must adapt (scale down, reduce paddings, or use a mobile-friendly overflow/bottom menu) ensuring absolutely nothing gets cut off or clipped. Touch targets must remain accessible.

### 4b. Hero Banners
- **Layout:** Horizontal scroll container instead of edge-to-edge absolute backgrounds.
- **Cards:** Huge `32px` rounded cards featuring movie artwork as a background image.
- **Content:** Headline, subtitle, and primary `[▶ Play]` pill button are nested *inside* the card, left-aligned, overlapping the artwork safely.

### 4c. Category Filters Row
- **Layout:** Horizontal flex row of pills.
- **Style:** `background: var(--bg-surface-1)`. When selected/active, the pill uses an accent color or pure white bg with dark text. Includes a small icon + label (e.g., `[🔥 Trending]`).

### 4d. Title Grid (Discover/Board)
- **Layout:** CSS Grid.
- **Card Structure:** 
  1. Top: Vertical poster image, rounded corners.
  2. Bottom: Text sits *outside* the image below it. Title is primary text, accompanied by a star rating and year (e.g., `⭐ 7.8 | 2023`).

### 4e. Movie / Series Detail View (Widget Dashboard)
Instead of a single scrolling list, the details page is broken into distinct visual blocks:
- **Left Hero Widget:** Very large vertical poster. Includes main Title, genres, and two pill buttons (`[Watch]` and `[+ Add to watchlist]`).
- **Top Center Widget:** "Recommended Movies" horizontal scroll list.
- **Middle Center Widget:** "Reviews" — features a radial half-circle progress dial showing the rating (e.g. 7.8/10), with Rotten Tomatoes/IMDb chips underneath.
- **Right Column widgets:** 
  1. Mini playing/trailer video card.
  2. "Cast" widget: a row of actors with squircle portraits.
  3. "Menu" side-widget: Quick access settings/account links right on the details page.

---

## 5. Animation Directives

- **Ditch the Apple TV scale hover:** No extreme 3D twisting hooks. 
- **Subtle Lift:** Hovering a card gently shifts `transform: translateY(-4px)` and increases the opacity of its soft drop-shadow.
- **Pill Toggles:** Clicking a category pill smoothly transitions the background color via standard CSS `transition: background 0.3s ease`.

---

## 6. Implementation Status & To-Do List (Handoff)

### ✅ What is Completed:
1. **Top Navigation (Replaces Sidebar):** Fully implemented. It has the horizontal pill with legacy icons, responsive zoom, and profile buttons (`person-outline` & `maximize` icons). Verified mobile-responsive.
2. **Matte Slate / Drop Shadow Overhaul:** Removed neon green selections and replaced them with `rgba(0,0,0,0.5)` deep shadows and floating widget glassmorphism on the main elements.
3. **Hero Shelf Button Glows:** Fixed action-button hover shadow clipping so the glows properly diffuse horizontally and vertically without being artificially cropped.
4. **Consolidated Meta Details View:** The movie/series details widgets are consolidated horizontally on larger screens. Fixed wrapped links that were being accidentally clipped. 
5. **Board Page Carousels (Fixed sizes!):** 
   - *Previous Issue:* Carousels were weirdly sized on the board page because they relied on CSS flexing against empty placeholders while being limited by `nth-child` breakpoints.
   - *Fix Implemented:* We ripped out the `nth-child` breakpoints from `Board/styles.less` and introduced standard horizontal scrollable carousels (`overflow-x: auto`) for `MetaRow`. Item widths are now locked via `calc(100vw / X)` rather than squishing/expanding depending on window breakpoints or array item count. You should no longer see different sizes of carousels.

### 📝 To-Do List for the Next Agent:
1. **Validate Empty Placeholders in Discover (If any):** Now that `MetaRow` uses `overflow-x: auto` and no longer pads empty objects for CSS flex mapping, check the `Discover` and `Search` screens to ensure their grid views (`MetaItem` map rendering) are laying out properly and not scrolling horizontally by accident. `Discover` uses the grid format, not `MetaRow`, but confirm just to be safe.
2. **Hero Banners Aspect Ratio Check:** In `HeroShelf` components, make sure the text sits fully *inside* the rounded banner card structure accurately on mobile and tablet without bleeding or wrapping awkwardly.
3. **Category Pills cleanup:** Ensure the "Trending / Action..." filters are indeed completely removed from the Board if requested, OR if the user re-adds them, format them as horizontal pill filters. (Current implementation removed them from Board rendering as per previous request, but verify user intent).
4. **Ratings and Widgets on MetaPreview Detail:** Complete the "Reviews dial gauge visualization", Rotten Tomatoes/IMDb chips, and Ensure "Cast & Crew" uses the rounded Squircle avatar shapes natively. 
5. **"Right Side Menu" on Detail View:** Re-arrange the Meta details so there is a clean distinction between the left hero/poster, the middle body text, and a proper widget column on the exact right side for Mini-Trailer, Cast, and Menu.

**General instructions to next UI Agent:**
- When updating anything, strictly open the corresponding `.LESS` files and review `#app` hierarchies.
- The theme runs deeply. If you insert a background color, ensure it's `var(--bg-surface-x)` and never `#000` or `#fff` straight up. Always use high radii (`var(--radius-card)` and `var(--radius-pill)`).
