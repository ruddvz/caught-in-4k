# Changelog

All notable changes to this project are documented in this file.

---

## Latest

- **Restored YouTube trailer button** on the Board hero section (was accidentally removed in a prior commit)

## 2026-03-22

- **fix:** hero no longer bleeds full viewport on mobile — changed `position: fixed` to `position: absolute` on hero background/gradient so it stays contained within the hero section
- **feat:** cyan highlight system for hero primary/secondary buttons (glow shadows, accent hover colors)
- **feat:** hero full-bleed fix and notch coverage on mobile
- **fix:** hero extends full width behind nav pill + notch, fix button text visibility, SVG nav arrows
- **feat:** remove calendar tab, show all 6 nav tabs on mobile, fix notch safe area, improve mobile hero
- **fix:** remove marketing checkbox, restore search bar, bigger mobile hero, remove blank logo pill
- **fix:** mobile responsive — anchor nav bar to bottom, fix hero overflow, round bottom-bar corners
- **feat:** Gen Z rewrite of ToS and Privacy Policy, remove top-left nav logo
- **fix:** legal page text colors, remove support/source links from Settings, reduce intro spacing, remove Facebook/Apple login buttons
- **feat:** wire internal /tos and /privacy routes into Settings, NavMenu, and signup checkboxes
- **feat:** add branded ToS and Privacy Policy pages, fix intro logo spacing
- **feat:** redesign nav — individual floating glass buttons, proper pill tabs
- **feat:** UI improvements — satisfaction meter, hero section, nav tabs, detail page layout

## Earlier Changes

- Debug and fix translation system (`useTranslate` hook, `I18nextProvider`, bulletproof `t.string()` calls)
- Consolidate navigation to left pill and refine dark theme
- Liquid-glass Canon Take box, remove API-dependent meters
- Fix corrupted MetaItem styles encoding (UTF-16 → UTF-8)
- Implement Apple Liquid Glass UI, suppress CanonTakes/SatisfactionMeter API to prevent crashes
- Phthalo Green background, Liquid Glass Apple TV/Omni nav bars, inject GenZ Summary into Hero, remove Stremio branding from Auth
- Design overhaul: Apple TV / Omni Content Hub UI style
- Design overhaul: Windows 11 navbar center, dark monochrome theme, fix Satisfaction Meter on hero/board
- Wire ratings and unify C4K branding
- Fix circular dependency causing React #130 crash
- SPA fallback for http_server
- Custom component exports (AppLogo, CanonTakeBox, SatisfactionMeterBar)
- Disable service worker, configure GitHub Pages deployment
- Fix React #130 crash from CJS/ESM import mismatches
- Disable Canon Takes API calls when no proxy URL configured
- Branding: C4K neon diamond icon, text+red dot icons, transparent logo
- Rewrite README for Caught In 4K
- Background agents for Gen Z summary and satisfaction metrics
- Neon cyberpunk theme (cyan and pink colors)
- Initial commit and Caught in 4K theme launch
