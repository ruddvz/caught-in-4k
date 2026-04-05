# Reusable UI Components

All exports available via `stremio/components` alias. Barrel file: `src/components/index.ts` (78 lines).

## Core UI Primitives

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `Button/Button.tsx` | 75 | Base button; supports `href` (anchor) and `onClick` (button); long press | None |
| `Image/Image.tsx` | 37 | Image with fallback/error handling | None |
| `TextInput/TextInput.tsx` | 42 | Text input with Enter-to-submit | None |
| `Toggle/Toggle.tsx` | 27 | Toggle switch wrapping Button | `Button` |
| `Checkbox/Checkbox.tsx` | 96 | Accessible checkbox with label/link/error | `Button` |
| `NumberInput/NumberInput.tsx` | 113 | Numeric input with +/- buttons | `Button` |
| `RadioButton/RadioButton.tsx` | 58 | Radio button group | `Button` |
| `ColorInput/ColorInput.tsx` | 105 | Color picker (opens modal with a-color-picker) | `Button, ModalDialog` |
| `Slider/Slider.js` | 167 | Touch/mouse drag slider (seek/volume) | `useRouteFocused, useAnimationFrame, useLiveRef` |

## Layout & Navigation

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `MainNavBars/MainNavBars.tsx` | 54 | Top nav + content area + mobile bottom nav. Defines TABS array. | `TopNavigationBar, HorizontalNavBar` |
| `NavBar/TopNavigationBar/TopNavigationBar.tsx` | 154 | C4K custom: centered pill-shaped nav tabs, search, profile avatar | `Button, AppLogo, useFullscreen` |
| `NavBar/HorizontalNavBar/HorizontalNavBar.js` | 86 | Standard horizontal nav: back, logo, search, fullscreen, menu | `Button, AppLogo, SearchBar, NavMenu` |
| `NavBar/HorizontalNavBar/SearchBar/SearchBar.js` | 201 | Search with autocomplete, history, local results, keyboard nav | `Button, TextInput, Image, useLocalSearch, useSearchHistory` |
| `NavBar/HorizontalNavBar/NavMenu/NavMenu.js` | 55 | Popup nav menu (user info, settings, logout) | `Popup, NavMenuContent` |
| `NavBar/VerticalNavBar/VerticalNavBar.js` | 50 | Vertical tab nav (used in MetaDetails) | `NavTabButton, useTranslate` |
| `HorizontalScroll/HorizontalScroll.tsx` | 40 | Scrollable container with fade indicators | None |
| `Chips/Chips.tsx` | 37 | Horizontally scrollable chip/tag selector | `HorizontalScroll, Chip` |
| `AppLogo/AppLogo.js` | 30 | "Caught in 4K" logo with optional tagline | `useTranslate` |

## Content Display

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `MetaItem/MetaItem.js` | 186 | Card: poster, title, progress bar, watched badge, context menu | `Button, Image, Popup, useBinaryState, useTranslate, routesRegexp` |
| `MetaRow/MetaRow.js` | 118 | Horizontal scrollable row of MetaItems with "see all" | `Button, HorizontalScroll, useTranslate` |
| `MetaPreview/MetaPreview.js` | 410 | **Largest reusable component**. Large preview: name, logo, description, trailer, rating, share. | `Button, Image, ModalDialog, SharePrompt, ActionButton, MetaLinks, Ratings` |
| `LibItem/LibItem.js` | 159 | Library card: wraps MetaItem with library actions (play, dismiss, remove) | `MetaItem, useServices, useTranslate` |
| `ContinueWatchingItem/ContinueWatchingItem.js` | 52 | Continue Watching card: wraps LibItem with rewind/dismiss | `LibItem, useServices` |
| `Video/Video.js` | 229 | Episode list item: thumbnail, progress, watched/upcoming badges, context menu | `Button, Image, Popup, useRouteFocused, useBinaryState, useProfile` |

