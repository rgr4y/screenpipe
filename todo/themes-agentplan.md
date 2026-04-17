# Screenpipe theme implementation agent plan

Date: 2026-04-17
Related spec: `todo/themes.md`
Status: ready for orchestrator kickoff

## Purpose

This document is the implementation handoff for the approved design in `todo/themes.md`.

It is meant to keep an orchestrator and its worker agents aligned while implementing:

- theme registry + theme engine
- app-wide UI scale
- settings + keyboard shortcuts for scale/theme control
- shared-surface migration to semantic tokens
- overlay stabilization via geometry/chrome separation

This plan assumes the repository already contains unrelated unstaged work. Agents must not absorb, revert, or modify unrelated changes.

## Master orchestrator brief

You are the orchestrator for implementing the approved design in `todo/themes.md` in the Screenpipe repository.

You are planning and coordinating work for `apps/screenpipe-app-tauri` and related theme/UI code only.

### Source of truth

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

### Mission

Implement the approved theme engine, app-wide UI scale, and overlay stabilization system described in `todo/themes.md`.

### Non-negotiable requirements

1. `screenpipe` remains the default theme.
2. Full runtime switching to all imported George themes ships in v1.
3. App-wide stepped UI scale is implemented and persisted.
4. UI scale is exposed through both:
   - keyboard shortcuts
   - settings UI
5. Overlay chrome scales with UI scale.
6. Overlay geometry remains mathematically stable and must not be affected by theme or UI scale.
7. Use established theming patterns:
   - semantic design tokens
   - theme registry
   - root CSS custom properties
   - provider-managed UI system
   - persisted preferences
8. Migrate obvious offenders in the touched areas:
   - arbitrary `text-[Npx]`
   - inline `fontSize`
   - styling constants leaking into overlay geometry
9. Do not redesign the product.
10. Do not widen scope into unrelated systems.

### Critical repo constraints

- This repo already contains unrelated unstaged changes. Do not touch, revert, or absorb them.
- Never use `git reset`, `git checkout --`, or delete local work.
- One logical change per commit.
- Respect existing file header rules.
- Use `bun` for JS/TS workflows and `cargo` for Rust workflows where needed.

### Planning duties

1. Read `todo/themes.md` first.
2. Produce a dependency-safe implementation plan.
3. Split work into parallel lanes only where file ownership is clean.
4. Assign every agent:
   - a narrow concern
   - explicit files they may edit
   - explicit files they must not edit
   - acceptance criteria
   - reporting requirements
5. Prevent overlap on shared spine files unless an agent is explicitly designated owner.

### Agent reporting format

Every agent must report:

- Summary of changes
- Files changed
- Tests/checks run
- Risks / follow-ups
- Anything skipped and why

### Definition of done

- Theme registry exists and is wired through a single provider/UI system.
- Theme name, theme mode, and uiScale persist and apply correctly on startup.
- Screenpipe default theme works.
- All imported George themes are selectable.
- Shortcuts and settings control stay in sync.
- High-traffic shared surfaces use semantic tokens / scale-aware styling in migrated areas.
- Overlay geometry/chrome split is real and validated.
- Relevant tests/checks pass.
- Remaining exceptions are explicit and documented.

### Required orchestrator output

Produce:

1. Phase plan
2. Agent split
3. Per-agent prompts
4. Merge order
5. Validation checklist

Do not start implementation until the dependency graph is coherent and agent file ownership is non-overlapping.

## Phase plan

### Phase 1 — foundation / UI system

Build the system spine:

- theme registry
- UI system/provider for `themeName`, `themeMode`, and `uiScale`
- root CSS variable application
- initial Tailwind integration for token/scale consumption
- Screenpipe default theme + all George themes wired into the registry

### Phase 2 — settings + shortcuts

Build the user controls:

- settings UI for theme selection, mode selection, and UI scale
- keyboard shortcuts for scale up/down/reset
- synchronization between persisted settings, provider state, and live UI

