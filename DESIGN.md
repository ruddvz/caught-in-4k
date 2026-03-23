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
- **Layout:** Edge-to-edge full width background banners.
- **Cards:** Huge full-bleed backgrounds sliding horizontally. No border radius on the outer container, sitting flush against the screen edges.
- **Content:** Headline, subtitle, and primary `[▶ Play]` pill button are left-aligned inside the safe-area bounds over the artwork.

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
2. **Bottom Mobile Nav Pill:** Centered bottom-pill layout implemented with icons AND text labels (strictly ALL CAPS). Fits screen cleanly on mobile.
3. **Discover Mobile Layout:** Restored the horizontal carousel of "Category Pills" on mobile Discover instead of completely hiding them behind a filter button.
4. **Hero Banners Edge-To-Edge:** HeroShelf was reverted to edge-to-edge full size layout for maximum cinematic effect, seamlessly integrating above the board carousels.
5. **Board Page Carousels (Fixed sizes!):** MetaRow placeholder font-sizes and widths were aligned with normal items. Universal `margin-bottom: 2.5rem` on `.board-row` fixes spacing inconsistencies between carousels.

### 📝 To-Do List for the Next Agent:
1. **Consolidate Safe Area Offsets (Suggesion):** The `calc(env(safe-area-inset-top, 0px) + xrem)` code is manually duplicated across `.route-library`, `.route-settings`, etc. in `MainNavBars.less`. Consolidate these into a clean mobile-spacing mixin for better maintainability.
2. **Settings/Addon Pages Alignment:** Check `Addons` and `Settings` to ensure they are using the new Matte Slate bg classes and following the Dashboard card logic, as currently they still sit below the top nav.
3. **Hero Banners Aspect Ratio Check:** In `HeroShelf` components, verify text sits correctly within the edge-to-edge padding across ultra-wide desktop monitors without wrapping too far out of bounds.
4. **Ratings and Widgets on MetaPreview Detail:** Complete the "Reviews dial gauge visualization", Rotten Tomatoes/IMDb chips, and Ensure "Cast & Crew" uses the rounded Squircle avatar shapes natively. 
5. **"Right Side Menu" on Detail View:** Re-arrange the Meta details so there is a clean distinction between the left hero/poster, the middle body text, and a proper widget column on the exact right side for Mini-Trailer, Cast, and Menu.

**General instructions to next UI Agent:**
- When updating anything, strictly open the corresponding `.LESS` files and review `#app` hierarchies.
- The theme runs deeply. If you insert a background color, ensure it's `var(--bg-surface-x)` and never `#000` or `#fff` straight up. Always use high radii (`var(--radius-card)` and `var(--radius-pill)`).
