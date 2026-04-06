# Browse Redesign Design

Date: 2026-04-06
Scope: Home, Discover, Library, Meta Details, Profiles, Settings
Direction: Cinema Stage
Supersedes: earlier hero and satisfaction-meter direction documents for this browse redesign pass

## Goals

- Rebuild the browse experience around a more cinematic, premium visual system inspired by Apple TV.
- Remove Canon Take and the current satisfaction widgets entirely.
- Replace single-source rating emphasis with a three-source rating presentation and a more trustworthy aggregate verdict.
- Make the app feel like one cohesive product across hero, rails, detail pages, profile selection, and settings.

## Non-Goals

- No redesign of Player, Add-ons, Calendar, or Intro in this pass.
- No external third-party ratings integration beyond data already present in the existing metadata payload.
- No changes to streaming behavior, auth flows, or addon-management ergonomics in this phase.

## Design Principles

1. Cinematic first
   Larger artwork, cleaner composition, stronger focus states, and calmer chrome should make the app feel premium on large screens.

2. Premium over loud
   Keep light C4K personality in copy and accent use, but move away from the current louder Gen Z visual language.

3. Metadata should earn its space
   Details and ratings should feel editorial and intentional, not bolted-on widgets.

4. One system, not separate pages
   Shared spacing, surfaces, typography, and motion should connect browse pages, profile selection, and settings.

## Visual System

- Palette: near-black base, cool graphite surfaces, restrained glass overlays, warm gold and ice-blue accents.
- Typography: stronger contrast between display copy and utility copy; more breathing room; less all-caps noise.
- Surfaces: floating bars and layered panels instead of stacked glass cards everywhere.
- Motion: fewer generic transitions, more deliberate hero fades, rail focus elevation, and detail-panel reveals.

## Ratings and Verdict Model

### Canonical Ratings Contract

Create a shared helper for browse surfaces that extracts external critic/source ratings from metadata links without altering the existing user-feedback `Ratings` component.

Contract shape:

- `imdb`: `{ label: 'IMDb', value: number, display: string } | null`
- `rottenTomatoes`: `{ label: 'Rotten Tomatoes', value: number, display: string } | null`
- `metacritic`: `{ label: 'Metacritic', value: number, display: string } | null`
- `availableScores`: normalized numeric array in 0-100 format

Notes:

- This helper is the single source of truth for Home, Discover, Library, Meta Details, and compact preview surfaces.
- The existing `Ratings` thumbs-up / heart UI remains a separate user-action component and is not repurposed for critic-source data.
- No new network calls are introduced for ratings in this redesign.

### Source Cards

The primary ratings block uses three evenly spaced source cards in a fixed order:

1. IMDb
2. Rotten Tomatoes
3. Metacritic

Rationale:

- All three are broadly recognized.
- IMDb best represents mainstream audience familiarity.
- Rotten Tomatoes adds highly legible critic sentiment.
- Metacritic adds a stricter consensus signal.
- Existing code already parses these sources from metadata links, so implementation stays inside current data boundaries.

### Aggregate Consensus

The new aggregate score becomes `C4K Consensus`.

Normalization:

- IMDb: `rating * 10`
- Rotten Tomatoes: use percentage directly
- Metacritic: use score directly

Weighting:

- IMDb: 45%
- Rotten Tomatoes: 35%
- Metacritic: 20%

Adjustment:

- If there are at least two normalized scores, calculate `spread = max(scores) - min(scores)`.
- Apply a deterministic disagreement penalty based on spread:
   - `0` points when spread is `0-15`
   - `3` points when spread is `16-30`
   - `6` points when spread is `31-45`
   - `8` points when spread is `46+`
- This prevents one unusually high source from producing an inflated consensus.
- If only two sources are present, re-normalize weights across available sources.
- If only one source is present, show source cards only and suppress the consensus verdict.
- Final formula:
   - `weightedMean = sum(normalizedScore * normalizedWeight)`
   - `consensus = round(clamp(weightedMean - penalty, 0, 100))`
- If zero supported sources are present, show no consensus block and no empty placeholder.

### Verdict Labels

The existing five-tier copy is replaced with a more premium set while keeping `Absolute Cinema`.

- 90-100: Absolute Cinema
- 75-89: Must Watch
- 60-74: Worth Your Time
- 40-59: For Fans First
- 0-39: Skip This One

### Presentation Rules By Surface

- Hero and Meta Details use the full three-card ratings strip plus consensus verdict when two or more sources exist.
- Compact previews and cards do not show the full strip.
- Compact previews use a single premium rating block identical in rule-set to cards, but with room for the verdict label when consensus exists.
- Cards use a single compact badge:
   - consensus percentage when two or more sources exist
   - otherwise the strongest available single-source display
   - otherwise no rating badge
- This preserves cinematic cleanliness in rails while keeping the richer rating treatment for primary surfaces.

## Screen-Level Design

### Home

- Hero becomes a true cinematic stage with stronger background treatment and cleaner foreground content.
- Top navigation becomes a floating premium control bar rather than a dominant pill centerpiece.
- Carousels become more polished poster rails with clearer hierarchy, more confident spacing, and better focus/hover states.
- Board-specific visual clutter is reduced so the page feels wider and calmer.

