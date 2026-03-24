# App Shell & Router

## `src/App/` — Application Shell

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `App.js` | 257 | Root component: orchestrates router, services, error handling, toast/tooltip providers, shortcuts, file drop, deep link handler | `App` |
| `index.js` | 5 | Barrel re-export | `App` |
| `routerViewsConfig.js` | 77 | Route-to-component mapping array. Maps URL regex patterns to route components | `views[]` |
| `withProtectedRoutes.js` | 29 | HOC redirecting unauthenticated users to Intro for protected routes | `withProtectedRoutes` |
| `DeepLinkHandler.js` | 22 | Parses location hash for addon install deep links | `DeepLinkHandler` |
| `SearchParamsHandler.js` | 63 | Processes URL search params on load (e.g., `?addonOpen=`) | `SearchParamsHandler` |
| `ServicesToaster.js` | 81 | Subscribes to core events and shows toast notifications | `ServicesToaster` |
| `ErrorDialog/ErrorDialog.js` | 53 | Modal error dialog for app-level errors | `ErrorDialog` |
| `ShortcutsModal/ShortcutsModal.tsx` | 59 | Modal displaying keyboard shortcuts list | `ShortcutsModal` |
| `UpdaterBanner/UpdaterBanner.tsx` | 50 | Banner shown when app update available | `UpdaterBanner` |

### App.js Dependency Tree
```
App.js
├── imports from stremio/services: ServicesProvider, useServices
├── imports from stremio/common: ToastProvider, TooltipProvider, FileDrop, Shortcuts, Platform
├── imports from stremio-router: Router, ModalsContainerProvider
├── ./routerViewsConfig (route definitions)
├── ./withProtectedRoutes (auth wrapper)
├── ./DeepLinkHandler
├── ./SearchParamsHandler
├── ./ServicesToaster
├── ./ErrorDialog
├── ./UpdaterBanner
└── ./ShortcutsModal
```

---

## `src/router/` — Client-Side Hash Router

Published as webpack alias `stremio-router`.

| File | Lines | Purpose | Exports |
|------|-------|---------|---------|
| `index.js` | 13 | Barrel export | `Router, Route, Modal, useRouteFocused, ModalsContainerProvider, useModalsContainer` |
| `Router/Router.js` | 107 | Core router: listens to `hashchange`, matches routes, renders matched components with URL params | `Router` |
| `Router/routeConfigForPath.js` | 15 | Tests URL path against route regex patterns | `routeConfigForPath` |
| `Router/urlParamsForPath.js` | 16 | Extracts named URL params from matched path | `urlParamsForPath` |
| `Route/Route.js` | 23 | Route wrapper providing RouteFocusedContext | `Route` |
| `Modal/Modal.js` | 29 | Portal-based modal via createPortal | `Modal` |
| `RouteFocusedContext/` | ~19 | Context + hook for active route detection | `RouteFocusedContext, useRouteFocused` |
| `ModalsContainerContext/` | ~31 | Context + hook for modal portal target | `ModalsContainerProvider, useModalsContainer` |

### Routing Flow
```
1. User navigates → hash changes (e.g., #/discover/...)
2. Router.js listens to `hashchange` event
3. routeConfigForPath tests URL against routerViewsConfig entries
4. Each entry has { path: regex, component: RouteComponent }
5. Matched component renders with URL params extracted by urlParamsForPath
6. withProtectedRoutes redirects to Intro if auth required but not logged in
```

### Route Patterns (from `src/common/routesRegexp.js`)
```
intro       — /intro
board       — /
discover    — /discover/:type?/:catalogId?/:extra?
library     — /library/:type?
search      — /search?:query?
metadetails — /metadetails/:type/:id/:videoId?
addons      — /addons/:type?/:catalogId?/:extra?
settings    — /settings
player      — /player/:stream/:streamTransportUrl/:metaTransportUrl?/:type?/:id?/:videoId?
calendar    — /calendar/:year?/:month?/:day?
profiles    — /profiles
```
