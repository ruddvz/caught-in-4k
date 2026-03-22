# Caught in 4K — Design System

> Living design system document. Covers brand identity, design tokens, component specs, page architecture, and improvement backlog.
> Update this whenever the UI evolves.

---

## Table of Contents

1. [Design Identity](#1-design-identity)
2. [Design Tokens](#2-design-tokens)
3. [Typography System](#3-typography-system)
4. [Depth & Layering Model](#4-depth--layering-model)
5. [Component Catalog](#5-component-catalog)
6. [Page Architecture](#6-page-architecture)
7. [Responsive System](#7-responsive-system)
8. [Motion & Animation Language](#8-motion--animation-language)
9. [Known Issues & Fixes](#9-known-issues--fixes)
10. [Implemented Improvements](#10-implemented-improvements)
11. [Design Backlog — Pending Ideas](#11-design-backlog--pending-ideas)
12. [Design Backlog — New Ideas (Round 2)](#12-design-backlog--new-ideas-round-2)
13. [Priority Roadmap](#13-priority-roadmap)
14. [File Map](#14-file-map)

---

## 1. Design Identity

| Attribute | Value |
|---|---|
| **Brand** | Caught in 4K |
| **Tagline** | Premium entertainment streaming |
| **Aesthetic** | Cinematic dark-glass — deep charcoal backgrounds, neon cyan accents, liquid-glass panels |
| **Tone** | Modern, premium, Gen Z-native. Clean hierarchy, cinematic drama |
| **Inspirations** | Apple TV+, Netflix, Disney+ (dark mode), Spotify (glass nav) |

**Design Principles**:
1. **Cinema First** — Every screen should feel like a movie poster. Hero images dominate, UI stays out of the way.
2. **Glow Over Borders** — Use light emission (box-shadows, glows) to define interactive elements instead of hard borders.
3. **Glass Depth** — Layer frosted glass panels to create z-depth without flat color blocks.
4. **Fluid Motion** — Every state change should animate. No instant swaps.
5. **Cyan Identity** — The neon cyan `rgb(0, 240, 255)` is the brand heartbeat. It appears on every interactive surface.

---

## 2. Design Tokens

### 2a. Color Palette

```
┌──────────────────────────────────────────────────────────────────┐
│  PRIMARY ACCENT          BACKGROUNDS              SURFACES       │
│  ┌────────┐              ┌────────┐               ┌────────┐    │
│  │ ██████ │ #00F0FF      │ ██████ │ #0c0c0c       │ ██████ │    │
│  │ ██████ │ Neon Cyan    │ ██████ │ Charcoal      │ ██████ │    │
│  └────────┘              └────────┘ Primary BG     └────────┘    │
│                          ┌────────┐ rgba(255,255,   ┌────────┐  │
│  SECONDARY ACCENT        │ ██████ │  255,0.05)      │ ██████ │  │
│  ┌────────┐              │ ██████ │ #121212         │ ██████ │  │
│  │ ██████ │ #8c8c8c      └────────┘ Secondary BG    └────────┘  │
│  │ ██████ │ Grey Mono                               rgba(255,    │
│  └────────┘              ┌────────┐                 255,255,     │
│                          │ ██████ │ #1a1a1a         0.12)        │
│  SUCCESS                 │ ██████ │ Modal BG        Glass fill   │
│  ┌────────┐              └────────┘                              │
│  │ ██████ │ #22b365                                              │
│  │ ██████ │ Selection                                            │
│  └────────┘                                                      │
│                                                                  │
│  UTILITY COLORS                                                  │
│  IMDb Gold: #f5c518  │  Error Red: ~#e74c3c  │  Blue: #1245a6   │
└──────────────────────────────────────────────────────────────────┘
```

| Token | Value | Usage |
|---|---|---|
| `--primary-accent-color` | `rgb(0, 240, 255)` | Active tabs, primary buttons, focus rings, glow effects, progress bars |
| `--secondary-accent-color` | `rgba(140, 140, 140, 1)` | Muted interactive states, secondary icons |
| `--primary-background-color` | `#0c0c0c` | Body, page backgrounds, scroll containers |
| `--secondary-background-color` | `#121212` | Panels, modals background tint |
| `--modal-background-color` | `#1a1a1a` | Modal overlays, dropdown backgrounds |
| `--primary-foreground-color` | `rgba(255,255,255,0.9)` | All body text |
| `--overlay-color` | `rgba(255, 255, 255, 0.05)` | Section separators, subtle dividers |
| `--outer-glow` | `0 0 20px rgba(0,240,255,0.35)` | Primary cyan bloom effect |
| `--selection-green` | `#22b365` | Card selection borders, success indicators |
| `--color-imdb` | `#f5c518` | IMDb badge background |

### 2b. Gradient Tokens

| Token | Value | Usage |
|---|---|---|
| `--gradient-blue` | `linear-gradient(225deg, rgba(0,240,255,0.6) 0%, transparent 50%)` | Cyan corner burst |
| `--gradient-violet` | `linear-gradient(135deg, rgba(80,80,80,0.6) 0%, transparent 50%)` | Neutral corner burst |
| `--gradient-orange` | `linear-gradient(45deg, rgba(120,120,120,0.6) 0%, transparent 50%)` | Neutral secondary |
| `--gradient-pink` | `linear-gradient(315deg, rgba(160,160,160,0.6) 0%, transparent 50%)` | Neutral tertiary |

### 2c. Shadow Tokens

| Name | Value | Usage |
|---|---|---|
| Shadow — Glow | `0 0 20px rgba(0,240,255,0.35)` | Primary CTA halo |
| Shadow — Glow Intense | `0 0 35px rgba(0,240,255,0.6)` | Button hover amplified glow |
| Shadow — Card Drop | `0 24px 48px rgba(0,0,0,0.9)` | Card hover lift |
| Shadow — Toast | `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)` | Floating toasts |
| Shadow — Focus Ring | `0 0 0 4px rgba(0,240,255,0.15)` | Focus-visible halo |
| Shadow — Progress Glow | `0 0 6px rgba(0,240,255,0.4)` | Progress bar glow |

### 2d. Spacing & Radius

| Token | Value | Usage |
|---|---|---|
| `--border-radius` | `0.75rem` (12px) | Default corner radius for cards, inputs |
| Pill radius | `999px` | Nav pill, toast, badges |
| Card padding | `0.5rem` – `1rem` | Internal card padding |
| Section gap | `1rem` – `2rem` | Space between catalog rows |

---

## 3. Typography System

**Primary Font**: `PlusJakartaSans` (bundled in `assets/fonts/`)  
**Fallback**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif`

| Role | Size | Weight | Extra |
|---|---|---|---|
| Hero Title | `clamp(1.3rem, 4vw, 4rem)` | 800 | `text-shadow: 0 4px 16px rgba(0,0,0,0.9)`, `letter-spacing: -0.02em` |
| Hero Description | `clamp(0.9rem, 1.2vw, 1.15rem)` | 400 | `-webkit-line-clamp: 3`, soft text shadow |
| Row Header | `clamp(1.2rem, 1.8vw, 1.6rem)` | 500 | Left cyan accent border |
| Nav Label | `0.75rem` | 500 | Hidden by default, shows on hover/selected |
| Body Text | `1rem` – `1.15rem` | 400 | Primary foreground color |
| Button Label | `0.85rem` – `1rem` | 600 | Uppercase or sentence case depending on context |
| Badge / Chip | `0.7rem` – `0.8rem` | 600 | All-caps, tight letter-spacing |
| Settings Label | `1rem` | 500 | 50% width flex layout |

**Text Rendering**:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
text-rendering: optimizeLegibility;
```

---

## 4. Depth & Layering Model

The UI uses a cinematic depth system. Deeper layers are darker, closer layers use glass + glow.

```
Z-DEPTH STACK (back → front)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ Layer 0 — Body                                    │
│   #0c0c0c solid background                        │
│                                                   │
│  ┌───────────────────────────────────────────┐    │
│  │ Layer 1 — Hero Background                 │    │
│  │   Full-bleed image, absolute positioned   │    │
│  │   Gradient overlays for text readability  │    │
│  │                                           │    │
│  │  ┌──────────────────────────────────┐     │    │
│  │  │ Layer 2 — Content Surface        │     │    │
│  │  │   Scroll container with rows     │     │    │
│  │  │   Glassmorphic row headers       │     │    │
│  │  │                                  │     │    │
│  │  │  ┌──────────────────────────┐    │     │    │
│  │  │  │ Layer 3 — Cards          │    │     │    │
│  │  │  │   MetaItem with poster   │    │     │    │
│  │  │  │   Hover: lift + glow     │    │     │    │
│  │  │  └──────────────────────────┘    │     │    │
│  │  └──────────────────────────────────┘     │    │
│  └───────────────────────────────────────────┘    │
│                                                   │
│  ┌──────────────────────┐                         │
│  │ Layer 4 — Nav Pill   │ (fixed, z-index high)   │
│  │   backdrop-filter:   │                         │
│  │   blur(24px)         │                         │
│  └──────────────────────┘                         │
│                                                   │
│  ┌────────────────────────────────────────────┐   │
│  │ Layer 5 — Overlays (modals, toasts, menus) │   │
│  │   backdrop-filter: blur(20px)              │   │
│  │   Highest z-index, dark scrim behind       │   │
│  └────────────────────────────────────────────┘   │
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Glass Effect Tiers

| Tier | Blur | Background | Border | Use |
|---|---|---|---|---|
| Light Glass | `blur(10px)` | `rgba(255,255,255,0.05)` | `1px solid rgba(255,255,255,0.08)` | Secondary buttons, badges |
| Medium Glass | `blur(12px)` | `rgba(255,255,255,0.06)` | `1px solid rgba(255,255,255,0.1)` | Nav pill, settings sections |
| Heavy Glass | `blur(20px) saturate(150%)` | `rgba(255,255,255,0.08)` | `1px solid rgba(255,255,255,0.12)` | Toasts, modals, overlays |

**Note**: The theme defines a `.frosted-glass` utility class (`blur(12px)`, `border-radius: 24px`, `border: 1px solid rgba(255,255,255,0.1)`) that is currently **underutilized** — only the nav pill and toast actively use glass effects.

---

## 5. Component Catalog

### 5a. Navigation — Vertical Pill (Desktop)

```
┌──────────┐
│  ⊞ Board │  ← Selected: cyan bg + glow ring
│  🔍 Search│
│  🧭 Disc. │
│  📚 Lib.  │
│  🧩 Add.  │
│  ⚙ Set.  │
└──────────┘
```

- **Container**: `position: fixed`, `top: 50%`, `left: 0.5rem`, `border-radius: 999px`
- **Blur**: `backdrop-filter: blur(24px)`
- **Selected Tab**: Cyan background tint `rgba(0,240,255,0.12)`, glow `box-shadow: 0 0 14px rgba(0,240,255,0.18)`, border `1px solid rgba(255,255,255,0.2)`
- **Icon opacity**: Default `0.45` → Selected/hover `1.0`
- **Label opacity**: Default `0` → Shows on hover/selected

### 5b. Navigation — Bottom Bar (Mobile ≤ 640px)

- Position: `fixed; bottom: 0`
- `border-radius: 1rem 1rem 0 0` for card-lift effect
- Same 6 tabs, icon + label layout
- Safe area padding for notch devices

### 5c. Hero Section (Board Home)

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  ░░░░░░░░░░░░░░░░ BACKGROUND IMAGE ░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░ (position: absolute, cover) ░░░░  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ▓ Dark Gradient ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ▓                                                   │
│  ▓  🎬 Movie Logo                                    │
│  ▓  2024  •  2h 15m  •  ⭐ 8.2 IMDb                 │
│  ▓  Description text that truncates                  │
│  ▓  at three lines maximum...                        │
│  ▓                                                   │
│  ▓  [▶ SHOW]  [▷ TRAILER]  📋 Canon Take            │
│  ▓                                                   │
│  ├─────── ● ─── ● ─── ●●●● ─── ● ──────────────────│  ← Dot indicators
│  ├═══════════════════▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░│  ← 2px progress bar
│  └──────────────────────────────────────────────────────┘
```

- **Background**: Full-viewport image, `object-fit: cover`
- **Gradients**: Left-to-right dark (text readability) + bottom-to-transparent fade
- **Auto-rotate**: 15-second interval
- **Navigation**: L/R arrow buttons (appear on hover, 50px cyan circles)
- **Progress Bar**: 2px cyan fill, 15s linear animation, resets on slide change
- **Dots**: `0.5rem` inactive → `1.5rem` active (cyan), centered below content
- **Mobile**: Touch swipe L/R (50px threshold), reduced padding
- **Height**: `max(100vh, 40rem)` desktop → `clamp(24rem, 56vh, 34rem)` mobile

### 5d. Content Cards (MetaItem)

```
┌────────────────────┐
│                    │
│   Poster Image     │  ← opacity: 0.9, scales 1.02 on hover
│   (object-fit:     │
│    cover)          │
│                    │
│     ▶ Play Icon    │  ← Appears on hover, cyan glow
│                    │
│  ✓ Watched         │  ← Top-left check badge
│    ✕ Dismiss       │  ← Top-right dismiss icon
│                    │
│ ═══════════░░░░░░░ │  ← 3px progress bar (cyan glow)
│ Title Text         │  ← Below poster on hover
└────────────────────┘
```

- **Hover**: `transform: scale(1.08)` with `cubic-bezier(0.25, 1, 0.5, 1)` — Apple TV snappy bounce
- **Glint**: `@keyframes glint` diagonal light sweep on hover (1s ease-out)
- **Selection**: `box-shadow: 0 24px 48px rgba(0,0,0,0.9), 0 0 0 3px #22b365`
- **Progress**: 3px height, accent color with `0 0 6px rgba(0,240,255,0.4)` glow
- **Skeleton**: Shimmer gradient animation (1.5s loop, `#1a1a1a → #222 → #1a1a1a`)

### 5e. Buttons

| Variant | Background | Text | Shadow | Hover |
|---|---|---|---|---|
| Primary (Hero) | `var(--primary-accent-color)` | Black | `var(--outer-glow)` | `scale(1.05)`, glow intensifies to `0.6` |
| Secondary (Glass) | `rgba(255,255,255,0.12)`, `blur(10px)` | White | None | Cyan border, slight brighten |
| All | — | — | — | Press: `scale(0.97)` at 50ms |

- **Focus**: `outline: 2px solid cyan`, `outline-offset: 2px`, `box-shadow: 0 0 0 4px rgba(0,240,255,0.15)`
- **Border-radius**: `var(--border-radius)` (12px)
- **Transition**: `transform 0.15s ease, box-shadow 0.15s ease`

### 5f. Toasts (Streaming Server Warning)

- **Style**: Frosted glass pill — `backdrop-filter: blur(20px) saturate(150%)`, `border-radius: 999px`
- **Shadow**: `0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
- **CTA**: Cyan accent border, rounded button
- **Animation**: `@keyframes slideUpToast` — slides up from `translateY(1rem)` with fade
- **Mobile**: Full-width, `border-radius: 1rem`, stacked layout

### 5g. Context Menus & Modals

- **Context Menu**: Fixed position, cyan outer glow, `background: var(--modal-background-color)`
- **Modals**: Dark scrim backdrop, centered panel, no entrance animation currently
- **Bottom Sheet**: Mobile-only drawer from bottom, handle pill at top, `max-height: 70vh`

### 5h. Row Section Headers (Glassmorphic)

- **Left border**: `3px solid var(--primary-accent-color)` cyan accent bar
- **Background**: `rgba(255,255,255,0.04)` subtle glass
- **Border-radius**: `0 8px 8px 0`
- **Font**: `clamp(1.2rem, 1.8vw, 1.6rem)`, weight 500

### 5i. Horizontal Scroll Rows

- **Scroll behavior**: CSS `overflow-x: auto`, `scroll-behavior: smooth`, `scroll-snap-type: x mandatory`
- **Edge fade**: CSS mask gradient — transparent→black→transparent at edges
- **Scrollbar**: Hidden via `-webkit-scrollbar: display: none`

---

## 6. Page Architecture

### 6a. Board (Home)

```
┌────────────────────────────────────────────────────┐
│ [Nav Pill]  │  ┌──────────── Hero Carousel ──────┐ │
│             │  │  Full-bleed cinematic hero       │ │
│  Board ←──  │  │  with fade-on-scroll            │ │
│  Search     │  │  15s auto-rotate + progress     │ │
│  Discover   │  └─────────────────────────────────┘ │
│  Library    │                                      │
│  Add-ons    │  ── Continue Watching Row ────────── │
│  Settings   │  🎬 🎬 🎬 🎬 🎬 🎬 🎬 →              │
│             │                                      │
│             │  ── Popular in Movies Row ────────── │
│             │  🎬 🎬 🎬 🎬 🎬 🎬 🎬 →              │
│             │                                      │
│             │  ── Trending Series Row ──────────── │
│             │  🎬 🎬 🎬 🎬 🎬 🎬 🎬 →              │
│             │                                      │
│             │  [Streaming Server Warning Toast]    │
└────────────────────────────────────────────────────┘
```

### 6b. MetaDetails (Title Page)

```
┌────────────────────────────────────────────────────┐
│ [Nav]  │  Background Image (blurred, dark overlay) │
│        │  ┌──────┐  Title                          │
│        │  │Poster│  Year • Runtime • Rating        │
│        │  │      │  Genre tags                     │
│        │  │      │  Description...                 │
│        │  └──────┘                                 │
│        │                                           │
│        │  ── Streams ────────────────────────────  │
│        │  [Addon 1] 1080p — stream info            │
│        │  [Addon 2] 4K — stream info               │
│        │                                           │
│        │  ── Episodes (if series) ───────────────  │
│        │  Season picker: [S1] [S2] [S3]            │
│        │  E1: Episode title                        │
│        │  E2: Episode title                        │
└────────────────────────────────────────────────────┘
```

### 6c. Settings

```
┌────────────────────────────────────────────────────┐
│ [Nav]  │  ┌─ Menu ─┐  ┌─ Content ────────────────┐│
│        │  │General ←│  │  User Profile (avatar)   ││
│        │  │Stream.  │  │  ─────────────────────   ││
│        │  │Player   │  │  Interface Language      ││
│        │  │Shortcut │  │  [English ▼]             ││
│        │  │Info     │  │  ─────────────────────   ││
│        │  │         │  │  Streaming Server URL    ││
│        │  │         │  │  [http://... ]           ││
│        │  └─────────┘  └─────────────────────────┘│
└────────────────────────────────────────────────────┘
```

### 6d. Player

```
┌──────────────────────────────────────────────────────┐
│             VIDEO CONTENT (full viewport)             │
│                                                      │
│                      ▶ / ❚❚                           │
│                                                      │
│  [Back]                              [Side Drawer →] │
│  ───────────────────═════════─────── 01:23:45        │
│  [Play] [Vol] [Subs] [Audio] [Speed] [Options] [FS] │
└──────────────────────────────────────────────────────┘
```

- Seek bar: Cyan track, `brightness(130%)` on thumb, glow
- Menus (subtitles, audio, speed): Slide up from control bar

---

## 7. Responsive System

### 7a. Breakpoints

| Token | Width | Columns | Layout |
|---|---|---|---|
| `@xxsmall` | ≤ 480px | 3–4 | Bottom nav, compact hero, stacked |
| `@xsmall` | ≤ 768px | 5–6 | Bottom nav, hero `24rem` |
| `@small` | ≤ 1024px | 6–7 | Vertical nav, hero `22rem` |
| `@medium` | ≤ 1280px | 7–8 | Vertical nav, hero `28rem` |
| `@large` | ≤ 1600px | 8–9 | Full vertical nav, hero `34rem` |
| Default | > 1600px | 9–10 | Full layout, hero `max(100vh, 40rem)` |

### 7b. Progressive Disclosure (Items per Row)

```
1600px+ :  10 items visible
≤1600px :   9 items  (nth-child(n+10) hidden)
≤1280px :   8 items
≤1024px :   7 items
≤ 768px :   6 items
≤ 480px :   5 items
```

### 7c. Mobile-Specific Adaptations

- Navigation moves from left pill → bottom bar at ≤ 640px
- Hero height uses `clamp(24rem, 56vh, 34rem)` instead of full viewport
- Settings flips to `column-reverse` layout on mobile
- Bottom sheet replaces modals on narrow screens
- Touch swipe replaces prev/next arrows on hero

---

## 8. Motion & Animation Language

### 8a. Core Animations

| Animation | Duration | Easing | Trigger |
|---|---|---|---|
| Card hover scale | 150ms | `cubic-bezier(0.25, 1, 0.5, 1)` | Mouse enter |
| Card glint sweep | 1s | `ease-out` | Mouse enter |
| Button press | 50ms | `ease` | `:active` → `scale(0.97)` |
| Button hover | 150ms | `ease` | `:hover` → `scale(1.05)` |
| Hero progress fill | 15s | `linear` | Page mount / slide change |
| Shimmer loading | 1.5s | `ease-in-out` (infinite) | Skeleton visible |
| Toast slide-up | 400ms | `ease-out` | Warning appears |
| Gradient shift | 8s | `ease` (infinite) | Background decorative |
| Specular shimmer | 3s | `ease` (infinite) | Theme utility |

### 8b. Easing Principles

- **Interactive elements**: `cubic-bezier(0.25, 1, 0.5, 1)` — snappy Apple TV–style overshoot
- **Smooth transitions**: `ease` or `ease-out` — for opacity, color, blur changes
- **Linear**: Only for progress indicators and seek bars
- **Duration**: 50–150ms for micro-interactions, 300–500ms for layout transitions, 1–3s for decorative loops

### 8c. Animation Gaps (Not Yet Animated)

- ❌ No entrance animation when content rows appear
- ❌ No slide transition when hero changes (just opacity swap)
- ❌ Settings / Library cards completely static (no hover effect)
- ❌ Modals mount without entrance animation
- ❌ Nav icon transitions between states are instant
- ❌ Canon Take box appears without animation on hero
- ❌ Card skeleton → real content is a hard swap (no fade)

---

## 9. Known Issues & Fixes

### ✅ Hero Full-Bleed (Desktop Left Side)
- **Issue**: Hero background stopped before the vertical nav pill due to `overflow-x` CSS clipping.
- **Fix**: `overflow-x: clip; overflow-clip-margin: calc(var(--vertical-nav-bar-size) + 2.5rem)` on `.board-content`.
- **Caveat**: Safari < 16 doesn't support `overflow-clip-margin`.

### ✅ Hero Background Notch (Mobile)
- **Issue**: Hero image started below status bar area, leaving dark gap.
- **Fix**: Reverted to `position: absolute` with `width: 100%; height: 100%` — keeps hero contained within section.

### ✅ YouTube Trailer Button Restored
- "TRAILER" button restored as secondary glass button. Renders only when `item.trailerStreams` exists.

### ✅ Catalog Calendar Removed
- Calendar tab and all calendar-related features removed.

### ✅ Cyan Highlight System
- Selected nav tab: Cyan bg + glow.
- Hero primary button: Neon cyan.
- All buttons: `focus-visible` cyan outline ring.
- `outline-color` updated globally from gray to cyan.

---

## 10. Implemented Improvements

| ID | Name | Status | Details |
|---|---|---|---|
| 6a | Scroll-Linked Hero Fade | ✅ Done | Hero fades opacity 1→0 as user scrolls (30%–80% of hero height). Debounced scroll handler in `Board.js`. |
| 6c | Glassmorphic Row Headers | ✅ Done | Left cyan accent border, `rgba(255,255,255,0.04)` glass bg, `clamp()` fluid font. |
| 6i | Search Bar Glow | ✅ Done | `:focus` cyan glow ring + border-color shift on TextInput. |
| 6k | Streaming Server Toast | ✅ Done | Frosted glass pill, `blur(20px) saturate(150%)`, `slideUpToast` animation. |
| 6l | Hero Progress Bar | ✅ Done | 2px cyan fill, 15s linear animation, resets via React `key={currentIndex}`. |
| 6m | Skeleton Loading Shimmer | ✅ Done | Shimmer gradient on MetaRowPlaceholder (1.5s loop). |
| 6o | Continue Watching Progress Bars | ✅ Done | 3px accent color bars with glow, positioned at card bottom. |
| 6p | Mobile Swipe Gestures | ✅ Done | Touch handlers on hero, 50px threshold, no library. |
| 6q | Button Haptic Press | ✅ Done | `scale(0.97)` on `:active` at 50ms. |
| 6r | Adaptive Font Sizing | ✅ Done | `clamp()` on hero title, description, and row headers. |

---

## 11. Design Backlog — Pending Ideas (Round 1)

### 6b. Parallax Hero Background
**Priority**: MEDIUM  
**Problem**: Hero looks static and flat.  
**Solution**: Apply `transform: translateY(scrollTop * 0.3)` to hero background on scroll. Image moves at 30% speed, creating cinematic depth.  
**Files**: `Board.js` (scroll handler), `HeroShelf/styles.less`

### 6d. Animated "Now Playing" Indicator
**Priority**: LOW  
**Idea**: On hover of a Continue Watching item, show a 3-bar equalizer animation pulsing in cyan.  
**Files**: `ContinueWatchingItem/styles.less`

### 6e. Card Hover Preview (Netflix-Style)
**Priority**: LOW  
**Idea**: Hovering a MetaItem for 1s shows expanded preview card (title, year, genre, IMDb, Watch CTA). CSS `transition-delay` + `opacity`.  
**Files**: `MetaItem/styles.less`, new preview overlay component

### 6f. Responsive Tablet Grid
**Priority**: MEDIUM  
**Problem**: 640–1000px screens feel cramped — desktop layout but small viewport.  
**Solution**: Dedicated breakpoint: smaller nav pill, tighter hero padding, larger card touch targets.  
**Files**: `MainNavBars.less`, `HeroShelf/styles.less`, `Board/styles.less`

### 6g. Theme Toggle: Dark / Ultra-Dark (AMOLED)
**Priority**: LOW  
**Idea**: Settings toggle: `#0c0c0c` charcoal vs `#000000` true black. OLED screens benefit from true black.  
**Files**: `caught-in-4k-theme.less`, Settings UI

### 6h. Animated Hero Dot Indicators
**Priority**: LOW  
**Idea**: Active dot has a CSS fill animation over 15s matching the auto-rotate interval. Width animates `0.5rem → 1.5rem`.  
**Files**: `HeroShelf/styles.less`

### 6j. Contextual Color Palette from Hero Image
**Priority**: HIGH — WOW FACTOR  
**Idea**: Extract dominant color from hero image via `canvas + getImageData()`. Dynamically shift accent color (nav glow, buttons, dots) to match movie palette. Revert after leaving hero.  
**Files**: `HeroShelf.js`, CSS variable update via React context  
**Technique**: Sample 4 corners + center of hero image, find dominant hue, use `hsl()` with fixed saturation/lightness.

### 6n. Canon Take Box Entrance Animation
**Priority**: LOW  
**Idea**: Slide-up + fade: `translateY(10px); opacity: 0` → `translateY(0); opacity: 1` at 300ms ease.  
**Files**: `CanonTakeBox/styles.less`

### 6s. Nav Pill Collapse to Icons-Only
**Priority**: LOW  
**Problem**: Vertical nav pill eats horizontal space on ≤1200px desktops.  
**Solution**: On scroll past hero, nav transitions to icons-only. Hover re-expands. CSS transition on width + text opacity.  
**Files**: `VerticalNavBar/styles.less`, `Board.js` (scroll state)

---

## 12. Design Backlog — New Ideas (Round 2)

### 7a. Unified Glass System — Apply Frosted Glass to All Panels
**Priority**: HIGH  
**Problem**: The `.frosted-glass` mixin defined in the theme is barely used. Only the nav pill and toast use glass effects. Settings sections, modals, addon cards, and the Library page all use flat opaque backgrounds, creating visual inconsistency.  
**Solution**: Apply the `backdrop-filter: blur(12px)` glass treatment to:
- Settings section containers (currently just thin border separators)
- Addon cards in the Addons page
- Modal dialogs (AddonDetailsModal, EventModal)
- Library page empty state card
- MetaDetails preview sidebar on Discover page  
**Impact**: Brings visual cohesion, makes the whole app feel premium instead of just the Board page.  
**Files**: `Settings/components/Section/Section.less`, `Addons/Addon/styles.less`, `AddonDetailsModal/styles.less`, `EventModal/styles.less`, `Library/Placeholder/Placeholder.less`, `Discover/styles.less`

### 7b. Library Card Hover Effects
**Priority**: HIGH  
**Problem**: Library items (`LibItem`) have zero hover interaction — no scale, no glow, no lift. They feel dead compared to the polished Board cards. The Board uses `scale(1.08)` with a glint animation, but the Library grid is completely static.  
**Solution**: Add the same hover treatment as MetaItem cards:
- `transform: scale(1.05)` on hover with the Apple TV cubic-bezier
- Subtle drop shadow lift
- Poster brightness increase (`filter: brightness(1.1)`)
- Optional: glint sweep animation  
**Files**: `LibItem/styles.less`

### 7c. Settings Section Polish
**Priority**: HIGH  
**Problem**: The Settings page is the least polished area. Sections use a thin `border-bottom` separator, option rows are raw flex layouts, and there's no visual hierarchy between categories. No hover states on options, no glass effects, no depth.  
**Solution**:
- Give each section container a glass background with subtle border
- Add `background: rgba(255,255,255,0.03)` + `border-radius: 12px` to option rows
- Hover state: slight brightness increase on option row background
- Category headings get the same glassmorphic left-accent-bar treatment as row headers
- Settings menu buttons get a subtle active indicator (left cyan bar)  
**Files**: `Settings/Settings.less`, `Settings/components/Section/Section.less`, `Settings/components/Option/Option.less`, `Settings/components/Category/Category.less`, `Settings/Menu/Menu.less`

### 7d. Content Row Entrance Animations (Staggered Fade-In)
**Priority**: HIGH  
**Problem**: Content rows below the hero mount instantly with no visual entrance. The shimmer skeleton helps, but the transition from skeleton → real content is also instant (hard swap). Feels jarring.  
**Solution**: Each catalog row should fade-in from `translateY(20px); opacity: 0` as it enters the viewport. Use `IntersectionObserver` in React to trigger a CSS class toggle. Stagger rows by 100ms delay each.
- Bonus: When skeleton → content transition happens, crossfade (skeleton opacity → 0 while content opacity → 1 over 300ms).  
**Files**: `MetaRow/MetaRow.js` or `MetaRow/styles.less`, new `useInViewport` hook

### 7e. Hero Slide Transition (Crossfade with Directional Motion)
**Priority**: MEDIUM  
**Problem**: When the hero carousel changes slides, the background image swaps instantly. No transition between slides — it jumps. The only visual signal is the dot indicator.  
**Solution**: Crossfade the outgoing and incoming hero backgrounds over 800ms. Add subtle directional shift: the outgoing image drifts `translateX(-3%)` while the incoming drifts from `translateX(3%)`. Content (title, description, buttons) should fade out/in with a 200ms stagger.  
**Files**: `HeroShelf.js`, `HeroShelf/styles.less`

### 7f. Gradient Borders on Featured Cards
**Priority**: MEDIUM  
**Problem**: Cards use a solid green border on selection (`#22b365`). This is functional but doesn't match the cinematic glow aesthetic.  
**Solution**: Replace the solid border with a gradient border using the `background-image` + padding trick:
```css
background: linear-gradient(135deg, rgba(0,240,255,0.6), rgba(34,179,101,0.6));
/* or use border-image on hover */
```
The border shifts from cyan (top-left) to green (bottom-right) on hover/selection. Gives cards a premium Netflix-like highlight.  
**Files**: `MetaItem/styles.less`, `LibItem/styles.less`

### 7g. Modal Entrance Animation
**Priority**: MEDIUM  
**Problem**: Modals (AddonDetailsModal, EventModal, PasswordResetModal) appear instantly with no entrance animation. The backdrop scrim just pops in.  
**Solution**: 
- Backdrop: Fade opacity 0 → 1 over 250ms
- Panel: `transform: scale(0.95); opacity: 0` → `scale(1); opacity: 1` over 300ms with ease-out
- Bottom Sheet already has a handle — add `translateY(100%)` → `translateY(0)` slide-up  
**Files**: `AddonDetailsModal/styles.less`, `EventModal/styles.less`, `BottomSheet/BottomSheet.less`

### 7h. Discover Page Preview Panel Glass Treatment
**Priority**: MEDIUM  
**Problem**: On the Discover page, clicking a card shows a meta preview panel on the right side. It uses `backdrop-filter: blur(15px)` (good!) but the card grid behind it looks flat.  
**Solution**: Add subtle glass treatment to the filter bar area and the grid container. The filter chips should get a glass background similar to the nav pill tab treatment. Also: when the preview panel slides in, the grid should dim slightly (opacity 0.7) to draw focus to the detail.  
**Files**: `Discover/styles.less`, potentially `Chips/styles.less`

### 7i. Addon Card Polish
**Priority**: MEDIUM  
**Problem**: Addon cards in the Add-ons page have a basic layout with logo, info, and action buttons, but no hover interaction, no glass background, and no depth.  
**Solution**:
- Add glass background: `rgba(255,255,255,0.04)` with subtle border
- Hover: `scale(1.02)`, shadow lift, slight border glow
- Install/Uninstall button: Use the same primary/secondary button styles as hero buttons
- Addon logo: Subtle glow or rounded accent border on hover  
**Files**: `Addons/Addon/styles.less`, `AddonPlaceholder/AddonPlaceholder.less`

### 7j. Player Control Bar Glass Upgrade
**Priority**: MEDIUM  
**Problem**: The player control bar uses a gradient background (`linear-gradient(transparent, rgba(0,0,0,0.8))`). While functional, it doesn't match the glass aesthetic of the rest of the app.  
**Solution**:
- Add `backdrop-filter: blur(16px)` to the control bar container
- Replace gradient with frosted glass: `background: rgba(0,0,0,0.4)` + blur
- Seek bar thumb: Add pulsing glow effect on active drag
- Volume slider: Match seek bar cyan treatment  
**Files**: `Player/ControlBar/styles.less`, `Player/ControlBar/SeekBar/styles.less`, `Player/ControlBar/VolumeSlider/styles.less`

### 7k. Scroll-to-Top Floating Action Button
**Priority**: LOW  
**Problem**: On the Board, Library, and Discover pages, after scrolling past several rows there's no quick way to return to the hero/top. Users must scroll manually.  
**Solution**: A floating glass pill button (↑ icon) that fades in when `scrollTop > 500px`. On click, smooth-scrolls to top. Glass treatment matching the nav pill aesthetic.  
**Files**: New component `ScrollToTop.js`, Board/Library/Discover layouts

### 7l. Loading State for Primary CTA Buttons
**Priority**: LOW  
**Problem**: Hero "SHOW" and "TRAILER" buttons have no loading feedback. When clicked, there's no visual indication that something is happening.  
**Solution**: On click, the button text fades to a subtle pulsing animation (opacity 0.6 → 1 → 0.6 loop) or a small spinner replaces the text. Revert when navigation completes.  
**Files**: `Button/Button.js`, `Button/Button.less`

### 7m. IMDb Badge Redesign
**Priority**: LOW  
**Problem**: The IMDb rating badge on the hero uses a flat gold background (`#f5c518`). Functional but doesn't match the glowing neon premium aesthetic.  
**Solution**: Give the IMDb badge a subtle gradient (`linear-gradient(135deg, #f5c518, #e6a800)`) with a micro gold glow (`box-shadow: 0 0 8px rgba(245,197,24,0.3)`). On hover, brighten slightly.  
**Files**: `HeroShelf/styles.less`

### 7n. Keyboard Navigation Indicator
**Priority**: LOW  
**Problem**: While focus-visible outlines exist (cyan ring), there's no visual indicator of which section the user is navigating via keyboard. Power users and accessibility users would benefit from clearer section boundaries.  
**Solution**: When tab-navigating into a section (row, settings panel), add a brief subtle pulse animation on the section header's accent bar. The glassmorphic border brightens momentarily.  
**Files**: Global focus management, `MetaRow/styles.less`

### 7o. Next Episode Popup Polish
**Priority**: LOW  
**Problem**: The "Next Episode" popup in the player (`NextVideoPopup`) appears with basic styling. It has a poster, title, and countdown, but no glass treatment or entrance animation.  
**Solution**: 
- Add frosted glass background matching the control bar
- Slide in from right edge with `translateX(100%)` → `translateX(0)` over 400ms
- Countdown ring: Cyan circular progress indicator around the play button
- "Skip" button: Same accent glow treatment as hero primary button  
**Files**: `Player/NextVideoPopup/styles.less`

### 7p. 404 Page Redesign
**Priority**: LOW  
**Problem**: The NotFound (404) page is a basic image + text with no brand treatment.  
**Solution**: Full-page cinematic layout with the Caught in 4K logo, a glitch effect on the "404" number (CSS `text-shadow` offset animation), and a glass "Go Home" CTA button. Background: subtle animated gradient mesh.  
**Files**: `NotFound/styles.less`

### 7q. Intro / Auth Page Glass Treatment  
**Priority**: MEDIUM  
**Problem**: The login/signup page has a background image and form, but the form container has no glass treatment — it's just a transparent overlay.  
**Solution**: 
- Form container: Apply heavy glass (`blur(20px)`, `rgba(255,255,255,0.06)`, subtle border)
- Input fields: Match the search bar glow treatment on focus
- Social login buttons: Glass pill variants
- Background image: Apply slow zoom animation (`scale(1)` → `scale(1.05)` over 20s)  
**Files**: `Intro/styles.less`

### 7r. Horizontal Scroll Arrow Indicators
**Priority**: LOW  
**Problem**: Content rows have CSS mask fades at the edges, but no explicit scroll affordance. Users on desktop might not realize they can scroll horizontally. Touch users swipe naturally, but mouse users need arrows.  
**Solution**: Show subtle glass arrow buttons (◀ ▶) at each end of scrollable rows. They appear on row hover and fade when the row can't scroll further in that direction. Match the hero nav arrow treatment (50px circles, cyan on hover).  
**Files**: `HorizontalScroll/HorizontalScroll.less`, `HorizontalScroll/HorizontalScroll.js`

### 7s. Stream Quality Badges with Color Coding
**Priority**: LOW  
**Problem**: In MetaDetails streams list, quality labels (4K, 1080p, 720p, etc.) are plain text. No visual hierarchy to quickly identify the best quality.  
**Solution**: Color-coded quality badges:
- **4K / HDR**: Gold badge with subtle glow (like IMDb but smaller)
- **1080p**: Cyan accent badge
- **720p**: Grey/neutral badge
- **SD / 480p**: Dim grey  
Add a pill shape with `border-radius: 4px`, `padding: 2px 6px`, `font-weight: 600`.  
**Files**: `MetaDetails/StreamsList/Stream/styles.less`

### 7t. Smooth Color Theme Transitions
**Priority**: LOW  
**Problem**: If theme toggle (7g above) or contextual color palette (6j) is implemented, the color changes would be jarring if applied instantly.  
**Solution**: Add `transition: background-color 0.5s ease, color 0.3s ease, box-shadow 0.3s ease` to `:root` or `.caught-in-4k` so all CSS variable changes animate smoothly.  
**Files**: `caught-in-4k-theme.less`

---

## 13. Priority Roadmap

### Status Legend
- ✅ = Implemented and shipped
- 🔴 = High priority (next to implement)
- 🟡 = Medium priority
- ⚪ = Low priority (nice-to-have)

### Implemented (10 items)

| ID | Name | Status |
|---|---|---|
| 6a | Scroll-Linked Hero Fade | ✅ |
| 6c | Glassmorphic Row Headers | ✅ |
| 6i | Search Bar Glow | ✅ |
| 6k | Streaming Server Toast Redesign | ✅ |
| 6l | Hero Carousel Progress Bar | ✅ |
| 6m | Skeleton Loading Shimmer | ✅ |
| 6o | Continue Watching Progress Bars | ✅ |
| 6p | Mobile Swipe Gestures | ✅ |
| 6q | Button Haptic Press | ✅ |
| 6r | Adaptive Font Sizing | ✅ |

### Backlog — Sorted by Priority

| Priority | ID | Name | Impact | Effort |
|---|---|---|---|---|
| 🔴 HIGH | 7a | Unified Glass System | Cohesion across all pages | Medium — CSS-only changes |
| 🔴 HIGH | 7b | Library Card Hover Effects | Dead page comes alive | Small — copy MetaItem pattern |
| 🔴 HIGH | 7c | Settings Section Polish | Most neglected page | Medium — CSS + minor layout |
| 🔴 HIGH | 7d | Row Entrance Animations | Cinematic stagger effect | Medium — JS + CSS |
| 🔴 HIGH | 6j | Contextual Color from Hero | Wow factor, differentiator | Large — canvas + context |
| 🟡 MEDIUM | 7e | Hero Slide Crossfade | Smooth carousel feel | Medium — JS + CSS |
| 🟡 MEDIUM | 7f | Gradient Card Borders | Premium selection look | Small — CSS-only |
| 🟡 MEDIUM | 7g | Modal Entrance Animations | Polish | Small — CSS keyframes |
| 🟡 MEDIUM | 7h | Discover Preview Panel Glass | Visual depth | Small — CSS-only |
| 🟡 MEDIUM | 7i | Addon Card Polish | Neglected page improvement | Small — CSS-only |
| 🟡 MEDIUM | 7j | Player Control Bar Glass | Match app aesthetic | Small — CSS-only |
| 🟡 MEDIUM | 7q | Auth Page Glass Treatment | First impression matters | Medium — CSS + animation |
| 🟡 MEDIUM | 6b | Parallax Hero Background | Cinematic depth | Small — JS transform |
| 🟡 MEDIUM | 6f | Responsive Tablet Grid | Better 640–1000px experience | Medium — breakpoints |
| ⚪ LOW | 7k | Scroll-to-Top FAB | Convenience | Small — new component |
| ⚪ LOW | 7l | Button Loading State | Feedback | Small — CSS animation |
| ⚪ LOW | 7m | IMDb Badge Redesign | Minor polish | Tiny — CSS-only |
| ⚪ LOW | 7n | Keyboard Nav Indicator | Accessibility | Small — CSS pulse |
| ⚪ LOW | 7o | Next Episode Popup Polish | Player UX | Small — CSS + animation |
| ⚪ LOW | 7p | 404 Page Redesign | Brand moment | Small — CSS + text |
| ⚪ LOW | 7r | Row Scroll Arrow Buttons | Desktop affordance | Medium — JS + CSS |
| ⚪ LOW | 7s | Stream Quality Badges | Visual hierarchy | Tiny — CSS-only |
| ⚪ LOW | 7t | Smooth Color Transitions | Foundation for 6j | Tiny — CSS-only |
| ⚪ LOW | 6d | Now Playing Indicator | Fun detail | Small — CSS animation |
| ⚪ LOW | 6e | Card Hover Preview | Netflix-style | Large — new component |
| ⚪ LOW | 6g | Theme Toggle (AMOLED) | Niche benefit | Small — settings + CSS |
| ⚪ LOW | 6h | Animated Hero Dots | Minor polish | Tiny — CSS animation |
| ⚪ LOW | 6n | Canon Take Box Animation | Polish | Tiny — CSS transition |
| ⚪ LOW | 6s | Nav Pill Collapse | Space optimization | Medium — JS + CSS |

---

## 14. File Map

### Core Design Files

| File | Purpose |
|---|---|
| `src/App/caught-in-4k-theme.less` | Brand color variables, gradient tokens, glass/shimmer utility classes |
| `src/App/styles.less` | Global resets, body/html styles, font-smoothing |
| `src/common/screen-sizes.less` | Breakpoint variables (`@xxsmall` through `@large`) |

### Navigation

| File | Purpose |
|---|---|
| `src/components/MainNavBars/MainNavBars.less` | Nav layout — desktop pill vs mobile bottom bar |
| `src/components/NavBar/VerticalNavBar/NavTabButton/styles.less` | Tab hover/selected states, cyan glow, icon/label opacity |

### Board (Home)

| File | Purpose |
|---|---|
| `src/routes/Board/Board.js` | Scroll handler (hero fade), layout orchestration |
| `src/routes/Board/styles.less` | Board grid, overflow handling, responsive item counts |
| `src/routes/Board/HeroShelf/HeroShelf.js` | Hero carousel logic, swipe handlers, progress bar |
| `src/routes/Board/HeroShelf/styles.less` | Hero visual styles, gradients, dots, buttons, progress |
| `src/routes/Board/StreamingServerWarning/StreamingServerWarning.less` | Glassmorphic toast warning |

### Content Components

| File | Purpose |
|---|---|
| `src/components/MetaItem/styles.less` | Card poster, hover scale/glint, progress bars, watch indicators |
| `src/components/MetaRow/styles.less` | Row headers, glassmorphic accent bars |
| `src/components/MetaRow/MetaRowPlaceholder/styles.less` | Shimmer skeleton loading |
| `src/components/LibItem/styles.less` | Library card layout (needs hover polish) |
| `src/components/ContinueWatchingItem/styles.less` | Continue watching cards |
| `src/components/HorizontalScroll/HorizontalScroll.less` | Scroll containers, edge fade masks |

### Pages

| File | Purpose |
|---|---|
| `src/routes/MetaDetails/styles.less` | Title detail page — background, preview, streams layout |
| `src/routes/Settings/Settings.less` | Settings container (needs glass polish) |
| `src/routes/Settings/components/Section/Section.less` | Section containers (needs glass treatment) |
| `src/routes/Settings/components/Option/Option.less` | Option rows (no hover state) |
| `src/routes/Discover/styles.less` | Discover grid, filter area, preview panel |
| `src/routes/Addons/styles.less` | Addons list, filter, search |
| `src/routes/Addons/Addon/styles.less` | Addon cards (needs hover polish) |
| `src/routes/Library/styles.less` | Library grid (needs hover effects) |
| `src/routes/Intro/styles.less` | Auth page (needs glass treatment) |
| `src/routes/Player/styles.less` | Player layout, controls, menus |
| `src/routes/Player/ControlBar/styles.less` | Seek bar, volume, buttons |

### Shared UI

| File | Purpose |
|---|---|
| `src/components/Button/Button.less` | Global button styles, press/hover effects |
| `src/components/TextInput/styles.less` | Input focus glow |
| `src/components/ContextMenu/ContextMenu.less` | Right-click / overflow menus |
| `src/components/BottomSheet/BottomSheet.less` | Mobile drawer component |
| `src/components/AddonDetailsModal/styles.less` | Addon modal dialog |
| `src/components/EventModal/styles.less` | Event notification modal |
| `src/components/Image/Image.less` | Image component base styles |
| `src/components/CanonTakeBox/` | Canon Take badge (has gradient + glass) |

---

*Last updated: March 2026*
