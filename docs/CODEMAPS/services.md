# Services Layer

Core service exports are available via the `stremio/services` alias. C4K-specific helpers documented below live in their own files and are not re-exported by the main barrel. Barrel file: `src/services/index.js`.

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

| File | Purpose | Exports |
|------|---------|---------|
| `Core/Core.js` | Initializes WASM stremio-core, creates CoreTransport, manages model state subscriptions and lifecycle | `Core` |
| `Core/CoreTransport.js` | EventEmitter wrapping WASM core's `dispatch()` and `getState()`. Central React ↔ Rust bridge. | `CoreTransport` |

**How data flows**:
```
React hook (useModelState)
  → useServices().core.transport.dispatch({ action: "Load", args: ... })
  → WASM core processes
  → CoreTransport emits "stateChanged"
  → useModelState re-renders with new state
```

## Shell Service (Native Desktop)

| File | Purpose | Exports |
|------|---------|---------|
| `Shell/Shell.js` | Native shell integration: window state, updates, minimize/close | `Shell` |
| `Shell/ShellTransport.js` | postMessage transport for Electron/native wrapper | `ShellTransport` |

## Chromecast Service

| File | Purpose | Exports |
|------|---------|---------|
| `Chromecast/Chromecast.js` | Google Cast SDK: manages cast session and receiver | `Chromecast` |
| `Chromecast/ChromecastTransport.js` | Wraps Cast SDK sender API | `ChromecastTransport` |

## Global Services

| File | Purpose | Exports |
|------|---------|---------|
| `DragAndDrop/DragAndDrop.js` | Global drag-and-drop (torrent/subtitle files) | `DragAndDrop` |
| `KeyboardShortcuts/KeyboardShortcuts.js` | Global keyboard shortcut registration/handling | `KeyboardShortcuts` |

## Context

| File | Purpose | Exports |
|------|---------|---------|
| `ServicesContext/ServicesProvider.js` | React context provider for all services | `ServicesProvider` |
| `ServicesContext/useServices.js` | Consumer hook: `useServices()` | `useServices` |

## C4K Services

| File | Purpose | Exports |
|------|---------|---------|
| `BackgroundAgents/C4KBackgroundAgents.js` | Async Canon Takes fetcher: queues items, calls Pollinations first, and uses the Gemini proxy path only when configured | `c4kAgents` |
| `CanonTakesQueue/CanonTakesQueue.js` | Queue hook: processes Canon Takes when board catalogs load | `useCanonTakesQueue` |

### Canon Takes Queue Flow
```
Board mounts
  → useCanonTakesQueue triggers
    → c4kAgents.queueForCanonTake(items)
      → interval worker drains the queue
      → Pollinations API generates commentary
        → fallback to POST REACT_APP_CANON_PROXY_URL when configured
          → Gemini 2.0 Flash generates commentary
            → Response cached in localStorage
              → CanonTakeBox reads from cache for display
```

MetaPreview and HeroShelf also have direct Canon Take fetch paths for visible items, so the queue flow above covers board prefetch behavior only.
