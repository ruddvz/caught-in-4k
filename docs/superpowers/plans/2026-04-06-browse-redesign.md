# Browse Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the approved Cinema Stage redesign across Home, Discover, Library, Meta Details, Profiles, and Settings while replacing Canon/satisfaction browse UI with a three-source ratings and consensus system.

**Architecture:** Introduce one shared external-ratings extraction helper and one route-gated browse-ratings presentation pattern first, then apply the new visual language through shared browse components only where the approved routes opt into it. Keep Player compact MetaPreview behavior visually stable, keep Meta Details stream logic frozen, and preserve existing in-progress user edits by limiting that phase to presentation and layout work with a pre-edit dirty-worktree checkpoint.

**Tech Stack:** React 18, TypeScript, JavaScript, LESS modules, Jest, Webpack 5

---

## File Map

### Shared ratings and browse shell

- Modify: `src/components/MainNavBars/MainNavBars.tsx`
- Modify: `src/components/MainNavBars/MainNavBars.less`
- Modify: `src/components/NavBar/TopNavigationBar/TopNavigationBar.tsx`
- Modify: `src/components/NavBar/TopNavigationBar/styles.less`
- Modify: `src/components/MetaItem/MetaItem.js`
- Modify: `src/components/MetaItem/styles.less`
- Modify: `src/components/MetaRow/MetaRow.js`
- Modify: `src/components/MetaRow/styles.less`
- Modify: `src/components/MetaPreview/MetaPreview.js`
- Modify: `src/components/MetaPreview/styles.less`
- Create: `src/common/externalRatings.js`
- Create: `tests/externalRatings.spec.js`

### Home

- Modify: `src/routes/Board/Board.js`
- Modify: `src/routes/Board/HeroShelf/HeroShelf.js`
- Modify: `src/routes/Board/HeroShelf/styles.less`

### Discover and Library

- Modify: `src/routes/Discover/Discover.js`
- Modify: `src/routes/Discover/styles.less`
- Modify: `src/routes/Library/Library.js`
- Modify: `src/routes/Library/styles.less`

### Meta Details

- Modify: `src/routes/MetaDetails/MetaDetails.js`
- Modify: `src/routes/MetaDetails/styles.less`
- Modify: `src/routes/MetaDetails/StreamsList/styles.less`
- Modify: `src/routes/MetaDetails/StreamsList/Stream/styles.less`
- Modify only if needed for layout hooks, no logic changes: `src/routes/MetaDetails/StreamsList/StreamsList.js`
- Modify only if needed for class hooks, no logic changes: `src/routes/MetaDetails/StreamsList/Stream/Stream.js`

### Profiles and Settings

- Modify: `src/routes/Profiles/Profiles.js`
- Modify: `src/routes/Profiles/styles.less`
- Modify: `src/routes/Settings/Settings.tsx`
- Modify: `src/routes/Settings/Settings.less`
- Modify: `src/routes/Settings/General/General.less`
- Modify: `src/routes/Settings/ProfileManagement/ProfileManagement.less`
- Modify: `src/routes/Settings/Player/Player.less`
- Modify: `src/routes/Settings/components/Category/Category.less`
- Modify: `src/routes/Settings/components/Option/Option.less`
- Modify: `src/routes/Settings/components/Section/Section.less`

### Cleanup

- Modify: `src/services/CanonTakesQueue/CanonTakesQueue.js`
- Modify: `src/services/BackgroundAgents/C4KBackgroundAgents.js`

## Task 1: Build Shared Ratings Logic

**Files:**
- Create: `src/common/externalRatings.js`
- Test: `tests/externalRatings.spec.js`
- Modify: `src/components/MetaPreview/MetaPreview.js`

- [ ] Step 1: Write failing Jest tests for ratings extraction, weighting, re-normalization, disagreement penalties, and verdict labels.
- [ ] Step 2: Run the new test file and confirm failures are about missing helper exports.
- [ ] Step 3: Implement `externalRatings.js` with supported-source extraction, normalization, consensus calculation, and compact/full presentation helpers.
- [ ] Step 4: Re-run the ratings tests until they pass.
- [ ] Step 5: Wire MetaPreview to the new helper without changing the separate like/love ratings control.
- [ ] Step 6: Introduce explicit MetaPreview variants so the three cases stay separate: browse compact preview, Meta Details cinematic preview, and unchanged Player SideDrawer compact preview.

## Task 2: Upgrade Shared Browse Chrome Safely

**Files:**
- Modify: `src/components/MainNavBars/MainNavBars.tsx`
- Modify: `src/components/MainNavBars/MainNavBars.less`
- Modify: `src/components/NavBar/TopNavigationBar/TopNavigationBar.tsx`
- Modify: `src/components/NavBar/TopNavigationBar/styles.less`
- Modify: `src/components/MetaItem/MetaItem.js`
- Modify: `src/components/MetaItem/styles.less`
- Modify: `src/components/MetaRow/MetaRow.js`
- Modify: `src/components/MetaRow/styles.less`

- [ ] Step 1: Apply the new floating browse shell and premium nav treatment with route-scoped classes so only approved routes opt into the redesign.
- [ ] Step 2: Add compact rating-badge rules to shared card components in an opt-in way so Search results can remain visually stable.
- [ ] Step 3: Restyle rails and cards for the new spacing, focus, and image treatment only where browse routes opt in.
- [ ] Step 4: Smoke-check Search, Addons, Calendar, and SettingsShortcuts because they share `MainNavBars` and/or shared row components.

## Task 3: Replace Home Hero Canon and Meter UI

**Files:**
- Modify: `src/routes/Board/Board.js`
- Modify: `src/routes/Board/HeroShelf/HeroShelf.js`
- Modify: `src/routes/Board/HeroShelf/styles.less`

