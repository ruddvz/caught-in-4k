# C4K Jellyfin provider

Status: implemented on `feature/c4k-stremio-addon-foundation`

## Purpose

The Jellyfin provider lets C4K resolve Stremio movie requests against a media library the operator is authorised to access. C4K does not scrape public streaming sites or discover third-party copyrighted-media sources.

The flow is:

```text
Stremio movie id
    -> C4K stream endpoint
    -> Jellyfin IMDb library index
    -> Jellyfin PlaybackInfo for the matched movie
    -> one C4K candidate per Jellyfin MediaSource
    -> C4K quality ranking
    -> signed C4K media relay URL
    -> Jellyfin static stream with server-side token
```

## Why a relay is required

Jellyfin media endpoints require authenticated access. Putting the Jellyfin token into a Stremio stream URL would expose the token to the client, browser history, logs or other URL observers.

C4K therefore returns URLs shaped like:

```text
https://addon.c4k.live/media/jellyfin/{itemId}/{mediaSourceId}?expires=...&signature=...
```

The signature is HMAC-SHA256 and covers:

- Jellyfin item id
- Jellyfin media-source id
- expiry timestamp

The relay validates the signature and expiry, then requests the Jellyfin static video stream with the Jellyfin token in a server-side request header.

The relay never puts the Jellyfin token into the public stream URL.

## Range requests

Video playback depends on HTTP byte ranges. The relay forwards these request headers when present:

- `Range`
- `If-Range`
- `If-None-Match`
- `If-Modified-Since`

It forwards these response headers when present:

- `Accept-Ranges`
- `Cache-Control`
- `Content-Length`
- `Content-Range`
- `Content-Type`
- `ETag`
- `Last-Modified`

The normal add-on request rate limiter does not apply to `/media/` because a player may issue many range requests during normal playback. Network-level abuse protection should be applied separately at the deployment layer.

## Library lookup

Stremio supplies an IMDb-style id such as `tt1234567`.

Jellyfin does not provide a reliable exact provider-id lookup through the standard item query, so C4K builds an in-memory map of Jellyfin movies that have IMDb provider IDs.

The provider queries Jellyfin `/Items` in pages and requests:

```text
Recursive=true
IncludeItemTypes=Movie
Fields=ProviderIds
HasImdbId=true
EnableImages=false
EnableUserData=false
EnableTotalRecordCount=true
```

The resulting `ProviderIds.Imdb` values are indexed by lowercase IMDb id. The index is cached for five minutes by default.

Relevant controls:

```text
C4K_JELLYFIN_CACHE_MS
C4K_JELLYFIN_PAGE_SIZE
C4K_JELLYFIN_SCAN_MAX_ITEMS
C4K_JELLYFIN_TIMEOUT_MS
```

## Playback metadata

After an IMDb match, C4K requests Jellyfin PlaybackInfo for that item and converts each returned `MediaSource` into a C4K candidate.

C4K uses Jellyfin-probed metadata for:

- width and height
- video codec
- bit depth
- media bitrate
- file size
- Dolby Vision / HDR range information
- audio codec and spatial-audio information
- Jellyfin 3D format

This allows C4K to rank the actual media versions available in the authorised library.

## Source provenance and IMAX

Jellyfin can probe technical media properties, but source provenance such as `UHD Blu-ray Remux` versus `WEB-DL` cannot be established safely from codec/bitrate alone. The same applies to IMAX presentation claims.

C4K therefore does not infer those claims from filenames.

An operator who has verified the source can add Jellyfin tags:

```text
c4k:source=uhd-bluray-remux
c4k:presentation=imax-1.90
```

Accepted source values:

```text
uhd-bluray-remux
uhd-bluray-encode
bluray-remux
web-dl
bluray-encode
web-rip
direct-stream
unknown
```

Accepted presentation values:

```text
imax-1.90
imax-1.43
imax-variable
imax-enhanced
```

If no source tag is present, the candidate is classified as `direct-stream` rather than guessing provenance.

## 3D mapping

Jellyfin's 3D metadata maps to C4K as follows:

| Jellyfin | C4K |
|---|---|
| `MVC` | `mvc` |
| `FullSideBySide` | `full-sbs` |
| `HalfSideBySide` | `half-sbs` |
| `FullTopAndBottom` | `top-bottom` |
| `HalfTopAndBottom` | `top-bottom` |

MVC receives the strongest 3D-profile weighting in the existing quality engine.

## Required environment

Minimum:

```dotenv
C4K_SOURCE_PROVIDER=jellyfin
C4K_JELLYFIN_URL=https://jellyfin.example.com
C4K_JELLYFIN_TOKEN=...
C4K_ADDON_PUBLIC_URL=https://addon.c4k.live
C4K_MEDIA_RELAY_SECRET=...
```

Optional:

```dotenv
C4K_JELLYFIN_USER_ID=
C4K_JELLYFIN_CACHE_MS=300000
C4K_JELLYFIN_PAGE_SIZE=200
C4K_JELLYFIN_SCAN_MAX_ITEMS=20000
C4K_JELLYFIN_TIMEOUT_MS=8000
C4K_MEDIA_RELAY_TTL_SECONDS=21600
```

Production requires HTTPS for both C4K's public URL and the Jellyfin base URL. Localhost HTTP is accepted only outside production.

## Deployment consequence

The signed relay keeps credentials private, but it also means media bytes pass through the C4K add-on service. That has operational consequences:

- bandwidth is consumed by the C4K service
- long-lived HTTP connections must be supported
- byte ranges must not be buffered incorrectly by a reverse proxy
- serverless platforms with short request-duration or response-size limits may be a poor fit for full movie playback

For a personal or household Jellyfin integration, the most efficient deployment is normally a persistent Node service close to the Jellyfin server, with `addon.c4k.live` reverse-proxied to it.

A future design can add a separate trusted-edge or same-host deployment mode, but it must not reintroduce access tokens into public Stremio URLs.

## Current boundaries

Implemented:

- movie IMDb lookup
- multiple Jellyfin MediaSources
- probed technical metadata mapping
- quality ranking through the existing C4K engine
- signed relay URLs
- HTTP range forwarding
- configurable cache and scan limits
- explicit source/IMAX tags

Not yet implemented:

- Plex adapter
- TV series / episode mapping
- per-user `/configure` UI
- persistent encrypted credential store
- device-specific playback compatibility profiles
- relay bandwidth metrics
- distributed cache for multi-instance deployments