### Phase 3 — shared surface migration

Migrate high-traffic surfaces:

- app shell
- sidebar/navigation
- shared UI primitives
- core panels
- notification panel
- global error surfaces

During migration:

- remove obvious arbitrary `text-[Npx]`
- remove inline `fontSize`
- normalize to semantic token use in touched areas

### Phase 4 — overlay stabilization

Treat overlay work as a dedicated lane:

- split geometry layer from chrome layer
- centralize measurement and recalculation behavior where practical
- ensure theme + scale affect chrome only
- ensure geometry remains stable under theme/scale changes

### Phase 5 — integration + validation

- resolve integration conflicts
- validate persistence and startup behavior
- validate theme matrix on core surfaces
- validate scale controls and synchronization
- validate overlay stability
- document any remaining explicit exceptions

## Agent split

Use these lanes unless the orchestrator finds a cleaner non-overlapping ownership model.

### Agent 1 — Foundation / UI system

Owns the architecture spine.

#### Responsibilities

- Create/adapt theme registry structure.
- Implement provider/state for `themeName`, `themeMode`, `uiScale`.
- Apply theme + scale values to `document.documentElement`.
- Normalize Screenpipe default theme into the registry shape.
- Import/adapt George themes into the same registry.
- Establish root CSS variable plumbing.
- Integrate Tailwind/theme consumption at the foundation level.

#### Likely files

- `apps/screenpipe-app-tauri/components/theme-provider.tsx`
- `apps/screenpipe-app-tauri/app/providers.tsx`
- `apps/screenpipe-app-tauri/app/globals.css`
- `apps/screenpipe-app-tauri/tailwind.config.ts`
- new files under `apps/screenpipe-app-tauri/lib/theme/`

#### Must not touch

- overlay math
- overlay-specific components
- broad shared-surface migration
- settings UI beyond minimal plumbing

### Agent 2 — Settings + shortcuts

Owns the user-facing controls and persistence wiring.

#### Responsibilities

- Add settings controls for theme, mode, and scale.
- Implement scale shortcuts.
- Ensure settings and shortcuts stay in sync.
- Ensure persistence works through the existing settings/store model.

#### Likely files

- `apps/screenpipe-app-tauri/app/settings/page.tsx`
- relevant files under `apps/screenpipe-app-tauri/components/settings/`
- `apps/screenpipe-app-tauri/lib/hooks/use-settings.tsx`
- any app-shell shortcut wiring files needed

#### Must not touch

- theme registry design itself
- root token architecture beyond consumption
- overlay geometry/math
- broad shared-surface cleanup outside settings surfaces

### Agent 3 — Shared surface migration

Owns the high-traffic UI cleanup.

#### Responsibilities

- Migrate shared and high-traffic surfaces to semantic tokens and scale-aware styling.
- Remove obvious arbitrary text sizes and inline font sizes in touched areas.
- Normalize behavior on key surfaces under theme switching and UI scale changes.

#### Likely files

- shared UI under `apps/screenpipe-app-tauri/components/ui/`
- app shell files under `apps/screenpipe-app-tauri/app/home/`
- `apps/screenpipe-app-tauri/app/notification-panel/page.tsx`
- `apps/screenpipe-app-tauri/app/global-error.tsx`
- `apps/screenpipe-app-tauri/app/global-error.jsx`

#### Must not touch

- provider architecture core unless explicitly coordinated
- settings persistence plumbing
- shortcut wiring
- overlay geometry/math code

### Agent 4 — Overlay stabilization

Owns overlay correctness.

#### Responsibilities

- Separate geometry from chrome.
- Keep geometry independent from theme and UI scale.
- Make chrome respond to theme and UI scale.
- Centralize measurement/recalculation where it reduces duplication and magic constants.
- Remove styling-driven geometry assumptions.

#### Likely files