### Discover and Library

- Filters and controls move toward quiet premium chrome.
- Grid and row items gain stronger image treatment and more consistent metadata layering.
- Side preview and detail preview styling align with the new detail-page language.

### Meta Details

- Redesign around a single cinematic top section instead of stacked widgets.
- The summary, actions, three source cards, consensus verdict, runtime, release information, and secondary metadata should read as one composition.
- Remove Canon Take and satisfaction meter blocks entirely.
- Secondary areas like episodes and streams should feel subordinate but visually connected.

### Search Boundary

- Search result layout remains out of scope in this phase.
- Search should inherit the updated top-navigation visual system only where shared shell components already apply it.
- No separate search-results redesign is included in this spec.

### Profiles

- Keep the current profile-selection concept.
- Improve card proportions, focus rings, active-state treatment, bottom controls, and overall TV-like polish.
- Preserve per-profile accent behavior while integrating it into the darker premium shell.

### Settings

- Replace the current utility dashboard feel with grouped, calmer device-style settings panels.
- Improve hierarchy between categories, labels, and controls.
- Use larger interactive targets and more deliberate spacing for remote/TV-style navigation.

## Implementation Shape

Shared system work should come first:

- browse shell spacing and surface tokens
- top navigation visual system
- hero-stage treatment
- rail and card styling
- rating consensus helpers and presentation components

Then apply that system to:

1. Home
2. Discover and Library
3. Meta Details
4. Profiles
5. Settings

## Behavior-Level Cleanup

- Remove Canon Take presentation from browse surfaces, including hero and MetaPreview usage.
- Remove direct Canon Take generation from Home hero behavior for this redesign pass.
- Remove or disable browse-surface queueing of Canon Takes and satisfaction metrics once no browse surfaces consume that data.
- Do not leave background AI generation running for removed UI.

## Meta Details Safety Boundaries

- Preserve the current functional behavior in `MetaDetails.js`, `StreamsList.js`, `Stream.js`, and `resolveStreamLaunchTarget.js`.
- This redesign may change layout, wrappers, visual grouping, and styles around those files, but it must not alter stream launch rules, stream actions, or other active in-progress logic without a separate scoped pass.
- Prefer presentational changes in shared preview components and LESS modules before touching route-level stream logic.
- Any edits in the Meta Details route shell must be applied as a careful merge against the existing dirty worktree state.

## Focus and Navigation Expectations

- Desktop and TV-style keyboard navigation must remain coherent after nav and settings redesign changes.
- Existing directional behavior in Profiles and Settings should be preserved unless the redesign explicitly improves the same behavior.
- Floating navigation must not create focus traps or break route-level keyboard flow.

## Candidate Files

- `src/components/MainNavBars/MainNavBars.tsx`
- `src/components/MainNavBars/MainNavBars.less`
- `src/components/NavBar/TopNavigationBar/TopNavigationBar.tsx`
- `src/routes/Board/HeroShelf/HeroShelf.js`
- `src/components/MetaRow/MetaRow.js`
- `src/components/MetaItem/MetaItem.js`
- `src/components/MetaItem/styles.less`
- `src/components/MetaPreview/MetaPreview.js`
- `src/components/MetaPreview/styles.less`
- `src/components/SatisfactionMeterBar/SatisfactionMeterBar.js`
- `src/components/SatisfactionMeterDial/SatisfactionMeterDial.js`
- `src/common/useSatisfactionMeter.ts`
- `src/common/CONSTANTS.js`
- `src/routes/MetaDetails/MetaDetails.js`
- `src/routes/MetaDetails/styles.less`
- `src/routes/MetaDetails/StreamsList/styles.less`
- `src/routes/MetaDetails/StreamsList/Stream/styles.less`
- `src/routes/Profiles/Profiles.js`
- `src/routes/Profiles/styles.less`
- `src/routes/Settings/Settings.tsx`
- `src/routes/Settings/Settings.less`
- `src/routes/Settings/General/General.tsx`
- `src/routes/Settings/General/General.less`
- `src/routes/Settings/ProfileManagement/ProfileManagement.tsx`
- `src/routes/Settings/ProfileManagement/ProfileManagement.less`
- `src/routes/Settings/Player/Player.tsx`
- `src/routes/Settings/Player/Player.less`
- `src/routes/Settings/components/**`
- `src/services/CanonTakesQueue/CanonTakesQueue.js`
- `src/services/BackgroundAgents/C4KBackgroundAgents.js`
- related LESS modules for the affected surfaces

## Verification Requirements

- Build must pass with zero new webpack or TypeScript errors.
- Existing browse-related tests must pass.
- New logic for rating aggregation should have unit coverage.
- UI must be reviewed at mobile-width, tablet-width, and large TV/desktop-width breakpoints.
- Existing user changes in MetaDetails and stream-list files must be preserved.
- Verify zero-source, one-source, two-source, and three-source rating states.
- Verify Search route chrome remains stable.
- Verify keyboard and remote-style focus behavior for nav, settings, and profiles.

## Open Decisions Resolved

- Direction selected: Cinema Stage
- Tone selected: mostly premium
- Lead priority selected: cinematic immersion
- Rating trio selected: IMDb, Rotten Tomatoes, Metacritic