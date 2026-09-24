# C4K Stremio add-on

Quality-first Stremio stream resolver for authorised movie libraries.

## Local start

```bash
cp .env.example .env
pnpm addon:start
```

Then inspect:

```text
http://localhost:7000/manifest.json
http://localhost:7000/stream/movie/tt1234567.json
http://localhost:7000/health
```

Focused checks:

```bash
pnpm lint:addon
pnpm test:addon
```

## Jellyfin provider

Minimum local configuration:

```dotenv
C4K_SOURCE_PROVIDER=jellyfin
C4K_JELLYFIN_URL=http://localhost:8096
C4K_JELLYFIN_TOKEN=your-jellyfin-token
C4K_MEDIA_RELAY_SECRET=replace-with-a-long-random-secret
C4K_QUALITY_PROFILE=absolute
```

For production also set:

```dotenv
C4K_ADDON_PUBLIC_URL=https://addon.c4k.live
C4K_JELLYFIN_URL=https://your-jellyfin.example
```

C4K scans the Jellyfin movie library for IMDb provider IDs, caches that lookup, fetches the matched Jellyfin item for full metadata, obtains Jellyfin playback metadata, and ranks each available media source.

The Jellyfin access token is never embedded in the Stremio stream URL. C4K returns a signed, short-lived `/media/jellyfin/...` URL and relays byte-range requests to Jellyfin with the token kept on the server.

Jellyfin-probed metadata is used directly for resolution, codec, bit depth, HDR/Dolby Vision, bitrate, audio and 3D information.

## Plex provider

Minimum local configuration:

```dotenv
C4K_SOURCE_PROVIDER=plex
C4K_PLEX_URL=http://localhost:32400
C4K_PLEX_TOKEN=your-plex-token
C4K_MEDIA_RELAY_SECRET=replace-with-a-long-random-secret
C4K_QUALITY_PROFILE=absolute
```

For production also set:

```dotenv
C4K_ADDON_PUBLIC_URL=https://addon.c4k.live
C4K_PLEX_URL=https://your-plex.example
```

C4K scans Plex movie metadata for IMDb `Guid` values, caches that lookup, loads the matched movie's `Media`, `Part` and `Stream` metadata, then ranks each supported media version.

The Plex token stays server-side. C4K returns a signed `/media/plex/...` relay URL that is restricted to the exact Plex media `Part` path that was signed. Arbitrary Plex API paths are rejected.

C4K currently skips a Plex media version when it contains multiple `Part` entries. Returning only one part would produce an incomplete movie, so multi-part playback remains unsupported until C4K has an explicit concatenation/playback strategy.

## Verified source and IMAX labels

C4K deliberately does not infer source provenance or IMAX presentation from filenames for either Jellyfin or Plex. If the library owner has verified those facts, use the following metadata.

For Jellyfin, add Tags. For Plex, add Labels.

```text
c4k:source=uhd-bluray-remux
c4k:presentation=imax-1.90
```

Supported source values:

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

Supported presentation values:

```text
imax-1.90
imax-1.43
imax-variable
imax-enhanced
```

Without the required provider URL, provider token and relay secret, the selected personal-library provider intentionally returns no candidates.

## Generic source-index provider

The original provider contract remains available:

```dotenv
C4K_SOURCE_PROVIDER=index
C4K_SOURCE_INDEX_URL=https://your-authorised-index.example/api/candidates
C4K_ALLOWED_MEDIA_HOSTS=media.example.com,cdn.example.com
C4K_QUALITY_PROFILE=absolute
```

Without both `C4K_SOURCE_INDEX_URL` and `C4K_ALLOWED_MEDIA_HOSTS`, the generic index provider intentionally returns:

```json
{
  "streams": []
}
```

For the shared source contract, ranking vocabulary, deployment shape and security decisions, see [`docs/architecture/C4K_STREMIO_ADDON.md`](../docs/architecture/C4K_STREMIO_ADDON.md).

Provider-specific architecture:

- [`C4K_JELLYFIN_PROVIDER.md`](../docs/architecture/C4K_JELLYFIN_PROVIDER.md)
- [`C4K_PLEX_PROVIDER.md`](../docs/architecture/C4K_PLEX_PROVIDER.md)
