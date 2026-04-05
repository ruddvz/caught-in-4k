# HIG Design Reference
## Based on Apple Human Interface Guidelines — Full Foundations, Patterns, Components

> This file translates the complete Apple HIG into practical, actionable design rules.
> Use it as a reference when designing any screen, component, or interaction.
> Organised by the same six sections Apple uses: Foundations, Patterns, Components, Inputs, Technologies, Platforms.

---

## SECTION 1 — FOUNDATIONS

The building blocks every interface must have before anything else.

---

### 1.1 Accessibility

Accessibility is not a feature — it is a quality bar. If it is not accessible it is not done.

**Contrast minimums (WCAG AA):**
- Normal text (< 18pt): minimum 4.5:1 contrast ratio against background
- Large text (≥ 18pt or 14pt bold): minimum 3:1
- UI components and icons: minimum 3:1
- Never rely on color alone to convey meaning — always pair with a label, icon, or pattern

**Touch target sizes:**
- Minimum tap target: 44×44pt on iOS regardless of visual size
- Spacing between targets: minimum 8pt to avoid mis-taps
- If a visual element is smaller than 44pt, increase the invisible hit area — not the visual

**Text:**
- Support Dynamic Type — never hard-code font sizes in a way that blocks user scaling
- Minimum body font size: 17pt (iOS), 13pt (macOS)
- Line length: 50–75 characters per line for optimal readability
- Never use text as an image for anything that needs to be read

**Motion:**
- Always respect `prefers-reduced-motion` — provide static alternatives for all animations
- Never make animation the only way to understand what happened
- Looping animations must have a way to pause

**Screen reader (VoiceOver / accessibility label) rules:**
- Every interactive element must have a meaningful accessibility label
- Images that convey meaning need alt text; decorative images get empty alt
- Custom controls must implement the correct accessibility role (button, slider, etc.)
- Focus order must match the visual reading order

---

### 1.2 App Icons

- Must be recognisable at every size from 16×16pt to 1024×1024pt
- Use a single, focused concept — not a collage of elements
- No transparency in the icon itself (the OS applies the corner radius mask)
- Provide light, dark, and tinted variants for iOS 18+
- Avoid text in icons — it becomes illegible at small sizes
- Test against both light and dark wallpapers
- Avoid similarity to other well-known app icons

---

### 1.3 Color

**Semantic color system (always use semantic colors, never raw hex in components):**

| Role | Light mode | Dark mode | Use for |
|------|-----------|-----------|---------|
| Label | Black | White | Primary text |
| Secondary label | 60% opacity | 60% opacity | Supporting text |
| Tertiary label | 30% opacity | 30% opacity | Placeholder text |
| System background | White | #1C1C1E | Page/screen background |
| Secondary background | #F2F2F7 | #2C2C2E | Grouped content, cards |
| Separator | 30% opacity black | 30% opacity white | Dividers |
| Accent / Tint | Blue #007AFF | Blue #0A84FF | Interactive elements, links |
| Destructive | Red #FF3B30 | Red #FF453A | Delete, remove actions |
| Success | Green #34C759 | Green #30D158 | Confirmation, success states |
| Warning | Yellow #FF9500 | Yellow #FF9F0A | Caution states |

**Color rules:**
- Never use the same color for two different semantic meanings on the same screen
- Primary actions: accent color (blue)
- Destructive actions: always red — never blue or green
- Disabled states: 30–40% opacity of the normal color, not a different color
- Dark mode is not just inverted light mode — backgrounds get lighter as elevation increases
- Test every screen in both light and dark mode before shipping
- Test with Simulate Color Blindness (Xcode / browser devtools) for all three types

**Elevation in dark mode — C4K uses dark green tints, not purple or grey:**
| Level | CSS Variable | Use |
|-------|-------------|-----|
| Base | rgba(8, 6, 16, 1) | Page/screen background — never change this |
| Elevation 1 | --elevation-1 | Cards, MetaItem, list rows |
| Elevation 2 | --elevation-2 | Modals, bottom sheets |
| Elevation 3 | --elevation-3 | Popovers, tooltips, context menus |
| Border | --elevation-border | Subtle dividers between elevated surfaces |

