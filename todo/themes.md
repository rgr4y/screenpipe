# Screenpipe theme engine, UI scale, and overlay stability design

Date: 2026-04-17
Status: approved for spec drafting, pending final user review
Requested path: `todo/themes.md`

## Summary

Bring the George theme engine pattern into `apps/screenpipe-app-tauri` without preserving Screenpipe's current styling mess. Ship Screenpipe as the default theme, but support full runtime switching to the imported George theme set. At the same time, add proper app-wide UI scaling with keyboard shortcuts and a settings control, and fix overlay size drift by separating overlay geometry from overlay chrome.

This is intentionally a real system upgrade, not a patch. Use established theming patterns: semantic tokens, theme registry, root CSS custom properties, provider-managed preference state, persisted settings, bounded scale steps, and component consumption through tokens instead of ad hoc inline sizes.

## Goals

- Ship a real theme engine for the desktop app UI.
- Keep `screenpipe` as the default visual theme.
- Allow switching to all imported George themes at runtime.
- Add global app-wide UI scaling.
- Support scale controls through both shortcuts and settings UI.
- Fix recording/OCR overlay instability by isolating coordinate math from themed/scaled UI chrome.
- Replace the worst arbitrary font sizing and inline font styles during migration.

## Non-goals

- Do not redesign the whole product or app information architecture.
- Do not preserve a long-term compatibility bridge for bad styling patterns.
- Do not treat UI scale as browser zoom.
- Do not allow global UI scale to affect capture geometry, OCR bounds, or media pixel math.
- Do not block the project on full cleanup of every canvas-driven or highly custom surface.

## Current problems

Confirmed during repo exploration:

- Theme behavior is partially tokenized but not a complete engine.
- Font sizing is inconsistent across semantic Tailwind classes, arbitrary `text-[Npx]` values, and inline `fontSize` styles.
- No first-class font or UI scale control exists.
- Tailwind has no custom font-size token system tied to root UI scale.
- Overlay-related UI mixes geometry and styling concerns, which likely contributes to unstable sizing behavior.
- Some components (notably onboarding and notification/global error surfaces) hardcode text size or layout constants.

## Design principles

- Use boring, proven theming patterns.
- Prefer semantic tokens over local component-specific values.
- Prefer a short migration window over a permanent compatibility layer.
- Fix root causes, not symptoms.
- Keep overlay geometry deterministic and isolated from theme/scale.
- Shared primitives and high-traffic surfaces get cleaned first.

## Architecture

The new UI system owns three concerns together:

1. theme identity
2. light/dark/system resolution
3. app-wide UI scale

### Core pieces

#### Theme registry

A central registry defines supported themes and the semantic tokens each theme provides.

Initial registry contents:

- `screenpipe` (default)
- imported George themes:
  - `macos`
  - `github`
  - `nord`
  - `tokyo-night`
  - `one-dark`
  - `solarized`
  - `catppuccin`
  - `rose-pine`
  - `dracula`

The Screenpipe theme remains the default shipping identity. The George themes become peer entries in the same registry, not side-channel overrides.

#### UI preferences model

Persist the following user preferences together:

- `themeName`: selected named theme
- `themeMode`: `light | dark | system`
- `uiScale`: stepped numeric scale value

These preferences should live in the existing desktop settings infrastructure so they survive relaunch and can be surfaced consistently across app windows.

#### UI system provider

A single app-shell provider manages:

- loading persisted UI preferences
- resolving light/dark/system against OS preference
- applying theme tokens to `document.documentElement`
- applying scale variables to `document.documentElement`
- syncing native window theme where relevant
- exposing actions for theme selection, mode selection, scale increase, scale decrease, and scale reset

This provider replaces the current narrower theme-toggle behavior with a complete UI system layer.

#### Document token application

Resolved theme and scale values are written to root CSS custom properties. Tailwind and component styles consume those variables rather than embedding arbitrary pixel values.

### Overlay architecture

Overlay code is split into two layers:

#### Geometry layer

Responsible for:

- coordinate mapping
- anchor calculation
- source-to-display bounds conversion
- resize and remeasurement handling
- device pixel ratio and rendered media dimension handling

This layer is theme-agnostic and UI-scale-agnostic.

#### Chrome layer

Responsible for:

- labels
- handles
- badges
- toolbar controls
- borders
- padding
- font sizing
- theme colors

This layer responds to theme and UI scale.

The geometry layer may inform chrome placement, but chrome styling must never change the geometry math.

## Theme model

### Token strategy

Use semantic tokens, not component-specific values. At minimum each theme should provide tokens for:

- app background / foreground
- surface layers
- card and popover surfaces
- primary / secondary / accent states
- muted text hierarchy
- border / input / ring
- destructive / warning / info semantics
- sidebar/navigation surfaces
- overlay chrome surfaces if distinct treatment is needed
- radius token support for imported themes

Components must consume semantic roles like `muted text`, `surface border`, or `primary action`, not hand-picked colors from local files.

### Screenpipe default

The `screenpipe` theme should preserve the app's preferred default identity as the default selection, but its tokens should be normalized into the same registry shape as the imported George themes.

### Imported George themes

All imported George themes ship in v1 and are available in the theme list immediately. This increases QA surface area but matches the stated goal: this should be a real system, not a timid subset rollout.

## UI scale model

### Intent

UI scale means app-wide UI density/readability scaling, not browser zoom.

It should affect:

