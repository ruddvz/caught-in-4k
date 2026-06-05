# Caught in 4K — Design System (C4K iOS Cinema v1)

> **Single product direction:** Premium OLED streaming PWA — soft glass, gold accent, iPhone-first navigation.  
> Canonical tokens: `src/styles/tokens.css`, `src/App/caught-in-4k-theme.less`  
> Full spec: `docs/design-system.md`

---

## 1. Identity

| Attribute | Value |
|---|---|
| **Aesthetic** | Cinematic iOS Cinema — near-black, gold highlights, calm glass |
| **Layout** | iPhone PWA shell with floating bottom tabs + safe areas |
| **Typography** | Apple system stack first (`-apple-system`, SF Pro) |

Legacy README “liquid glass neon” and old matte dashboard directions are **retired** — use this document only.

---

## 2. Tokens (summary)

| Token | Usage |
|---|---|
| `--c4k-bg` | `#05060A` app background |
| `--c4k-gold` | Primary accent, focus, active tab |
| `--c4k-glass-1` | Cards and panels |
| `--c4k-top-bar-height` | 58px + safe-top |
| `--c4k-bottom-tab-height` | 74px + safe-bottom padding |
| `--poster-card-width` | `clamp(124px, 34vw, 178px)` |

---

## 3. Navigation (iPhone)

Five bottom tabs: **Home · Search · Library · Addons · Profile**

- Discover opens from Search (same tab highlight)
- Calendar, Admin, Subscribe under Profile
- Player / MetaDetails: no bottom bar

---

## 4. Route status

| Route | Status |
|---|---|
| Board | Hero + rows, bottom safe padding |
| Search / Discover | 2-col mobile grid, hints when empty |
| MetaDetails | Safe-area, min-height preview, gold legal links |
| Player | Immersive, safe-area controls |
| Library | Empty state + continue scroll |
| Settings / Addons | Sectioned, 44px+ targets |
| Tos / Privacy | Selectable text, gold links |

---

## 5. Motion & a11y

- `prefers-reduced-motion`: disable shimmer/parallax
- `:focus-visible`: gold ring (not cyan)
- Icon buttons: `aria-label` on player + nav

---

## 6. PWA

- `manifest.json`: `#05060A`, `portrait-primary`, maskable icons
- `viewport-fit=cover` in `src/index.html`
- Install banner: `PwaInstallBanner`
