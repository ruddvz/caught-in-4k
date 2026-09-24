# C4K Stremio add-on foundation

Status: foundation implementation with built-in Jellyfin provider

Branch: `feature/c4k-stremio-addon-foundation`

## Product boundary

C4K is a quality-first resolver. Stremio supplies a movie identifier, C4K asks an authorised source provider for the versions available to that installation, ranks those candidates, and returns only the strongest options.

The add-on does not need to duplicate Stremio metadata or maintain a second movie catalogue. The first version supports IMDb-style movie IDs such as `tt1234567` and the Stremio `stream` resource only.

This foundation intentionally does not contain torrent discovery, cyberlocker scraping, DRM bypassing, credential sharing, or a built-in index of copyrighted media. Source access is supplied separately by an authorised library/provider.

## Why this is a separate service

The existing Caught in 4K frontend is deployed as a static GitHub Pages application. A dynamic Stremio stream resource needs a server process. The add-on therefore lives in `c4k-addon/` and can be deployed independently without disturbing the current frontend.

Recommended production shape:

```text
c4k.live                 existing Caught in 4K web app
addon.c4k.live           C4K Stremio add-on service

https://addon.c4k.live/manifest.json
https://addon.c4k.live/stream/movie/tt1234567.json
```

The server also exposes the same protocol below `/addon` if a reverse proxy later mounts it on the main domain:

```text
https://c4k.live/addon/manifest.json
https://c4k.live/addon/stream/movie/tt1234567.json
```

## Current endpoints

| Endpoint | Purpose |
|---|---|
| `GET /manifest.json` | Stremio manifest |
| `GET /stream/movie/:imdbId.json` | Ranked streams |
| `GET /addon/manifest.json` | Prefix-compatible manifest |
| `GET /addon/stream/movie/:imdbId.json` | Prefix-compatible stream endpoint |
| `GET /media/jellyfin/:itemId/:mediaSourceId` | Signed Jellyfin media relay |
| `HEAD /media/jellyfin/:itemId/:mediaSourceId` | Relay metadata/range support |
| `GET /health` | Service health |

The service can be started locally with:

```bash
pnpm addon:start
```

Default port: `7000`.

## Source providers

C4K now has a provider boundary selected with `C4K_SOURCE_PROVIDER`.

### `jellyfin`

Built-in authorised-library provider. It indexes Jellyfin movies by IMDb ID, fetches PlaybackInfo for the matched movie, converts each media version into a C4K candidate, and returns signed C4K relay URLs so the Jellyfin token never appears in the Stremio URL.

See [`C4K_JELLYFIN_PROVIDER.md`](./C4K_JELLYFIN_PROVIDER.md) for the complete design, environment variables, metadata mapping, relay behaviour and deployment implications.

### `index`

Generic provider contract retained for integrations that already expose C4K-normalised candidates from an authorised server-side index.

## Generic source-index environment

| Variable | Required | Purpose |
|---|---:|---|
| `C4K_SOURCE_PROVIDER=index` | No | Explicitly selects the generic index provider; this is the default |
| `C4K_SOURCE_INDEX_URL` | Yes for index streams | Server-side endpoint that returns candidates for a movie ID |
| `C4K_ALLOWED_MEDIA_HOSTS` | Yes for index streams | Comma-separated exact hostnames allowed to appear in returned direct media URLs |
| `C4K_SOURCE_INDEX_TOKEN` | No | Optional bearer token sent only to the source index |
| `C4K_SOURCE_TIMEOUT_MS` | No | Source-index timeout, default 8000 ms |
| `C4K_QUALITY_PROFILE` | No | `absolute`, `imax`, or `3d`; default `absolute` |
| `C4K_MAX_STREAMS` | No | Number of ranked streams returned, default 5, hard maximum 10 |
| `C4K_ADDON_PORT` | No | HTTP port, default 7000 |

The generic source boundary defaults closed. If either `C4K_SOURCE_INDEX_URL` or `C4K_ALLOWED_MEDIA_HOSTS` is absent, it returns an empty candidate list.

In production, generic direct media URLs must use HTTPS. Localhost HTTP is accepted only outside production for development.

## Generic source-index contract

C4K calls the configured index with:

```text
GET {C4K_SOURCE_INDEX_URL}?type=movie&id=tt1234567
Accept: application/json
Authorization: Bearer {C4K_SOURCE_INDEX_TOKEN}   # only when configured
```

Accepted response forms:

```json
{
  "candidates": []
}
```

or:

```json
{
  "streams": []
}
```

or a JSON array directly.

Each candidate can contain:

```json
{
  "url": "https://media.example.com/library/movie.mkv",
  "filename": "movie.mkv",
  "source": "uhd-bluray-remux",
  "resolution": 2160,
  "videoCodec": "hevc",
  "bitDepth": 10,
  "hdr": ["dolby-vision", "hdr10"],
  "presentation": ["imax-1.90"],
  "audio": ["truehd-atmos"],
  "threeD": null,
  "bitrateMbps": 72,
  "sizeBytes": 75161927680,
  "verified": true,
  "webReady": false
}
```

C4K only forwards generic-index candidates whose `url` hostname is explicitly present in `C4K_ALLOWED_MEDIA_HOSTS`.

## Normalised quality vocabulary

### Source

