# Settings Overhaul: The Unified Cinematic Dashboard

This document details the architectural and design changes made to the Settings page in March 2026.

## Overview
The "Caught in 4K" settings page has been transformed from a traditional tab-based menu into a single-page, zero-scroll dashboard. This provides a more immediate, premium experience for users managing their playback and identity.

## Layout Architecture
The dashboard uses a 35/65 "Golden Ratio" split in a full-screen grid:

### Left Column (35%): Identity & System
- **Account Widget**: Consolidates user profile, email, and authentication logic.
- **Interface Widget**: Unified controls for UI preferences, such as "Blur unwatched episodes".

### Right Column (65%): The Giant Player Widget
- **3-Column Grid**: Internal layout for detailed playback control.
  - **Column 1: Subtitles**: Comprehensive styling and language controls.
  - **Column 2: Audio & Playback**: Default tracks, surround toggle, and seek duration.
  - **Column 3: Advanced**: Auto-play logic and external player selection.

## Visual Identity
- **Backgrounds**: Deep charcoal (`#161616`) with subtle `1px` solid borders (`#333`).
- **Accents**: "C4k Green" (`#a1ff00`) used for active toggles and primary buttons.
- **Radius**: High border radius (`2.5rem`) for widget cards.
- **Interactivity**: Dropdowns now use a high `z-index` (9999) and parent containers have `overflow: visible` to prevent clipping.

## Deprecated & Removed Features
The following sections were removed according to the dashboard consolidation:
- **Streaming**: Removed outdated streaming server controls.
- **Keyboard Shortcuts**: Removed the standalone shortcuts page.
- **Settings Menu**: Removed the vertical tab-based side menu.

## Zero-Scroll Enforcement
The page uses `height: 100vh` and calculated flexible heights for content columns. It is specifically optimized to fit 1080p laptop displays perfectly without a scrollbar.
