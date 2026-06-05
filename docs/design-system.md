# C4K iOS Cinema v1 — Design System

Canonical tokens: `src/styles/tokens.css`, `src/App/caught-in-4k-theme.less`

## Mood

Premium OLED streaming app — soft glass, gold accent, artwork-led, thumb-first. Not neon gaming UI.

## Color

| Token | Value | Use |
|---|---|---|
| `--c4k-bg` | `#05060A` | App background |
| `--c4k-gold` | `#F4D38C` | Primary accent, focus, active nav |
| `--c4k-text` | `#F7F7F9` | Primary text |
| `--c4k-text-muted` | 68% white | Metadata |
| `--c4k-glass-1` | 5.5% white | Cards |
| `--c4k-danger` | `#FF5D73` | Destructive only |

## Typography

```css
font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", Inter, "Plus Jakarta Sans", sans-serif;
```

## Layout (iPhone)

| Token | Value |
|---|---|
| `--c4k-top-bar-height` | 58px |
| `--c4k-bottom-tab-height` | 74px |
| `--c4k-safe-*` | `env(safe-area-inset-*)` |

Shell: `min-height: 100svh`, route scroll uses `padding-bottom: calc(tab + safe + 28px)`.

## Surfaces

1. **Glass card** — blur max 20px, not on every poster in a row
2. **Floating sheet** — modals/bottom sheets
3. **Solid panel** — scrolling lists (performance)

## Touch targets

- Primary: 48px
- Icon: 44px minimum
- Bottom tab: 56px+ hit area

## Motion

- Route fade 180–240ms
- Card press scale 0.985
- `prefers-reduced-motion`: no shimmer/parallax

## Components

| Component | Path |
|---|---|
| App shell | `MainNavBars` |
| Poster card | `MetaItem` |
| Row | `MetaRow` |
| Empty state | `C4KEmptyState` |
| Buttons | `Button` (gold primary) |

See `DESIGN.md` for route-level status.