- [ ] Step 1: Remove Home browse queue usage and hero-level Canon Take generation from the Board/HeroShelf path.
- [ ] Step 2: Replace hero rating parsing with the shared ratings helper and new three-card plus consensus presentation.
- [ ] Step 3: Restyle the hero into the approved Cinema Stage composition.
- [ ] Step 4: Smoke-check that the Home route still renders without Canon or satisfaction widgets.

## Task 4: Apply Redesign to Discover and Library

**Files:**
- Modify: `src/routes/Discover/Discover.js`
- Modify: `src/routes/Discover/styles.less`
- Modify: `src/routes/Library/Library.js`
- Modify: `src/routes/Library/styles.less`

- [ ] Step 1: Update route shells to align with the new nav and spacing system.
- [ ] Step 2: Apply the new compact preview and card treatment.
- [ ] Step 3: Quiet and refine filter chrome without changing route data hooks.
- [ ] Step 4: Verify route interactions still work and no extra scrolling regressions are introduced.

## Task 5: Recompose Meta Details Safely

**Files:**
- Modify: `src/components/MetaPreview/MetaPreview.js`
- Modify: `src/components/MetaPreview/styles.less`
- Modify: `src/routes/MetaDetails/MetaDetails.js`
- Modify: `src/routes/MetaDetails/styles.less`
- Modify: `src/routes/MetaDetails/StreamsList/styles.less`
- Modify: `src/routes/MetaDetails/StreamsList/Stream/styles.less`
- Modify only if needed for layout hooks, no logic changes: `src/routes/MetaDetails/StreamsList/StreamsList.js`
- Modify only if needed for class hooks, no logic changes: `src/routes/MetaDetails/StreamsList/Stream/Stream.js`

- [ ] Step 1: Inspect the current uncommitted changes in `MetaDetails.js`, `StreamsList.js`, `Stream.js`, and `resolveStreamLaunchTarget.js` before editing.
- [ ] Step 2: If planned UI edits overlap active user logic changes in those files, stop and ask before proceeding.
- [ ] Step 3: Rework MetaPreview into the new cinematic detail header with the full ratings strip and consensus block.
- [ ] Step 4: Remove Canon Take and satisfaction meter usage from MetaPreview.
- [ ] Step 5: Update Meta Details page layout and supporting panel styles only.
- [ ] Step 6: Avoid logic edits in `StreamsList.js`, `Stream.js`, and `resolveStreamLaunchTarget.js` unless a purely presentational class hook is unavoidable.
- [ ] Step 7: Re-run stream-launch tests after Meta Details styling is complete.

## Task 6: Polish Profiles and Settings

**Files:**
- Modify: `src/routes/Profiles/Profiles.js`
- Modify: `src/routes/Profiles/styles.less`
- Modify: `src/routes/Settings/Settings.tsx`
- Modify: `src/routes/Settings/Settings.less`
- Modify: `src/routes/Settings/General/General.less`
- Modify: `src/routes/Settings/ProfileManagement/ProfileManagement.less`
- Modify: `src/routes/Settings/Player/Player.less`
- Modify: `src/routes/Settings/components/Category/Category.less`
- Modify: `src/routes/Settings/components/Option/Option.less`
- Modify: `src/routes/Settings/components/Section/Section.less`

- [ ] Step 1: Restyle Profiles to match the darker premium shell while preserving selection and PIN behavior.
- [ ] Step 2: Restyle Settings into grouped, calmer device-style panels.
- [ ] Step 3: Preserve existing keyboard and directional focus behavior in Profiles and Settings.
- [ ] Step 4: Verify Terms/Privacy footer and settings controls remain usable.

## Task 7: Remove Browse-Only Canon Background Work

**Files:**
- Modify: `src/services/CanonTakesQueue/CanonTakesQueue.js`
- Modify: `src/services/BackgroundAgents/C4KBackgroundAgents.js`

- [ ] Step 1: Remove or disable browse-surface queue entry points that no longer feed any UI.
- [ ] Step 2: Confirm no browse routes still import or use Canon queueing or satisfaction background metrics.
- [ ] Step 3: Verify app startup still succeeds after cleanup.

## Task 8: Verify the Redesign

**Files:**
- Test: `tests/externalRatings.spec.js`
- Test: `tests/streamLaunchTarget.spec.js`
- Verify shared browse files touched above

- [ ] Step 1: Run `rtk npm test -- externalRatings.spec.js streamLaunchTarget.spec.js` and confirm both suites pass.
- [ ] Step 2: Run `rtk npm test` and confirm the existing browse-related suites stay green.
- [ ] Step 3: Run `rtk npm run build` and fix any compile or type errors introduced by the redesign.
- [ ] Step 4: Manually review Home, Discover, Library, Meta Details, Profiles, Settings, Search chrome, Addons shell, Calendar shell, and SettingsShortcuts shell at mobile, tablet, and large desktop/TV widths.
- [ ] Step 5: Confirm zero-source, one-source, two-source, and three-source rating states render correctly, including fixed source-card order and compact-badge fallback behavior.
- [ ] Step 6: Confirm keyboard and focus behavior for nav, Profiles, Settings, Discover, and Meta Details remains coherent.
- [ ] Step 7: Confirm the Player SideDrawer compact MetaPreview remains visually stable.
- [ ] Step 8: Confirm no Canon Take or satisfaction browse UI remains.

## Notes

- Do not commit in this session unless the user explicitly asks for git commits.
- Treat the current dirty worktree in Meta Details as merge-sensitive state, not as disposable code.
- Prefer additive style and composition changes over route-logic rewrites.