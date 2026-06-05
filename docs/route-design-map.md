# Route Design Map — C4K iOS PWA

| Route | Mobile nav parent | Primary user goal | UI states | Owner component |
|---|---|---|---|---|
| Board | Home | Find something to watch | loading/empty/error/offline | `Board` |
| Search | Search | Search title/person/genre | loading/empty/error/recent | `Search` |
| Discover | Search | Browse filtered catalogs | loading/empty/filter | `Discover` |
| MetaDetails | (content) | Decide/watch | loading/error/skeleton | `MetaDetails` |
| Player | Immersive | Watch content | buffering/error/subtitles | `Player` |
| Library | Library | Resume/manage saved | empty/offline | `Library` |
| Addons | Addons | Manage sources | install/error | `Addons` |
| Settings | Profile | Preferences/account | saved/error | `Settings` |
| Profiles | Profile | Switch profile | empty/error | `Profiles` |
| Subscribe | Profile | Upgrade | processing/error | `Subscribe` |
| Admin | Profile | Manage app | auth/error | `Admin` |
| Calendar | Profile | Releases schedule | empty | `Calendar` |
| Intro | (none) | Onboarding | loading | `Intro` |
| Tos / Privacy | Profile | Legal | — | `Tos`, `PrivacyPolicy` |
| NotFound | — | Recovery | — | `NotFound` |

Bottom tabs (iPhone): **Home · Search · Library · Addons · Profile**

Not in bottom nav: MetaDetails, Player, Discover (under Search), Calendar (under Profile), Admin, Subscribe, legal pages.
