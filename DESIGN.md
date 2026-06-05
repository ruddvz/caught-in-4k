# Caught in 4K — Design System (Cinematic Gold Glass)

> Living design document. Canonical tokens: `src/styles/tokens.css`

---

## 1. Design Identity

| Attribute | Value |
|---|---|
| **Aesthetic** | Cinematic Gold Glass — OLED black, gold highlights, frosted surfaces |
| **Layout** | iPhone-first PWA with safe-area aware shell |
| **Typography** | System UI stack + Plus Jakarta Sans where loaded |

---

## 2. Canonical Tokens (`src/styles/tokens.css`)

| Token | Usage |
|---|---|
| `--c4k-bg` | App base `#050506` |
| `--c4k-gold` | Primary accent |
| `--c4k-surface` / `--c4k-surface-2` | Frosted panels |
| `--c4k-touch` | Minimum 44px tap targets |
| `--safe-top` / `--safe-bottom` | iOS safe-area insets |

App shell also defines `--safe-area-inset-*` in `src/App/styles.less`.

---

## 3. Route polish status

| Route | Notes |
|---|---|
| Board / Search / Discover | Carousels + empty states |
| MetaDetails | Safe-area top padding, rating tooltips |
| Player | Control bar safe-area, HDR badge when metadata indicates HDR |
| Library | Placeholder when not signed in |
| Settings | Sectioned: Account, Profiles, Playback, Interface, Streaming, About |
| Addons | Legal notice for lawful user-configured add-ons |

---

## 4. Motion

- Respect `prefers-reduced-motion`
- Poster hover effects desktop-only
- Avoid heavy shaders on low-end mobile

---

## 5. Parity reference

Upstream inspiration: Stremio Web v5.0.0-beta.37. See `docs/stremio-upstream-sync.md` for ported vs rejected items.