- `apps/screenpipe-app-tauri/components/text-overlay.tsx`
- `apps/screenpipe-app-tauri/components/rewind/region-ocr-overlay.tsx`
- relevant files under `apps/screenpipe-app-tauri/app/overlay/`
- new overlay utility/hook files if needed

#### Must not touch

- theme registry/provider internals except for consuming public APIs
- settings UI
- global keyboard shortcut wiring
- unrelated shared-surface migration work

### Agent 5 — Final integration

Optional dedicated lane if the orchestrator wants a separate integrator.

#### Responsibilities

- merge completed agent work coherently
- resolve cross-lane conflicts
- validate startup, persistence, theme selection, scale controls, and overlay behavior
- document remaining explicit exceptions

## Per-agent prompt templates

## Agent 1 prompt — Foundation / UI system

Implement the Foundation / UI System lane for the approved design in `todo/themes.md`.

Read first:

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

Your responsibilities:

- Create/adapt the theme registry structure.
- Implement the central UI system/provider for:
  - `themeName`
  - `themeMode`
  - `uiScale`
- Apply resolved theme and scale values to `document.documentElement`.
- Normalize Screenpipe default theme into the registry shape.
- Import/adapt the George theme definitions into the registry.
- Establish root CSS variable plumbing for theme + scale.
- Integrate Tailwind/theme consumption so the new system can drive semantic styling.

Files you may edit:

- `apps/screenpipe-app-tauri/components/theme-provider.tsx`
- `apps/screenpipe-app-tauri/app/providers.tsx`
- `apps/screenpipe-app-tauri/app/globals.css`
- `apps/screenpipe-app-tauri/tailwind.config.ts`
- new files under `apps/screenpipe-app-tauri/lib/theme/`
- narrowly related shared settings/types files only if required for provider plumbing

Files you must not edit:

- overlay components
- overlay measurement/math utilities
- settings page UI beyond minimal plumbing hooks
- high-traffic UI surface components unrelated to provider wiring
- onboarding/canvas-heavy visual components
- unrelated unstaged files elsewhere in repo

Acceptance criteria:

- Theme registry exists with `screenpipe` + all imported George themes.
- UI provider supports `themeName`, `themeMode`, and `uiScale`.
- Root CSS vars are applied from the provider.
- App shell can consume the new provider cleanly.
- Foundation is ready for settings/shortcuts and migration agents to build on.

Constraints:

- Use proven patterns; do not invent a bespoke framework.
- Preserve Screenpipe as default theme.
- Keep file ownership tight.
- Do not widen scope into broad component cleanup.

Before finishing, report:

- summary of changes
- files changed
- tests/checks run
- risks or follow-ups
- anything intentionally skipped

## Agent 2 prompt — Settings + shortcuts

Implement the Settings + Shortcuts lane for the approved design in `todo/themes.md`.

Read first:

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

Your responsibilities:

- Add appearance controls for:
  - selected theme
  - theme mode
  - UI scale
- Implement scale shortcuts:
  - macOS: `Cmd+=`, `Cmd+-`, `Cmd+0`
  - platform-equivalent behavior elsewhere where applicable
- Ensure shortcut actions and settings UI stay in sync.
- Ensure changes persist through the existing settings infrastructure.
- Keep behavior aligned with the stepped scale model defined in `todo/themes.md`.

Files you may edit:

- `apps/screenpipe-app-tauri/app/settings/page.tsx`
- relevant files under `apps/screenpipe-app-tauri/components/settings/`
- `apps/screenpipe-app-tauri/lib/hooks/use-settings.tsx`
- app-shell shortcut wiring files as needed
- minimal shared types/hooks needed for settings integration

Files you must not edit:

- theme registry definitions
- root theme CSS token design
- broad shared-surface migration files
- overlay geometry/math code
- unrelated settings sections outside appearance/shortcut needs unless directly necessary

Acceptance criteria:

