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