- `uhd-bluray-remux`
- `uhd-bluray-encode`
- `bluray-remux`
- `web-dl`
- `bluray-encode`
- `web-rip`
- `direct-stream`
- `unknown`

### HDR

- `dolby-vision`
- `hdr10-plus`
- `hdr10`
- `hlg`
- `sdr`

### Audio

- `truehd-atmos`
- `dts-x`
- `truehd`
- `dts-hd-ma`
- `eac3-atmos`
- `eac3`
- `dts`
- `ac3`
- `aac`

### IMAX/presentation

- `imax-1.90`
- `imax-1.43`
- `imax-variable`
- `imax-enhanced`

These labels are intentionally explicit. A provider should not emit `IMAX` merely because a filename contains that text. The provider is responsible for supplying presentation metadata it can substantiate. The Jellyfin adapter follows this rule by accepting only explicit `c4k:presentation=...` tags.

### 3D

- `mvc`
- `frame-packing`
- `full-sbs`
- `half-sbs`
- `top-bottom`
- `over-under`

3D is modelled independently from resolution. The `3d` profile can therefore prefer a high-fidelity MVC/frame-packed presentation without pretending it is native 4K.

## Ranking engine

`c4k-addon/quality.js` uses a deterministic score. The order of importance is intentionally weighted toward source fidelity first, then resolution and measured bitrate, then HDR, audio, presentation and verified metadata.

This score is a C4K preference model, not a scientific measurement of perceptual quality. It exists so ranking is consistent, inspectable and testable rather than dependent on filename order.

### Profiles

`absolute`

- General maximum-quality ranking.
- UHD Blu-ray Remux is strongly preferred when other metadata is comparable.
- 4K resolution, high measured bitrate, HDR and lossless/high-fidelity audio contribute additional weight.

`imax`

- Uses the same base ranking.
- Adds a larger bonus to substantiated IMAX presentation metadata.

`3d`

- Uses the same base ranking.
- Adds format-specific weight for MVC/frame-packed and then SBS/Top-Bottom variants.

## Stremio stream output

A ranked candidate becomes a direct Stremio stream object similar to:

```json
{
  "name": "C4K • 2160p",
  "description": "2160p • UHD Blu-ray Remux\nDolby Vision • HDR10 • HEVC • 10-bit • 72 Mbps\nIMAX 1.90:1 • TrueHD Atmos • 70 GB\nC4K score 1030",
  "url": "https://addon.c4k.live/media/jellyfin/movie-id/media-source-id?expires=...&signature=...",
  "behaviorHints": {
    "bingeGroup": "c4k-absolute-2160p",
    "filename": "movie.mkv",
    "videoSize": 75161927680,
    "notWebReady": true
  }
}
```

The actual score depends on the supplied metadata. Missing fields are omitted from the description rather than guessed.

## Security decisions

1. The service accepts movie IDs only when they match an IMDb-style `tt` plus digits pattern.
2. Generic source-index URLs are server configuration, not request parameters. This avoids turning C4K into an arbitrary URL fetcher.
3. Generic direct stream hostnames must be explicitly allowlisted.
4. Production generic direct streams must use HTTPS.
5. Source-index and Jellyfin credentials remain server-side.
6. Jellyfin playback uses signed, expiring C4K relay URLs rather than exposing the Jellyfin token.
7. Stream lookups fail closed. A provider error returns an empty stream list rather than fabricated fallback data.
8. Rate limiting, Helmet and CORS are applied by the standalone Express service. Media relay requests are exempt from the request-count limiter because normal playback uses repeated byte ranges; network-level protection is still required in production.
9. The manifest declares `p2p: false` because this foundation returns authorised direct HTTP(S) streams only.

## Tests and CI

`tests/c4kAddon.spec.js` covers the protocol foundation and ranking behaviour.

`tests/c4kJellyfin.spec.js` covers:

- IMDb library matching
- full matched-item metadata fetch
- multiple Jellyfin metadata mappings
- Dolby Vision/HDR regression cases
- source and IMAX tags
- signed relay URLs
- tamper and expiry rejection
- server-side-only Jellyfin credentials

The repository exposes focused commands:

```bash
pnpm lint:addon
pnpm test:addon
```

The main GitHub Actions build runs add-on lint plus the repository-wide Jest suite before the production frontend build and E2E stages.

## Next engineering slices

### 1. Production deployment

Deploy `c4k-addon/server.js` on a persistent Node-capable service and map `addon.c4k.live` to it. GitHub Pages remains responsible only for the frontend. For Jellyfin, prefer a host close to the Jellyfin server because media bytes pass through the signed relay.

### 2. Plex provider

Implement Plex behind the same provider boundary. Keep Plex credentials server-side and reuse the signed-relay security model where direct authenticated media URLs would otherwise expose credentials.

### 3. Configuration

Add a proper `/configure` flow after the authentication and encrypted credential-storage model is defined. Do not put Jellyfin/Plex tokens or equivalent long-lived secrets into a public manifest URL.

### 4. Compatibility policy

Add device-aware filters later. Maximum source quality and maximum playback compatibility are separate concerns. For example, a file that is objectively the strongest master may still require transcoding or may not be directly playable on a particular Stremio client.

### 5. Series

Keep the first release movie-only. Once the movie path is stable, add Stremio series/video ID parsing and episode-specific source lookups rather than guessing episode identity from titles.