## Overlays & Modals

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `ModalDialog/ModalDialog.js` | 125 | General-purpose modal with title, buttons, escape-to-close | `Modal (router), Button, useRouteFocused, useModalsContainer` |
| `AddonDetailsModal/AddonDetailsModal.js` | 194 | Addon details: install/uninstall/configure/share | `ModalDialog, Button, Image, SharePrompt, useServices, useAddonDetails` |
| `Popup/Popup.js` | 131 | Auto-positioning popup (context menus) | `useRouteFocused` |
| `ContextMenu/ContextMenu.tsx` | 101 | Right-click context menu via portal | None (uses createPortal) |
| `BottomSheet/BottomSheet.tsx` | 93 | Mobile slide-up sheet with touch-drag-to-dismiss | `useBinaryState, useOrientation` |
| `EventModal/EventModal.js` | 90 | System/addon event modals | `Button, ModalDialog, useTranslate, useEvents` |
| `SharePrompt/SharePrompt.js` | 87 | Social sharing (Facebook, X, Reddit, copy) | `Button, TextInput, useServices, useToast` |

## Dropdowns & Selectors

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `MultiselectMenu/MultiselectMenu.tsx` | 72 | Dropdown select menu (settings, filters) | `Dropdown` |
| `MultiselectMenu/Dropdown/Dropdown.tsx` | 80 | Dropdown panel with keyboard nav | `Option` |
| `Multiselect/Multiselect.js` | 181 | **Legacy** multiselect dropdown | `useRouteFocused, Button` |

## Utility Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `Transition/Transition.tsx` | 60 | CSS transition wrapper (enter/exit classes) |
| `DelayedRenderer/DelayedRenderer.js` | 24 | Renders children after delay (loading states) |
| `SearchBar/SearchBar.js` | 35 | Simple standalone search bar |
| `ShortcutsGroup/ShortcutsGroup.tsx` | 38 | Keyboard shortcuts display group |

## Shadcn / Tailwind Showcase Components

| Component | Lines | Purpose | Depends On (src/) |
|-----------|-------|---------|-------------------|
| `ui/auth-form-1.tsx` | 477 | Auth form showcase using shadcn primitives | `ui/button, ui/checkbox, ui/input, ui/label, ui/separator, lib/utils` |
| `ui/demo.tsx` | 10 | Auth preview wrapper used by `AuthPreview` route | `ui/auth-form-1` |
| `ui/shaders-hero-section.tsx` | 225 | Shader-based hero building blocks: background, header, CTA content, pulsing circle | `common/useTranslate, lucide-react, framer-motion, @paper-design/shaders-react` |
| `ui/shaders-hero-demo.tsx` | 14 | Standalone shader hero showcase wrapper | `ui/shaders-hero-section` |

## C4K-Specific Components

| Component | Lines | Purpose |
|-----------|-------|---------|
| `CanonTakeBox/CanonTakeBox.js` | 66 | AI "Canon Take" commentary display |
| `BoardStatsSection/BoardStatsSection.js` | 69 | Board page statistics |
| `SatisfactionMeterBar/SatisfactionMeterBar.js` | 82 | Satisfaction meter bar chart |
| `SatisfactionMeterLegend/SatisfactionMeterLegend.js` | 26 | Satisfaction meter legend |

## Component Hierarchy (Simplified)

```
MainNavBars
├── TopNavigationBar (C4K)
│   ├── AppLogo
│   └── Button (nav tabs)
├── HorizontalNavBar (standard)
│   ├── SearchBar
│   │   ├── TextInput
│   │   └── useLocalSearch → useModelState
│   └── NavMenu → NavMenuContent
└── Content Area (route-specific)

MetaPreview (used in Board hero, Discover sidebar, MetaDetails)
├── ActionButton
├── MetaLinks
├── Ratings → useRating
├── SharePrompt
└── ModalDialog (for trailer)

MetaRow (used in Board, Search)
└── MetaItem (used in Board, Discover, Search)
    ├── Image
    └── Popup (context menu)

LibItem (used in Library)
└── MetaItem
    └── ...

ContinueWatchingItem (used in Board)
└── LibItem
    └── MetaItem
```
