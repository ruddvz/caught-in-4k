// Copyright (C) 2026 Caught in 4K
//
// Aggregated Stremio setup-guide content, faithfully condensed from the
// community guides — Viren070's Guides (https://guides.viren070.me/stremio) and
// the numb3rs "Perfect Setup" guide (https://numb3rs.stream). Rendered by the
// paywalled Guide hub.
//
// Affiliate/referral codes from the source guides have been stripped from URLs
// so links point to clean canonical pages.
//
// Shape per section:
//   { id, title, intro, steps: string[], notes: string[], links: [{ label, url }] }

const GUIDE_CONTENT = [
    {
        id: 'beginner-concepts',
        title: 'Beginner Concepts',
        intro: 'Stremio is a media-center app that unifies discovery and playback, but it provides no content itself — catalogs, metadata and playable streams all come from add-ons you install. A debrid service can act as a fast, reliable middle-man for streaming.',
        steps: [
            'Stremio is a media player and aggregator: search a title once and it shows the title page (metadata, seasons, episodes) plus available streams. It is account-based, so your add-ons and library sync to any device you sign in on.',
            'Add-ons are the extension mechanism. They provide one or more of: Catalogs (home-screen rows), Metadata (details, artwork, ratings) and Streams (playable links). Two people can have completely different experiences depending on their add-ons.',
            'Torrenting is peer-to-peer: your client downloads file pieces from a swarm of seeders, so playback quality depends on swarm health. Weak swarms mean buffering and failures.',
            'A debrid service fetches torrents (and hoster links) on its own infrastructure and serves them to you over standard HTTPS. The key benefit is caching: a cached file starts fast and streams stably without depending on peers.',
            'Stream types in short — DEBRID: paid, fastest, safest, most reliable. P2P: free but slower and riskier depending on your country. HTTP: free and safe but slower / less reliable than debrid.',
            'Cinemeta is Stremio’s default, non-removable metadata provider. Aggregation add-ons like AIOStreams layer on top to give cleaner, de-duplicated results.',
        ],
        notes: [
            'A debrid service is optional — most torrent add-ons work without one if there are enough seeders. With debrid or HTTP streams you are generally safe and do not need a VPN.',
            'A debrid service cannot increase your own download speed. If your internet is already slow, debrid will not let you stream higher quality.',
            'Most debrid services restrict usage to one public IP at a time, with exceptions (e.g. TorBox, Premiumize).',
        ],
        links: [
            { label: 'Stremio Web', url: 'https://web.stremio.com/' },
            { label: 'Add-on status page', url: 'https://status.stremio-status.com/' },
        ],
    },
    {
        id: 'install-stremio',
        title: 'Install Stremio',
        intro: 'Create a Stremio account and install the app (or use Stremio Web). Do the initial setup once on a desktop/laptop and your account syncs add-ons and library to every other device you sign in on.',
        steps: [
            'Do the initial setup on a laptop or desktop. Once set up, logging in with the same account on any device syncs your configuration automatically.',
            'Create a Stremio account at stremio.com — sign up with an email or log in through Facebook.',
            'Download the correct installer for your device from the Stremio download page and install it. Device-specific instructions exist for Desktop, Mobile, TV, VR and more.',
            'Alternatively use Stremio Web in a browser with no installation. Important: be signed in at web.stremio.com (not just www.stremio.com) to install or remove add-ons.',
            'Configure settings: turn on hardware-accelerated decoding to avoid playback crashes. If you plan to torrent, set the torrent profile to Ultra Fast and cache size to 10GB or infinite. (Skip if these do not appear on your device.)',
            'Remove unneeded pre-installed add-ons (e.g. WatchHub, YouTube, Public Domain Movies) from the Add-ons page. Cinemeta and Local Files cannot be removed.',
        ],
        notes: [
            'Supported platforms include Windows, macOS, Linux; Android phones/tablets; iPhone/iPad; Android TV / Google TV; Fire TV; Samsung (2019+), LG (2020+), Hisense, Philips and Sony TVs; Steam Deck; Raspberry Pi 4/5; Meta Quest; Apple Vision Pro; and Stremio Web.',
            'Stremio (Lite) on the iOS App Store does not support torrent streaming but still works with debrid services. iPhone/iPad may currently require sideloading or Stremio Web.',
            'Do not confuse www.stremio.com (account management) with web.stremio.com (where you must be signed in to install/remove add-ons). Being signed in to one does not sign you in to the other.',
        ],
        links: [
            { label: 'Stremio', url: 'https://www.stremio.com/' },
            { label: 'Sign up', url: 'https://www.stremio.com/register' },
            { label: 'Login', url: 'https://www.stremio.com/login' },
            { label: 'Download page', url: 'https://www.stremio.com/downloads' },
            { label: 'Stremio Web', url: 'https://web.stremio.com/' },
        ],
    },
    {
        id: 'choose-debrid',
        title: 'Choose a Debrid Service',
        intro: 'A debrid service downloads torrents to its own high-speed servers so you can stream over HTTPS without buffering or exposing your IP. The guides cover Real-Debrid, TorBox, Premiumize, AllDebrid, Debrid-Link and Put.io. After subscribing, you copy an API key to plug into your add-ons.',
        steps: [
            'Compare providers on cost, cache size, server proximity (run their speed tests) and extra features. Real-Debrid has the largest cache; Premiumize is the most stable with an accurate cache indicator; TorBox is cheaper, improving fast, has accurate cache indicators and no IP restrictions.',
            'Pick based on use: Real-Debrid for a single user wanting the best chance of instant play from a large cache; TorBox for multiple people/screens at once (Essential up to 3 parallel connections, Pro up to 10). Some users run both — TorBox as main, Real-Debrid as a backup cache.',
            'Real-Debrid: sign up, go to Premium Offers, choose a package and subscribe. Get the key on the apitoken page and copy it.',
            'TorBox: sign up, verify your email, go to Subscription and choose a package (yearly = best value; Usenet and 30-day seeding need Pro). Get the key under Settings > API Key and click Copy API Key.',
            'AllDebrid: create an account, go to Pricing, choose a package and subscribe. Create a named key on the apikeys page and copy it.',
            'Premiumize: sign up, click Buy Premium, choose a package. Get the key on the account page under Account Data > API Key.',
            'Debrid-Link: register, click Premium, choose a package. Get the key on the API Key page (reveal key, confirm password).',
            'Put.io: register and activate via billing, choose a 100GB or 1TB plan. On the API page click Create App; for Torrentio you need both the Client ID and OAuth token.',
        ],
        notes: [
            'One-connection rule: most debrid services allow only one public IP at a time. Real-Debrid allows only one connection — you cannot watch on two+ devices simultaneously on the same key (risk of a ban). Devices on the same home Wi-Fi share one public IP, so they count as one. TorBox and Premiumize allow multiple IPs.',
            'Real-Debrid, AllDebrid and Debrid-Link removed the API that lets add-ons check if a torrent is cached, so cache indicators on these are educated guesses. Real-Debrid’s huge cache makes this minor; AllDebrid is not recommended.',
            'Real-Debrid has no recurring payment (renew manually). Renewing after expiry regenerates your API token, so you must reconfigure add-ons with the new token.',
            'Free/trial options: TorBox has a limited free plan and a $1 24-hour Pro trial; AllDebrid a 7-day trial with phone verification; Put.io a $0.99 1-day trial. Most also offer a 15-day package for testing.',
        ],
        links: [
            { label: 'Real-Debrid', url: 'https://real-debrid.com/' },
            { label: 'Real-Debrid API token', url: 'https://real-debrid.com/apitoken' },
            { label: 'TorBox', url: 'https://torbox.app/' },
            { label: 'TorBox subscription', url: 'https://torbox.app/subscription' },
            { label: 'TorBox settings', url: 'https://torbox.app/settings' },
            { label: 'AllDebrid', url: 'https://alldebrid.com/' },
            { label: 'AllDebrid API keys', url: 'https://alldebrid.com/apikeys' },
            { label: 'Premiumize', url: 'https://www.premiumize.me/' },
            { label: 'Premiumize account', url: 'https://www.premiumize.me/account' },
            { label: 'Debrid-Link', url: 'https://debrid-link.com/' },
            { label: 'Put.io', url: 'https://put.io/' },
        ],
    },
    {
        id: 'install-addons',
        title: 'Install Add-ons',
        intro: 'Stream-provider add-ons supply the playable links. Install them from their configuration pages, enter your debrid API key where prompted, then install into Stremio. Less is more — enough add-ons to find content, not so many that results get cluttered.',
        steps: [
            'Browse add-ons via the in-app Community tab or the community list at stremio-addons.net. Know the types: torrent, HTTP, debrid and Usenet (an add-on with both torrent and debrid icons works with or without a debrid service).',
            'Recommended general stream-provider add-ons: StremThru Torz, Comet and Torrentio. (Install Torrentio from its own configuration page; the outdated "torrentio-sh" should not be used.)',
            'Open an add-on’s configuration page, choose your streaming provider / enter your debrid API key in the Token field, set quality and sorting preferences, then click Install.',
            'Example (MediaFusion): on the configure page set Streaming Provider, paste your debrid API key in the Token field, configure catalogs and preferences, then click Install.',
            'Example (TorBox add-on, TorBox only): from the TorBox dashboard go to Settings > integrations, click Access Stremio Addon, then configure it on the TorBox website (no reinstall needed after changes).',
            'Install order matters — Stremio displays catalogues in install order and there is no in-app reorder (use the unofficial Stremio Addon Manager to reorder without reinstalling).',
            'To change an add-on’s config without reinstalling, click its cogwheel, change settings and install again (then uninstall the old copy to avoid duplicates).',
        ],
        notes: [
            'On iPhone or Stremio Web, use the manual method: get the add-on’s manifest URL (Copy URL, or right-click the install button > Copy link), replace stremio:// with https://, then add it.',
            'If using multiple debrid services in one add-on, rank them by preference; the add-on prefers higher-ranked services during de-duplication.',
            'A clean way to combine several add-ons into one de-duplicated list is AIOStreams (see the next section).',
        ],
        links: [
            { label: 'Community add-on list', url: 'https://stremio-addons.net/' },
            { label: 'Torrentio', url: 'https://torrentio.strem.fun/' },
            { label: 'MediaFusion configure', url: 'https://mediafusion.elfhosted.com/configure' },
        ],
    },
    {
        id: 'aiostreams',
        title: 'AIOStreams — All-in-One',
        intro: 'AIOStreams (by Viren070) combines multiple stream-provider add-ons and debrid services into one unified, de-duplicated, consistently sorted results list. The numb3rs guide recommends configuring it via an importable template for a fast setup.',
        steps: [
            'Choose a public AIOStreams instance and open its configuration page. Do NOT use the ElfHosted instance if you need Torrentio (it does not work there); pick a non-Nightly instance as a beginner, and stick with one instance (config is stored per-instance).',
            'Template method: on Save & Install, click Import > Import Template, paste the template link, click Go, then "Use this Template Now".',
            'In Services, add your debrid API keys (open each service’s cogwheel and enter its key); if using multiple, rank them by preference. Optionally add RPDB and a TMDB key. With no services, choose Skip for a P2P/HTTP setup.',
            'In Template Options set Formatter style, Preferred Languages, subtitles, anime/HTTP options and Global Timeout, then enter your API keys and Load Template. (Anime add-ons SeaDex/AnimeTosho and Debridio require a debrid service.)',
            'Manual method: in Addons, add scrapers from the Marketplace (recommended: Comet, MediaFusion, StremThru Torz; add the Official TorBox add-on if you use TorBox). Lowering each add-on’s timeout (e.g. 5s) speeds up results.',
            'In Filters, enable the Deduplicator (Group Handling = Single Result) and set Preferred Languages / Visual Tags. In Sorting, order criteria with Cached and Resolution high. In Formatter, pick a style.',
            'In Save & Install, set a password and click Create; store the UUID and password (this is your AIOStreams account). Click Install, or copy the Manifest URL to install manually.',
        ],
        notes: [
            'ALWAYS save in Save & Install > Save every time you change something. Most changes do not need a reinstall, but catalogue changes and adding your first add-on of a new resource type (e.g. first subtitle add-on) do.',
            'If saving fails with "Failed to fetch manifest" and/or "502 Bad Gateway", one or more add-ons are temporarily offline — disable the named add-ons in Installed Addons, save, and re-enable later.',
            'The official public AIOStreams instance does not allow Torrentio; you can wrap another public instance that has Torrentio enabled inside your main instance to get its results.',
            'If you use a debrid service and cannot torrent in your country, avoid opening links with the magnet (P2P) icon — they normally will not appear when a debrid is configured.',
        ],
        links: [
            { label: 'AIOStreams community page', url: 'https://stremio-addons.net/addons/aiostreams' },
            { label: 'AIOStreams docs', url: 'https://docs.aiostreams.viren070.me/' },
        ],
    },
    {
        id: 'player-quality',
        title: 'Player & Quality',
        intro: 'You control which resolutions, qualities, languages and subtitles appear and how streams are sorted — mostly within your stream add-ons (or AIOStreams). A few Stremio player settings also affect smooth playback.',
        steps: [
            'Enable hardware-accelerated decoding in Stremio’s advanced player settings to avoid crashes/buffering; if not using debrid, increase cache size and set the torrent profile to Ultra Fast.',
            'Set which resolutions show: keep all for maximum results, but deselect 4K on a slow connection or weak device; uncheck CAM/Screener if you do not want cinema recordings.',
            'Set sorting priority. With debrid, sort Cached > Resolution > Quality > Size (seeders are irrelevant); without debrid, sort by Resolution and Seeders since you rely on swarm health.',
            'Set language preferences: add your languages to Preferred Languages and order them; enable "Show Only Preferred Languages" to reduce clutter. Use Required Languages to show ONLY that language (note: untagged/"multi" streams get filtered out).',
            'To prioritise language above Quality/Resolution, in AIOStreams Sorting move Language to the top of both the Cached and Uncached lists.',
            'Set preferred visual tags (e.g. HDR/DV) — order matters, so put HDR before DV if you prefer HDR. Set min/max file size filters (leave wide to see all results).',
            'Configure subtitles via a subtitle add-on (e.g. OpenSubtitles V3 Pro inside AIOStreams) and set preferred subtitle languages; you can also drag your own subtitle file into the player.',
        ],
        notes: [
            'A debrid service lets you stream the highest-quality content (4K, DV, HDR, Dolby Atmos) without buffering — but only if your own internet connection can handle it.',
            'TorBox tip: cached links show as "Torbox (Instant)"; uncached download links show as just "Torbox", and cached results are always shown first.',
            'If your preferred (especially non-English) results are not appearing, raising Language Priority can rank lower-quality streams higher when your language is uncommon — use with caution.',
        ],
        links: [],
    },
    {
        id: 'troubleshooting',
        title: 'Configuration Q&A',
        intro: 'Most issues come down to add-on misconfiguration, a debrid token that needs refreshing, an add-on/service being temporarily down, or a device that cannot handle a specific stream. Here are the most common problems and fixes.',
        steps: [
            '"No streams were found": check your add-on config matches the guide; your ISP may be blocking the add-on (try a VPN or change DNS); confirm the title has a digital release (in-cinema titles only show CAM/Screener); for niche/uncached titles try Debrid Media Manager.',
            '"No addons were requested for streams": AIOStreams is not installed/configured correctly — make sure you installed it while signed in at web.stremio.com, and that Addons in AIOStreams actually lists enabled scrapers (if empty, the template did not load).',
            'Stuttering/buffering: run a speed test (and your debrid’s own speed test); toggle hardware-accelerated decoding; if not on debrid, increase cache size and set torrent profile to Ultra Fast; pick a lower-quality stream if your device is weak.',
            'Red screen on a debrid stream: check your debrid subscription has not expired and the service is not down; if you renewed after expiry, your API token may have regenerated — refresh it and reconfigure your add-ons.',
            'Install button does nothing: the website cannot reach the app (you may not have the Stremio app installed, which also affects Stremio Web) — install the add-on manually via its manifest URL.',
            'Can only see "torrentio-sh" / only 4 providers: torrentio-sh is outdated — install the normal Torrentio from its configuration page.',
            'Playback quirks: content split → some Fire TV devices do not support DV profile 7, pick a non-DV-profile-7 link; audio but black screen → device cannot handle that stream, pick another; SSA subtitles are not supported by Stremio’s default player, use an external player.',
            'An add-on is not working: check the ElfHosted status page or r/StremioAddons; if it is down, wait for the developer; otherwise reinstall it (refresh the debrid token if the error is debrid-related).',
        ],
        notes: [
            'AIOStreams save error "Failed to fetch manifest" / "502 Bad Gateway" = an add-on is temporarily offline; disable the named add-ons, save to continue, re-enable later.',
            'Catalogs showing "Failed to fetch" or empty is often Trakt being down or rate-limiting — usually just wait, no reconfiguration needed.',
            'Results coming in too slowly: in AIOStreams set Addons > Addon Fetching Strategy to Dynamic; if it then misses good links, switch back to Default.',
        ],
        links: [
            { label: 'Change DNS resolution', url: 'https://blog.stremio.com/change-dns-resolution/' },
            { label: 'SamKnows speed test', url: 'https://samknows.com/realspeed/' },
            { label: 'ElfHosted status', url: 'https://status.elfhosted.com/' },
            { label: 'r/StremioAddons', url: 'https://reddit.com/r/StremioAddons/' },
        ],
    },
];

module.exports = { GUIDE_CONTENT };
