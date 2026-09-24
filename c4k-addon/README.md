# C4K Stremio add-on

Quality-first Stremio stream resolver for authorised movie libraries.

## Local start

```bash
cp .env.example .env
node c4k-addon/server.js
```

Then inspect:

```text
http://localhost:7000/manifest.json
http://localhost:7000/stream/movie/tt1234567.json
http://localhost:7000/health
```

## Jellyfin provider

This is the first built-in authorised-library adapter.

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

C4K scans the Jellyfin movie library for IMDb provider IDs, caches that lookup, obtains Jellyfin playback metadata for the matching movie, and ranks each available media source.

The Jellyfin access token is never embedded in the Stremio stream URL. C4K returns a signed, short-lived `/media/jellyfin/...` URL and relays byte-range requests to Jellyfin with the token kept on the server.

Jellyfin-probed metadata is used directly for resolution, codec, bit depth, HDR/Dolby Vision, bitrate, audio and 3D information.

C4K deliberately does not infer source provenance or IMAX presentation from filenames. If a library owner has verified those facts, add Jellyfin tags to the movie:

```text
c4k:source=uhd-bluray-remux
c4k:presentation=imax-1.90
```

Supported source tags:

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

Supported presentation tags:

```text
imax-1.90
imax-1.43
imax-variable
imax-enhanced
```

Without the required Jellyfin URL, token and relay secret, the stream endpoint intentionally returns no Jellyfin candidates.

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

For the source contract, ranking vocabulary, deployment shape and security decisions, see [`docs/architecture/C4K_STREMIO_ADDON.md`](../docs/architecture/C4K_STREMIO_ADDON.md).
