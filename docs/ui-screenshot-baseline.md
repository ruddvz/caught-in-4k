# UI Screenshot Baseline

Captured via `pnpm visual-regression` (Playwright) into `test-results/visual/`.

## Viewports

| Name | Width | Height |
|---|---:|---:|
| iphone-se | 375 | 812 |
| iphone-14 | 390 | 844 |
| iphone-pro-max | 430 | 932 |
| ipad | 768 | 1024 |
| desktop | 1440 | 900 |

## Routes captured

`/`, `/search`, `/discover`, `/library`, `/calendar`, `/settings`, `/addons`

## Known issues addressed in redesign

- Conflicting design docs (neon vs matte vs gold) → unified **C4K iOS Cinema v1**
- Global `user-select: none` + `overflow: clip` breaking legal/settings text
- Cyan focus glow vs gold brand
- Six bottom tabs crowding iPhone → five tabs (Discover via Search)
- Poster cards too wide on 390px → `clamp(124px, 34vw, 178px)`
- Bottom nav overlap → shell `padding-bottom` uses tab height + safe-area

## Compare after each phase

Re-run `pnpm visual-regression` and diff PNGs in `test-results/visual/`.