- Theme selection is controllable from settings.
- Theme mode is controllable from settings.
- UI scale is controllable from settings.
- Shortcuts increase/decrease/reset scale correctly.
- Settings UI reflects shortcut changes immediately.
- Persisted values survive relaunch.

Constraints:

- Do not invent a second source of truth outside the provider/settings model.
- Do not widen into visual cleanup of unrelated settings panels.
- Keep implementation aligned with bounded stepped scale, not freeform zoom.

Before finishing, report:

- summary of changes
- files changed
- tests/checks run
- risks or follow-ups
- anything intentionally skipped

## Agent 3 prompt — Shared surface migration

Implement the Shared Surface Migration lane for the approved design in `todo/themes.md`.

Read first:

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

Your responsibilities:

- Migrate high-traffic shared surfaces to the new semantic token / scale-aware system.
- Clean up obvious arbitrary text sizing and inline font sizing in touched areas.
- Normalize typography and shared surface behavior where the spec explicitly calls for it.
- Prioritize:
  - app shell
  - navigation/sidebar
  - shared UI primitives
  - core panels
  - notification panel
  - global error surfaces

Files you may edit:

- shared components under `apps/screenpipe-app-tauri/components/ui/`
- app shell files under `apps/screenpipe-app-tauri/app/home/`
- `apps/screenpipe-app-tauri/app/notification-panel/page.tsx`
- `apps/screenpipe-app-tauri/app/global-error.tsx`
- `apps/screenpipe-app-tauri/app/global-error.jsx`
- other high-traffic shared surfaces directly covered by `todo/themes.md`

Files you must not edit:

- theme registry/provider core files unless coordinated through the foundation lane
- settings persistence plumbing
- keyboard shortcut implementation
- overlay geometry/math components
- onboarding/canvas-heavy components unless explicitly required and justified

Acceptance criteria:

- Migrated surfaces consume semantic tokens instead of ad hoc values where applicable.
- Obvious `text-[Npx]` / inline `fontSize` offenders are removed in touched shared areas.
- Shared surfaces behave sensibly across theme switching and scale changes.
- No new ad hoc styling debt is introduced.

Constraints:

- Do not attempt a whole-app redesign.
- Stay focused on high-traffic/shared surfaces only.
- If a surface turns into a separate redesign, stop and report it.

Before finishing, report:

- summary of changes
- files changed
- tests/checks run
- risks or follow-ups
- anything intentionally skipped

## Agent 4 prompt — Overlay stabilization

Implement the Overlay Stabilization lane for the approved design in `todo/themes.md`.

Read first:

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

Your responsibilities:

- Separate overlay geometry from overlay chrome.
- Ensure overlay geometry is independent from theme and UI scale.
- Ensure overlay chrome responds to theme and UI scale.
- Centralize overlay measurement/recalculation behavior where appropriate.
- Remove styling-driven geometry assumptions in the touched overlay code.
- Make the “grows/shrinks at random” behavior less likely by fixing the boundary between measurement and presentation.

Files you may edit:

- `apps/screenpipe-app-tauri/components/text-overlay.tsx`
- `apps/screenpipe-app-tauri/components/rewind/region-ocr-overlay.tsx`
- relevant files under `apps/screenpipe-app-tauri/app/overlay/`
- new overlay utility/hook files if needed
- directly related overlay consumers where necessary

Files you must not edit:

- theme registry/provider architecture except for consuming public APIs
- settings UI
- global keyboard shortcut wiring
- unrelated shared-surface migration files
- onboarding/canvas-heavy components unless directly involved in overlay stability

Acceptance criteria:

- Overlay geometry remains stable when:
  - theme changes
  - UI scale changes
- Overlay chrome updates correctly with theme/scale.
- Resize/media changes cause deterministic recalculation.
- Code clearly separates geometry concepts from chrome styling concerns.
- Any remaining exceptions or limits are explicitly documented.

