# Services Layer

All exports available via `stremio/services` alias. Barrel file: `src/services/index.js` (18 lines).

## Architecture

```
ServicesProvider (React Context)
├── Core — WASM stremio-core bridge
│   └── CoreTransport — EventEmitter wrapping WASM dispatch/getState
├── Shell — Native app window management (Electron)
│   └── ShellTransport — postMessage-based native bridge
├── Chromecast — Google Cast SDK integration
│   └── ChromecastTransport — Cast sender API wrapper
├── KeyboardShortcuts — Global hotkey registration
└── DragAndDrop — Global file drop handling
```

## Core Service (WASM Bridge)

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `Core/Core.js` | 96 | Initializes WASM stremio-core, creates CoreTransport, manages model state subscriptions and lifecycle | `Core` |
| `Core/CoreTransport.js` | 61 | EventEmitter wrapping WASM core's `dispatch()` and `getState()`. Central React ↔ Rust bridge. | `CoreTransport` |

**How data flows**:
```
React hook (useModelState)
  → useServices().core.transport.dispatch({ action: "Load", args: ... })
  → WASM core processes
  → CoreTransport emits "stateChanged"
  → useModelState re-renders with new state
```

## Shell Service (Native Desktop)

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `Shell/Shell.js` | 88 | Native shell integration: window state, updates, minimize/close | `Shell` |
| `Shell/ShellTransport.js` | 92 | postMessage transport for Electron/native wrapper | `ShellTransport` |

## Chromecast Service

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `Chromecast/Chromecast.js` | 92 | Google Cast SDK: manages cast session and receiver | `Chromecast` |
| `Chromecast/ChromecastTransport.js` | 175 | Wraps Cast SDK sender API | `ChromecastTransport` |

## Global Services

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `DragAndDrop/DragAndDrop.js` | 95 | Global drag-and-drop (torrent/subtitle files) | `DragAndDrop` |
| `KeyboardShortcuts/KeyboardShortcuts.js` | 88 | Global keyboard shortcut registration/handling | `KeyboardShortcuts` |

## Context

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `ServicesContext/ServicesProvider.js` | 23 | React context provider for all services | `ServicesProvider` |
| `ServicesContext/useServices.js` | 10 | Consumer hook: `useServices()` | `useServices` |

## C4K Services

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `BackgroundAgents/C4KBackgroundAgents.js` | 173 | Async Canon Takes fetcher: calls Gemini API proxy in background | `C4KBackgroundAgents` |
| `CanonTakesQueue/CanonTakesQueue.js` | 24 | Queue hook: processes Canon Takes when board catalogs load | `useCanonTakesQueue` |

### Canon Takes Flow
```
Board mounts
  → useCanonTakesQueue triggers
    → C4KBackgroundAgents.fetchForCatalog(items)
      → POST /api/canon-take (api-proxy.js:3001)
        → Gemini 2.0 Flash generates commentary
          → Response cached in localStorage
            → CanonTakeBox reads from cache for display
```
