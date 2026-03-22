# Changes Log

All customizations and modifications made to the Caught in 4K (Stremio Web fork) are documented here.

---

## 2026-03-22 — Restore Trailer Button on Hero Shelf
- **Restored** the YouTube trailer button on the HeroShelf (home page hero section)
- The trailer button had been removed in commit `459957b`; it is now back as a secondary action button next to the "Show" button
- File changed: `src/routes/Board/HeroShelf/HeroShelf.js`

## 2026-03-22 — Hero Full-Bleed Fix, Notch Coverage, Cyan Highlight System, DESIGN.md (`459957b`)
- Fix hero left dead space: `overflow-x: clip` + `overflow-clip-margin` on board-content
- Fix mobile notch: hero-background and hero-gradient use `position:fixed` on mobile
- Removed YouTube trailer button from HeroShelf (**reverted — see above**)
- Hero primary button now uses neon cyan accent color with outer glow
- Hero secondary button gets cyan border glow on hover
- Added tablet breakpoints `@medium` and `@xsmall` for better hero sizing
- Applied cyan `focus-visible` ring globally in `App/styles.less`
- Updated Button component focus color to use `primary-accent-color`
- Removed duplicate/conflicting breakpoints in `HeroShelf/styles.less`
- Created `DESIGN.md` living design doc

## 2026-03-22 — Hero Full Width + SVG Nav Arrows (`269d5d5`)
- Hero extends full width behind nav pill + notch
- Fix button text visibility
- SVG nav arrows for hero carousel

## 2026-03-22 — Remove Calendar, Mobile Nav, Notch Safe Area (`e9165aa`)
- Remove calendar from nav
- Show all 6 nav tabs on mobile
- Fix notch safe area
- Improve mobile hero section

## 2026-03-22 — Remove Marketing Checkbox, Restore Search Bar (`e64dff2`)
- Remove marketing checkbox
- Restore search bar
- Bigger mobile hero
- Remove blank logo pill

## 2026-03-22 — Mobile Responsive Fixes (`d9291a0`)
- Anchor nav bar to bottom on mobile
- Fix hero overflow
- Round bottom-bar corners

## 2026-03-22 — Gen Z ToS and Privacy Policy (`cd6e68b`)
- Gen Z rewrite of ToS and Privacy Policy
- Remove top-left nav logo

## 2026-03-22 — Legal Page Fixes, Remove Login Buttons (`460d686`)
- Fix legal page text colors
- Remove support/source links from Settings
- Reduce intro spacing
- Remove Facebook/Apple login buttons

## 2026-03-22 — Wire ToS and Privacy Routes (`3799f43`)
- Wire internal `/tos` and `/privacy` routes into Settings, NavMenu, and signup checkboxes

## 2026-03-22 — Branded ToS and Privacy Pages (`097cc08`)
- Add branded ToS and Privacy Policy pages
- Fix intro logo spacing

## 2026-03-22 — Redesign Nav (`b5f0e09`)
- Redesign nav with individual floating glass buttons and proper pill tabs

## 2026-03-22 — UI Improvements (`453e7eb`)
- Satisfaction meter improvements
- Hero section improvements
- Nav tabs refinements
- Detail page layout updates

## Earlier — Translation & Build Fixes
- Multiple fixes for `useTranslate` hook and i18next integration
- Fix corrupted MetaItem styles encoding (UTF-16 → UTF-8)
- Liquid-glass Canon Take box design
- Consolidate navigation to left pill and refine dark theme
- Fix circular dependency causing React #130 crash

## Earlier — Branding & Deployment
- Replace all Stremio icons with C4K neon diamond icon
- Custom C4K text+red dot icons
- Configure GitHub Pages deployment
- Disable service worker, unregister stale SWs
- Background agents for Gen Z summary and satisfaction metrics
- Phthalo Green background, Liquid Glass Apple TV/Omni nav bars
- Remove Stremio branding from Auth screens
- Apple Liquid Glass UI implementation
- Design overhaul: Windows 11 navbar center, dark monochrome theme
- Apple TV / Omni Content Hub UI style

## Initial Setup
- Fork of Stremio Web as "Caught in 4K"
- Neon cyberpunk theme (cyan and pink colors)
- Liquid Glass UI design system
- `pnpm` as package manager