Constraints:

- Never let UI scale alter coordinate fidelity.
- Do not “fix” geometry by hardcoding more magic numbers.
- Prefer a reusable measurement utility/hook over ad hoc recalculation logic.

Before finishing, report:

- summary of changes
- files changed
- tests/checks run
- risks or follow-ups
- anything intentionally skipped

## Agent 5 prompt — Final integrator

You are the final integrator for the approved design in `todo/themes.md`.

Read first:

- `todo/themes.md`
- `VISION.md`
- `DESIGN.md`
- `CLAUDE.md`

Your job:

Merge the completed agent work into a coherent, dependency-safe implementation and validate the full system.

Responsibilities:

1. Review each agent’s reported scope and confirm no one drifted into unrelated work.
2. Resolve integration issues across:
   - provider/state
   - theme registry
   - settings persistence
   - shortcut handling
   - shared-surface migration
   - overlay stabilization
3. Ensure shared spine files are coherent:
   - `app/globals.css`
   - `tailwind.config.ts`
   - theme/provider files
   - settings persistence hooks
4. Validate that there is still one clear source of truth for:
   - `themeName`
   - `themeMode`
   - `uiScale`
5. Confirm the implemented behavior matches `todo/themes.md`.

Required validation:

- Theme selection persists across relaunch.
- Theme mode persists across relaunch.
- UI scale persists across relaunch.
- Shortcut and settings controls stay in sync.
- Screenpipe remains default theme.
- All imported George themes are selectable.
- Shared surfaces behave reasonably across theme + scale changes.
- Overlay chrome scales, geometry stays stable.
- Relevant tests/checks pass.

Constraints:

- Do not absorb unrelated unstaged changes in the repo.
- Do not reopen scope into a product redesign.
- If a remaining issue is outside the approved scope, document it instead of silently fixing unrelated systems.

Output:

- integration summary
- final files touched
- tests/checks run
- explicit remaining exceptions
- recommended follow-up order if anything remains

## Merge order

Use this order unless the orchestrator finds a dependency-safe reason to change it:

1. Foundation / UI system
2. Settings + shortcuts
3. Shared surface migration
4. Overlay stabilization
5. Final integration + validation

If multiple agents need any of the following files, assign one owner up front or sequence the work instead of parallelizing it:

- `apps/screenpipe-app-tauri/app/globals.css`
- `apps/screenpipe-app-tauri/tailwind.config.ts`
- `apps/screenpipe-app-tauri/components/theme-provider.tsx`
- `apps/screenpipe-app-tauri/app/providers.tsx`
- `apps/screenpipe-app-tauri/lib/hooks/use-settings.tsx`

## Validation checklist

- [ ] `screenpipe` is the default selected theme
- [ ] all imported George themes are selectable
- [ ] theme choice persists across relaunch
- [ ] theme mode persists across relaunch
- [ ] uiScale persists across relaunch
- [ ] Cmd+= increases one step
- [ ] Cmd+- decreases one step
- [ ] Cmd+0 resets to default
- [ ] settings UI reflects shortcut-driven changes
- [ ] root token application is centralized
- [ ] migrated shared surfaces avoid arbitrary `text-[Npx]` and inline `fontSize`
- [ ] overlay chrome responds to theme
- [ ] overlay chrome responds to uiScale
- [ ] overlay geometry does not move when theme changes
- [ ] overlay geometry does not move when uiScale changes
- [ ] overlay geometry recalculates deterministically on resize/media changes
- [ ] no unrelated unstaged repo changes were absorbed
- [ ] any remaining exceptions are explicitly documented

## Notes for the orchestrator

- Prefer clean file ownership over maximal parallelism.
- If a lane starts to become a separate redesign, stop and split it instead of absorbing it.
- Shared spine files should have one clear owner.
- Use the plan to reduce merge pain, not to create a tiny distributed systems problem inside the frontend.