All elevation levels use dark desaturated green tints — cinematic feel, not vivid.
Key rule: shadows are invisible in dark mode — use background color difference + subtle border instead.

---

### 1.4 Dark Mode

- Opt in explicitly — do not assume it will just work
- Never use pure black (#000000) as a background — use #1C1C1E (system background)
- Shadows become invisible in dark mode — use borders or background differentiation instead
- Images should look correct in both modes — consider tinting or providing two versions
- Vibrancy and materials (blur + translucency) work differently in dark mode — test them

---

### 1.5 Icons (SF Symbols + custom icons)

**SF Symbols (Apple's icon system — 6,000+ icons):**
- Always use SF Symbols before creating custom icons
- Weight must match surrounding text weight — do not mix heavy icons with light text
- Scale: Small, Medium, Large — use Medium as default
- Rendering modes: Monochrome, Hierarchical, Palette, Multicolor — choose based on context
- Variable color: use for progress indicators and signal strength concepts

**Custom icons:**
- Use filled icons for selected/active state, outlined for inactive
- Consistent stroke weight across all icons in the same set (1.5pt–2pt at 24pt size)
- Icons must read at 16pt × 16pt minimum
- Optical alignment: visually center, not mathematically center (circles appear lower)
- Padding: 2pt inset from the bounding box edges

---

### 1.6 Layout and Spacing

**Base unit: 4pt grid**
Everything aligns to multiples of 4. Spacing values: 4, 8, 12, 16, 20, 24, 32, 40, 48.

**Safe areas (iOS):**
- Top safe area: 44pt (notch) or 59pt (Dynamic Island) + status bar
- Bottom safe area: 34pt (home indicator)
- Side margins: 16pt (compact), 20pt (regular)
- Never place interactive elements outside safe areas

**Content margins by screen width:**
| Screen | Side margin |
|--------|------------|
| iPhone SE (375pt) | 16pt |
| iPhone 14 (390pt) | 20pt |
| iPhone 14 Plus (430pt) | 20pt |
| iPad (768pt+) | 24–40pt |

**Layout grid:**
- Mobile: 4-column grid, 16pt gutters
- Tablet: 8-column grid, 24pt gutters
- Desktop: 12-column grid, 24–32pt gutters

**Spacing between elements:**
| Relationship | Spacing |
|-------------|---------|
| Label to its input | 4–8pt |
| Related items (same group) | 8–12pt |
| Unrelated groups | 20–24pt |
| Section headers | 32–40pt |

**Visual hierarchy spacing rule:**
More space = less related. Less space = more related.
If two elements belong together, bring them closer. If they are separate concepts, push them apart.

---

### 1.7 Materials and Vibrancy

Apple's material system (blur + translucency):

| Material | Use for |
|----------|---------|
| Ultra-thin | Overlays that need maximum content visibility |
| Thin | Tab bars, toolbars |
| Regular | Navigation bars, sidebars |
| Thick | Sheets, popovers |
| Chrome | System UI (not for apps) |

**Rules:**
- Materials require a vibrant, colorful background beneath them to work well
- On static or dark backgrounds, materials may not provide enough contrast
- Never layer multiple translucent materials on top of each other
- Content behind a material should be blurred — motion beneath materials can be distracting

---

### 1.8 Motion and Animation

**Core principles:**
- Animation must communicate change, not decorate it
- Every animation should have a purpose: what changed, where did it go, what can I do now
- Duration: 200–500ms for UI transitions. Under 200ms feels instant. Over 500ms feels slow.
- Easing: use spring animations (not linear) for natural feel

**Standard durations:**
| Action | Duration |
|--------|----------|
| Micro-interaction (button press feedback) | 100–150ms |
| Element appearing | 200–300ms |
| Screen transition | 300–400ms |
| Modal presentation | 350–500ms |
| Complex multi-step animation | Up to 700ms |

**Easing curves:**
- Ease in (starts slow, ends fast): for elements leaving the screen
- Ease out (starts fast, ends slow): for elements entering the screen
- Spring (overshoot + settle): for interactive gestures, drag and drop
- Linear: only for looping animations (spinners, progress)

**What never to animate:**
- Text reflow
- Layout changes that shift large sections of content
- Anything that happens more than once per second
- Background processes the user did not trigger

---

### 1.9 Typography

**San Francisco (SF) — Apple's system font. Use for all UI text.**

SF Pro Display: headings and large text (≥ 20pt)
SF Pro Text: body and small text (< 20pt)
SF Mono: code, numbers that need to align
New York: serif option for editorial, reading contexts

**Dynamic Type scale (iOS):**
| Style | Size | Weight | Line height |
|-------|------|--------|-------------|
| Large Title | 34pt | Regular | 41pt |
| Title 1 | 28pt | Regular | 34pt |
| Title 2 | 22pt | Regular | 28pt |
| Title 3 | 20pt | Regular | 25pt |
| Headline | 17pt | Semibold | 22pt |
| Body | 17pt | Regular | 22pt |
| Callout | 16pt | Regular | 21pt |
| Subheadline | 15pt | Regular | 20pt |
| Footnote | 13pt | Regular | 18pt |
| Caption 1 | 12pt | Regular | 16pt |
| Caption 2 | 11pt | Regular | 13pt |

**Typography rules:**
- Use maximum 2 typefaces per interface
- Use maximum 3–4 type sizes per screen
- Line length: 50–75 characters (roughly 600–700pt wide for body text)
- Minimum body size: 17pt (iOS), never go below 11pt for any visible text
- Text on colored backgrounds: test contrast at all Dynamic Type sizes
- Left-align body text. Center only for short labels, headings, empty states.
- Never justify text on mobile — it creates uneven rivers of whitespace

---

### 1.10 Writing Style (Apple's HIG tone)

- Be direct and concise. Cut every word that does not add meaning.
- Use plain language. Write for a 12-year-old comprehension level.
- Present tense, active voice. "Save your file" not "Your file will be saved."
- Avoid jargon, technical terms, or abbreviations without explanation.
- Button labels should be verbs: "Save", "Delete", "Share" — not "OK" or "Yes."
- Error messages: say what happened, why, and what to do next. Never blame the user.
- Empty states: explain why it is empty and what to do to fill it.
- Avoid "Please" — it adds length without adding meaning.

---

## SECTION 2 — PATTERNS

Recurring design solutions for common interaction challenges.

---

### 2.1 Navigation

**Navigation models:**
| Model | Use when | iOS component |
|-------|----------|--------------|
| Tab bar | 3–5 top-level destinations, parallel sections | UITabBar |
| Navigation stack (push/pop) | Hierarchical content, drill-down | UINavigationController |
| Modal sheet | Focused task, temporary detour | UISheetPresentationController |
| Sidebar | iPad/Mac, complex app with many sections | UISplitViewController |
| Page view | Linear sequence (onboarding, galleries) | UIPageViewController |

**Tab bar rules:**
- Always visible (except during full-screen playback or modals)
- 3–5 tabs maximum
- Each tab represents a distinct, parallel section — not a sequential flow
- Active tab: filled icon + label. Inactive: outlined icon + muted label.
- Never put actions (like "New post") in a tab bar — use a floating action button instead

**Navigation bar rules:**
- Left side: back button (auto-generated), cancel for modals
- Center: current view title (short, 1–2 words)
- Right side: primary action for current screen (1–2 items max)
- Large title: use for top-level screens, collapses on scroll
- Never put more than 2 items on the right of a navigation bar

**Back navigation:**
- Always provide a back button for pushed views
- Back button label: previous screen title (truncate if necessary), or just "Back"
- Swipe-from-left-edge gesture must always work for back navigation

---

### 2.2 Onboarding

- Show value before asking for anything — demonstrate what the app does first
- Request permissions at the moment they are needed, not upfront
- Maximum 3–5 onboarding screens before first meaningful interaction
- Skip option: always provide a way to skip onboarding
- Never ask for personal information before explaining why it is needed
- Onboarding does not replace discoverability — the app itself should be self-explanatory

---

### 2.3 Loading States

**Hierarchy of loading patterns (use the first that applies):**
1. **Skeleton screens** — for content that has a known shape (cards, lists)
2. **Inline spinner** — for small areas or specific data that is loading
3. **Progress bar** — when duration is known or can be estimated
4. **Full-screen spinner** — last resort, only for initial app launch or unavoidable waits

**Rules:**
- Show something within 200ms of a user action — even if just a spinner
- If a load takes more than 1 second, show a loading state
- If a load takes more than 10 seconds, show progress and a cancel option
- Never show a spinner with no label for waits over 3 seconds — add context text

---

### 2.4 Error Handling

**Error message anatomy:**
1. What happened (plain language, not an error code)
2. Why it happened (if useful)
3. What to do (actionable next step)

**Error placement:**
- Field-level errors: below the specific input, in red, with icon
- Form-level errors: above the submit button or at the top of the form
- System errors: modal alert or banner notification depending on severity

**Alert vs. banner vs. inline:**
| Situation | Use |
|-----------|-----|
| Destructive action needs confirmation | Modal alert with Cancel + Confirm |
| Something went wrong, user can continue | Banner (non-blocking) |
| Something went wrong in a specific field | Inline below field |
| App cannot continue without resolution | Modal alert, blocking |
| Success confirmation | Banner (auto-dismiss after 3–4s) |

---

### 2.5 Empty States

Every list, grid, or data view needs an empty state design. It must have:
1. An illustration or icon (relevant, friendly, not generic)
2. A title (what is empty and why)
3. A body (explain what will appear here)
4. A call to action (what to do to fill it)

Empty states are not errors — they are an opportunity to guide users.

---

### 2.6 Searching and Filtering

- Search bar: top of the content area, collapses into navigation bar on scroll
- Instant results: show results as the user types, not just on submit
- No results state: suggest alternatives, check spelling, offer to clear filters
- Filters: show active filter count in the filter button label
- Sort: separate from filter — sorting reorders, filtering reduces

---

### 2.7 Settings

**Settings hierarchy:**
- App settings that affect the whole app → iOS Settings app (via Info.plist)
- Settings that affect one session or view → inline in the app
- Account settings → dedicated Settings screen in the app

**Settings page layout:**
- Use grouped table view: label sections, group related settings together
- Destructive actions (delete account, sign out) at the bottom, in red
- Toggles for on/off preferences
- Navigation cells (disclosure indicator >) for settings with sub-options
- Never bury critical functionality in settings — if users need it regularly, surface it

---

### 2.8 Authentication

**Sign-in screen rules:**
- Offer Sign in with Apple if using any third-party social sign-in
- Never ask for information you do not need at sign-up
- Show/hide password toggle on password fields
- Autofill support: label fields correctly for AutoFill (username, password, email)
- Biometric authentication (Face ID / Touch ID): offer as default, not buried in settings
- Forgot password: always visible, not hidden after a failed attempt

---

## SECTION 3 — COMPONENTS

Standard UI building blocks with exact behavior specifications.

---

### 3.1 Buttons

**Button hierarchy:**
| Type | When to use | Style |
|------|------------|-------|
| Primary | Main action on screen (1 per screen max) | Filled, accent color |
| Secondary | Alternative action | Outlined or tinted |
| Tertiary | Low-priority action | Text only, no border |
| Destructive | Delete, remove (irreversible) | Filled red or text red |
| Disabled | Action not available | 40% opacity, not interactive |

**Button sizing:**
- Height: 50pt (large), 44pt (regular), 28pt (small)
- Corner radius: pill (full round) for standalone buttons, 10pt for inline buttons
- Padding: 16pt horizontal (minimum), 12pt vertical
- Full-width buttons: use for primary actions in forms and sheets

**Button states:**
- Default → Pressed (darken 15%) → Disabled (40% opacity)
- Always show visual feedback on press — never a button with no state change

---

### 3.2 Text Fields and Inputs

- Height: 44pt minimum (tap target)
- Border: 1pt separator color, 1.5pt on focus in accent color
- Label: above the field, not inside it (placeholder text is not a label)
- Placeholder: hint text in 30% opacity, not a substitute for a label
- Error state: red border + red error message below the field
- Clear button: appears on the right when field has content
- Return key label: matches the action ("Search", "Next", "Done", "Send")

---

### 3.3 Lists and Tables

**List styles:**
| Style | Use for |
|-------|---------|
| Plain | Simple flat lists, settings |
| Grouped | Related sections, forms |
| Inset grouped | Modern iOS 13+ grouped style, rounded sections |
| Sidebar | iPad navigation |

**List row anatomy:**
- Leading image/icon (optional): 40×40pt standard
- Title: body weight
- Subtitle: footnote weight, secondary label color
- Trailing content: value, chevron, toggle, or badge
- Row height: 44pt minimum, 56pt with subtitle, 72pt with image

---

### 3.4 Navigation Bars

- Background: system background with translucency (material: regular)
- Height: 44pt (standard) or 96pt (large title, before scroll)
- Large title collapses to standard title on scroll — threshold: when content reaches the bar
- Translucency: the bar should be slightly see-through when content is behind it
- Back button: system chevron + optional label (previous screen title)
- Maximum 2 trailing bar button items

---

### 3.5 Tab Bars

- Height: 49pt + safe area inset (83pt on phones with home indicator)
- Tabs: 3 minimum, 5 maximum
- Each tab: icon (24×24pt) + label (10pt caption)
- Active: filled icon, accent color label
- Inactive: outlined icon, secondary label color
- Badge: red pill in top-right of icon, up to 4 characters

---

### 3.6 Modals and Sheets

**Sheet types:**
| Type | Use for |
|------|---------|
| Full screen modal | Immersive flows (camera, document editing) |
| Large detent sheet | Multi-step forms, detailed content |
| Medium detent sheet | Quick tasks, share sheets, confirmations |
| Popover (iPad/Mac) | Contextual actions without leaving current view |

**Sheet rules:**
- Always provide a dismiss method: drag down, Cancel button, or tap outside
- Do not stack sheets on top of each other — complete or dismiss the current one
- Navigation within a sheet: use navigation bar with Done / Cancel, not push navigation

---

### 3.7 Alerts

**Alert anatomy:**
- Title: 1–3 words, what happened
- Message: 1–2 sentences of context (optional)
- Buttons: maximum 3. Destructive action in red. Cancel always present.
- Button order: Cancel left, primary action right (2 buttons) / stacked for 3

**Alert rules:**
- Never use alerts for success states — use banners
- Never use alerts for information that does not require a decision
- Destructive alerts: "Delete [item]" not "Are you sure?" — be specific
- Never have two buttons that do the same thing with different wording

---

### 3.8 Action Sheets

- Used for: presenting 3+ options for an action the user initiated
- Presented from bottom (iOS) or as a popover (iPad/Mac)
- Always include Cancel
- Destructive action: red text, always at top of list or separated
- Maximum 6 options before considering a different pattern

---

## SECTION 4 — INPUTS

How users interact with the interface.

---

### 4.1 Gestures (Touch)

| Gesture | Standard use | Custom use rules |
|---------|-------------|-----------------|
| Tap | Select, activate | Most common — use for primary interactions |
| Double tap | Zoom in, like | Do not use for destructive or irreversible actions |
| Long press | Context menu, drag handle | Always show a visual indicator that long press is available |
| Swipe left/right | Delete row, navigate back/forward | Reveal actions on swipe in lists (red for delete) |
| Swipe up/down | Scroll, dismiss sheet | Back swipe (left edge) must always navigate back |
| Pinch | Zoom in/out | Only in zoomable content |
| Pan / drag | Move, scroll | Show drag handles for draggable items |
| Two-finger tap | Undo (standard iOS) | Do not override this |

**Custom gesture rules:**
- Never use a gesture that conflicts with a system gesture
- Every custom gesture needs a visual affordance — users cannot discover invisible gestures
- Always provide a button alternative for every gesture — not everyone uses gestures

---

### 4.2 Keyboard

- Keyboard type must match the input: email → email keyboard, numbers → numpad
- Return key must do the correct action: move to next field, submit form, search
- Dismiss keyboard: tapping outside a field, pressing Done, completing the form
- Never prevent the user from dismissing the keyboard
- Keyboard avoidance: form fields must scroll above the keyboard when it appears

---

### 4.3 Drag and Drop

- Drag handle: three horizontal lines icon (line.3.horizontal) on the left of list rows
- Visual feedback during drag: shadow elevation + slight scale up (1.05×)
- Drop target: highlight with accent color border
- Cancel: drag back to origin or press Escape
- Multi-item drag: badge shows count of items being dragged

---

## SECTION 5 — VISUAL DESIGN TOKENS

Translating HIG principles into concrete values for any design system.

---

### 5.1 Spacing Scale

```
4pt  — micro: icon padding, badge insets
8pt  — small: related element gap, input padding vertical
12pt — medium-small: list row internal padding
16pt — medium: default side margin, section padding
20pt — medium-large: card internal padding
24pt — large: section gap, card gap
32pt — xl: major section divider
40pt — 2xl: hero section padding
48pt — 3xl: page top/bottom padding
64pt — 4xl: large section separation
```

---

### 5.2 Corner Radius Scale

```
4pt  — small chips, tags, badges
8pt  — small cards, input fields
10pt — standard cards (iOS 13+ grouped inset style)
12pt — medium cards, sheets
16pt — large cards
20pt — modal sheets
9999pt — pill buttons, full round tags
```

---

### 5.3 Shadow Scale

```
Level 0 — no shadow (flat, on elevated background)
Level 1 — 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)  (cards on light bg)
Level 2 — 0 4px 6px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)  (floating elements)
Level 3 — 0 10px 15px rgba(0,0,0,0.10), 0 4px 6px rgba(0,0,0,0.05) (modals, sheets)
Level 4 — 0 20px 25px rgba(0,0,0,0.15), 0 10px 10px rgba(0,0,0,0.04) (alerts, popovers)

Dark mode: shadows are largely invisible. Use background differentiation instead.
```

---

### 5.4 Animation Tokens

```
Duration:
  instant:    100ms  — micro feedback (button press)
  fast:       200ms  — small elements appearing/disappearing
  normal:     300ms  — standard transitions
  slow:       400ms  — screen transitions, modals
  deliberate: 500ms  — complex or important transitions

Easing:
  enter:      cubic-bezier(0.0, 0.0, 0.2, 1)   — ease out, for elements entering
  exit:       cubic-bezier(0.4, 0.0, 1, 1)      — ease in, for elements leaving
  standard:   cubic-bezier(0.4, 0.0, 0.2, 1)    — ease in-out, for elements moving
  spring:     spring(1, 100, 10, 0)              — for interactive/draggable elements
```

---

## SECTION 6 — PLATFORM CONSIDERATIONS

### 6.1 iPhone (iOS)
- Single column layout in portrait, optional two-column in landscape
- Bottom navigation (tab bar)
- Large touch targets (44pt minimum)
- Thumb zone: bottom third of screen is easiest to reach one-handed
- Avoid important actions in the top corners — hardest to reach

### 6.2 iPad (iPadOS)
- Sidebar + content split view for complex apps
- Support both portrait and landscape equally
- Pointer support (trackpad/mouse): hover states, cursor changes
- Drag and drop between apps
- Keyboard shortcuts: expose via menu or keyboard shortcut overlay

### 6.3 Mac (macOS)
- Smaller targets acceptable (28pt minimum — pointer is precise)
- Hover states required — cursor changes on interactive elements
- Right-click context menus expected everywhere
- Keyboard-first: every action must have a keyboard shortcut
- Menu bar: standard menu items in correct menus (File, Edit, View, Window, Help)

### 6.4 Web (applying HIG principles)
- Apply the same color, spacing, and typography principles
- Min touch target: 44×44px for mobile browsers
- Max line length: 680px for body text
- Respect `prefers-color-scheme` for dark mode
- Respect `prefers-reduced-motion` for animations
- Tab order must match visual reading order
- Focus rings: always visible, never remove outline without providing a custom alternative

---

## SECTION 7 — QUICK CHECKLIST

Run this before calling any screen "done."

### Visual
- [ ] Every screen works in light mode and dark mode
- [ ] Contrast ratios meet 4.5:1 (normal text) and 3:1 (large text / UI)
- [ ] Color is not the only differentiator between states
- [ ] Font sizes are within the Dynamic Type scale
- [ ] Spacing uses the 4pt grid
- [ ] No element is smaller than 44×44pt for tap targets

### Interaction
- [ ] Every state is handled: default, pressed, disabled, loading, error, empty, success
- [ ] Loading states appear within 200ms of action
- [ ] Error messages are human-readable and actionable
- [ ] Keyboard can navigate every interactive element
- [ ] Swipe-back gesture works for all pushed views

### Content
- [ ] All button labels are verbs
- [ ] No jargon or technical error codes exposed to users
- [ ] Empty states have an illustration + title + body + CTA
- [ ] Destructive actions require confirmation

### Performance
- [ ] Images use lazy loading below the fold
- [ ] Animations respect prefers-reduced-motion
- [ ] No layout shifts after initial paint
- [ ] First meaningful content visible in under 1 second

---

## SECTION 8 — APPLYING THIS TO CAUGHT IN 4K

Since C4K is a dark, cinematic, Gen Z streaming app, here is how HIG principles map:

| HIG Principle | C4K Implementation |
|--------------|-------------------|
| Semantic colors | --primary-accent-color is DYNAMIC (set from active profile's avatar color). Default fallback: cyan rgb(0,240,255). Destructive: always red. |
| Per-profile theming | Each profile has an accent color extracted from its avatar image via Canvas API. Stored in localStorage as c4k_active_profile_accent. Applied to --primary-accent-color and --outer-glow on :root. |
| Elevation in dark mode | Dark desaturated green elevation scale: --elevation-1 (cards), --elevation-2 (modals), --elevation-3 (popovers). Base background stays rgba(8,6,16,1). |
| 44pt touch targets | All nav buttons, MetaItem cards, setting rows |
| Tab bar always visible | TopNavigationBar stays fixed, never hidden during browsing |
| Loading states | Skeleton screens for MetaItem cards, spinner for Canon Takes |
| Empty states | Each route (Library, Discover) needs an illustrated empty state — roadmap item 5.C |
| Spring animations | MetaItem hover/press, Canon Take appearance |
| prefers-reduced-motion | All Animate.css and keyframe animations must be guarded — roadmap item 5.B |
| Error messages | Canon Takes failures should show a friendly fallback message — roadmap item 5.E |
| Typography scale | PlusJakartaSans maps to: 34pt Large Title → 17pt Body → 11pt Caption |
| Accessibility | All Tabler Icons need aria-label, all images need alt text — roadmap item 5.D (do alongside 1.1) |
| Focus rings | Keyboard nav focus rings must be visible on all interactive elements — roadmap item 5.A |
| Contrast | Forest Night #2e3c28 vs white = 11.4:1 (AAA). Accent-on-dark must also be checked. — roadmap item 5.A |