- typography tokens
- control heights
- common spacing increments where readability depends on them
- icon sizing for navigational and control chrome
- overlay chrome sizing only

It must not affect:

- capture geometry
- OCR coordinate math
- screenshot/media pixel dimensions
- overlay anchor math

### Scale values

Use a bounded stepped scale, not a freeform slider.

Initial scale ladder:

- `90%`
- `100%` (default)
- `110%`
- `125%`
- `140%`

These values are explicit to avoid ambiguity during implementation and testing. If later tuning is needed, adjust the ladder centrally rather than letting components improvise their own size rules.

### Controls

Expose scale in both ways:

#### Keyboard shortcuts

- macOS: `Cmd+=`, `Cmd+-`, `Cmd+0`
- non-macOS: platform-equivalent control modifier shortcuts

Behavior:

- increase one step
- decrease one step
- reset to `100%`

#### Settings UI

Provide a visible appearance control showing:

- current theme
- theme mode
- current scale
- increment/decrement or stepped selector
- reset action

Shortcuts and settings must remain bidirectionally in sync.

## Migration strategy

This should ship as a structured migration, not one giant cleanup blob.

### Phase 1 — foundation

Implement:

- theme registry
- UI system provider
- persisted `themeName`, `themeMode`, and `uiScale`
- root CSS variable application
- keyboard shortcuts
- settings UI for theme and scale
- Screenpipe + all George themes

At the end of this phase, runtime theme switching and global UI scaling work across the shell, even if some surfaces still need cleanup.

### Phase 2 — shared and high-traffic surfaces

Normalize:

- app shell
- sidebar/navigation
- core panels
- buttons/inputs/dialogs/shared primitives
- settings screens
- notification panel
- global error surfaces

Priority tasks:

- eliminate arbitrary `text-[Npx]` usage in migrated surfaces
- remove inline `fontSize` on normal UI surfaces
- align shared components to semantic typography roles

### Phase 3 — overlay stabilization

Treat overlay work as its own focused pass:

- separate geometry from chrome
- centralize measurement and recalculation
- remove styling-driven geometry assumptions
- define distinct concepts for visual bounds, hit targets, and captured-content bounds
- verify scale affects chrome only
- verify theme affects chrome only
- verify resize and media changes recompute geometry deterministically

### Phase 4 — sweep and debt burn-down

Clean remaining one-offs where practical:

- arbitrary pixel text classes
- inline font sizes
- components bypassing semantic tokens
- onboarding or custom visual components with hardcoded text sizing

Explicit temporary exceptions are allowed only if documented during implementation. No silent permanent exemptions.

## Overlay behavior requirements

### Theme changes

When the user changes theme:

- overlay chrome updates colors and text styling
- overlay geometry remains fixed

### UI scale changes

When the user changes app scale:

- overlay labels, controls, badges, and handles scale with the rest of the UI
- overlay geometry remains fixed relative to the underlying content

### Resize/media changes

When the container or displayed media dimensions change:

- geometry recalculates from source coordinates deterministically
- chrome reflows around recalculated geometry
- geometry is never derived from chrome dimensions

### Implementation guidance

Require:

- a shared overlay measurement utility or hook
- recalculation based on layout/container/media changes
- clear separation between visual bounds, hit targets, and capture bounds
- removal of styling constants that currently leak into geometry

## Testing and validation

### Functional

- selected theme persists across relaunch
- selected theme mode persists across relaunch
- selected UI scale persists across relaunch
- shortcuts increase, decrease, and reset scale reliably
- settings UI reflects shortcut changes immediately
- default startup behavior remains correct on first launch without stale flash

### Visual and layout

For every shipped theme:

- app shell remains legible
- core panels remain legible
- typography hierarchy remains coherent
- controls remain usable
- no clipped text at min or max scale
- no broken layouts in high-traffic surfaces

### Overlay regression

Verify overlays remain stable when:

- switching theme
- switching light/dark/system mode
- changing UI scale
- resizing the window
- resizing the underlying rendered media/container
- running on high-DPI and normal-DPI displays

### Cleanup enforcement

For migrated areas:

- no new arbitrary text-size utilities
- no new inline font sizing on normal UI surfaces
- no new ad hoc component-local color definitions where semantic tokens exist

## Risks

- partial migration causing mixed visual language
- theme regressions in obscure surfaces because all George themes ship in v1
- shortcut conflicts with existing browser/app behavior
- overlay fixes that work on one DPI profile but not another
- imported theme token assumptions not mapping cleanly onto all Screenpipe surfaces

## Mitigations

- migrate shared primitives early
- keep scale steps bounded and explicit
- test across normal and high-DPI displays
- make temporary exceptions explicit during implementation
- centralize theme token mapping rather than allowing per-component theme logic

## Decisions locked during brainstorming

- Use the George theme engine pattern, adapted for Screenpipe.
- Default theme is Screenpipe.
- Full theme switching is supported.
- All imported George themes ship in v1.
- UI scale is app-wide, not text-only.
- UI scale is exposed through both shortcuts and settings.
- Overlay chrome scales with the app.
- Overlay geometry remains mathematically stable.
- Prefer established patterns over custom invention.
- Short compatibility window only; no long-term legacy bridge.

## Recommended implementation posture

This work is primarily for local quality-of-life rather than a carefully optimized upstream PR. That means the implementation should prioritize getting the correct system in place over preserving old styling shortcuts forever. Migrate decisively, but keep the effort scoped to theming, scale, and overlay stability rather than letting it become a full product redesign.
