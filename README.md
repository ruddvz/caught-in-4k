# Caught in 4K

[![Build](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml/badge.svg)](https://github.com/ruddvz/caught-in-4k/actions/workflows/build.yml)
[![GitHub Pages](https://img.shields.io/website?label=Live%20Demo&logo=github&up_message=online&down_message=offline&url=https%3A%2F%2Fruddvz.github.io%2Fcaught-in-4k%2F)](https://ruddvz.github.io/caught-in-4k/main)

**Caught in 4K** - The premier destination for next-gen streaming. Featuring our exclusive **Liquid Glass Cinematic Interface**, this project brings frosted glass aesthetics, neon gradients, and a Gen Z vibe to your favorite movies and shows.

Built entirely from the ground up for superior 4K visual quality, seamless performance, and an immersive user experience.

## ✨ Features

### 🎬 Liquid Glass Design System
- **Frosted Glass Panels** with hyper-realistic backdrop blur effects
- **Cinematic Gradients** bursting with vibrant violet, orange, and electric blue accents
- **Specular Highlights** that make buttons shine
- **Deep Black Backgrounds** optimized for OLED and 4K displays

### 🎯 Gen Z AI Integration
- **Canon Takes** - Our proprietary background agents generate quick, witty, and relatable summaries for every movie and series.
- **Satisfaction Meter** - Community vibe checks with emoji feedback to let you know if a show is worth the hype.
- **Board Stats** - Global tracking of what's trending and what's flopping.
- **Personalized Discovery** - Smart recommendations tailored entirely to your vibes.

### 🌍 Multi-Language & Accessibility
- Fully internationalized (i18n) support
- Custom Gen Z slang translation overrides
- Accessible and screen-reader friendly design

## 🚀 Build Instructions

### Prerequisites

* Node.js 18 or higher
* [pnpm](https://pnpm.io/installation) 8 or higher

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

## 🎨 Theme Customization

The **Liquid Glass** theme is defined securely in `src/App/caught-in-4k-theme.less` with customizable CSS variables:

```css
:root {
    --primary-accent-color: rgb(0, 240, 255);        /* Cyan */
    --secondary-accent-color: rgba(157, 78, 221, 1); /* Violet */
    --primary-background-color: rgba(8, 6, 16, 1);   /* Deep black */
    --outer-glow: 0 0 20px rgba(0, 240, 255, 0.35);  /* Cyan glow */
}
```

## 🔧 Tech Stack

- **React 18** with Hooks
- **Redux** for state management  
- **Webpack 5** with HMR
- **Jest** for lightning fast unit testing
- **LESS** for our Liquid Glass styling

## 📜 License

Caught in 4K is an open-source passion project available under the [GPLv2 license](/LICENSE.md).
