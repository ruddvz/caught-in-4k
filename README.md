# Caught in 4K - Stremio Web

[![Build](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml/badge.svg)](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml)
[![GitHub Pages](https://img.shields.io/website?label=Live%20Demo&logo=github&up_message=online&down_message=offline&url=https%3A%2F%2Fruddvz.github.io%2Fcaught-in-4k%2F)](https://ruddvz.github.io/caught-in-4k/main)

**Caught in 4K** - A premium streaming experience with a **Liquid Glass Cinematic Interface**. Featuring frosted glass panels, vibrant gradients, and a Gen Z aesthetic for modern content discovery.

Built on Stremio's powerful streaming foundation with an all-new design philosophy focused on 4K visual quality and immersive user experience.

## Features

### 🎬 Liquid Glass Design System
- **Frosted Glass Panels** with backdrop blur effects
- **Cinematic Gradients** with vibrant violet, orange, and blue accents
- **Specular Highlights** for premium glass morphism effects
- **Premium Dark Backgrounds** optimized for 4K displays

### 🎯 Gen Z AI Integration
- **Canon Takes** - AI-generated Gen Z summaries for every movie and series
- **Satisfaction Meter** - Community vibe ratings with emoji feedback
- **Board Stats** - Global satisfaction analytics with trends
- **Personalized Discovery** - Smart recommendations based on vibes

### 🌍 Multi-Language & Accessibility
- Full i18n support with 30+ languages
- Custom Gen Z translation overrides
- Accessibility-first component design

## Build

### Prerequisites

* Node.js 12 or higher
* [pnpm](https://pnpm.io/installation) 10 or higher

### Install dependencies

```bash
pnpm install
```

### Start development server

```bash
pnpm start
```

### Production build

```bash
pnpm run build
```

### Run Tests

```bash
pnpm test
```

### Run with Docker

```bash
docker build -t caught-in-4k .
docker run -p 8080:8080 caught-in-4k
```

## Theme Customization

The **Liquid Glass** theme is defined in `src/App/caught-in-4k-theme.less` with customizable CSS variables:

```css
:root {
    --primary-accent-color: rgb(0, 240, 255);        /* Cyan */
    --secondary-accent-color: rgba(157, 78, 221, 1); /* Violet */
    --primary-background-color: rgba(8, 6, 16, 1);   /* Deep black */
    --outer-glow: 0 0 20px rgba(0, 240, 255, 0.35);  /* Cyan glow */
}
```

## Components

### Core UI Components
- **CanonTakeBox** - AI summaries with glass morphism styling
- **SatisfactionMeterBar** - Interactive vibe rating display
- **ModalDialog** - Premium dialog with cinematic border effects
- **Button** - Glass-morphism buttons with specular highlights

### Layout Components
- **MainNavBars** - Navigation with liquid glass background
- **MetaRow** - Catalog browsing with premium styling
- **HorizontalScroll** - Smooth media carousel

## Deployment

### GitHub Pages Auto-Deployment

The project uses GitHub Actions to automatically:
1. Build production assets
2. Run all tests and linting
3. Deploy to GitHub Pages on `gh-pages` branch

Triggered on pushes to `main` and `development` branches.

**Configure GitHub Pages:**
- Go to **Settings → Pages**
- Set Source: **Branch: gh-pages, Folder: /**

### Manual Workflow Dispatch

Trigger builds manually from GitHub Actions tab:
1. Go to **Actions** → **Build**
2. Click **"Run workflow"** → select branch → **Run**

## Screenshots

### Board - Liquid Glass Theme

![Board](/assets/screenshots/board_wide.webp)

### Mobile - Responsive Design

![Mobile](/assets/screenshots/board_narrow.webp)

## Tech Stack

- **React 18** with Hooks
- **Redux** for state management  
- **i18next** for internationalization
- **Webpack 5** with HMR
- **Jest** for unit testing
- **LESS** for styling
- **TypeScript** support
- **Workbox** for PWA features

## Contributing

See [CODE_OF_CONDUCT.md](/CODE_OF_CONDUCT.md) for guidelines.

## License

Stremio is copyright 2017-2023 Smart code and available under GPLv2 license. See the [LICENSE](/LICENSE.md) file in the project for more information.
