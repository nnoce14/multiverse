# Dev Slice 45 — Task 01

## Title

Lifecycle semantics spec alignment — scope-confirmation vs effectful, reset vs cleanup intent

## Sources of truth

- `docs/development/dev-slice-44.md` — Slice 45 definition and scope
- `docs/development/dev-slice-44-scenario-map.md` — Seam 1 and Seam 4 gap inventory
- `docs/spec/provider-model.md` — capability definitions to update
- `docs/scenarios/provider-model.scenarios.md` — scenarios to extend
- `docs/guides/provider-authoring-guide.md` — guide sections to add

## Motivation

The planning pass (Slice 44) identified that correctly-implemented lifecycle behavior is
absent from spec and guide docs. Specifically:

1. The distinction between scope-confirmation and effectful reset/cleanup exists in code
   but is not expressed in `docs/spec/provider-model.md` or the provider authoring guide.
2. The reset vs cleanup intent distinction ("prepare for fresh use" vs "permanent removal")
   is not clear in the current spec language ("reinitializes or destroys").
3. Process-scoped readiness (fixed 500ms interval wait) is implemented but undocumented.
4. The `{PORT}` placeholder substitution in process-port-scoped is implemented but absent
   from all source-of-truth docs.

## In scope

- `docs/spec/provider-model.md`
  - Clarify reset intent: prepare isolated state for fresh use
  - Clarify cleanup intent: permanent removal; worktree no longer expected in use
  - Add scope-confirmation semantics: providers with no owned state may return
    scope-confirmation metadata from reset/cleanup without side effects

- `docs/scenarios/provider-model.scenarios.md`
  - Add scenario: scope-confirmation is a valid reset implementation for no-state providers
  - Add scenario: scope-confirmation is a valid cleanup implementation for no-state providers
  - Add scenario: reset intent — isolated state prepared for fresh use
  - Add scenario: cleanup intent — isolated state permanently removed

- `docs/guides/provider-authoring-guide.md`
  - Add "Scope-confirmation lifecycle" section explaining when and how to use it; include
    a code example; note that name-scoped uses this pattern
  - Add "Built-in provider behavior reference" section documenting:
    - process-scoped readiness: fixed-interval wait after spawn (minimal, current contract)
    - process-port-scoped `{PORT}` placeholder substitution in launch command

- `docs/development/current-state.md`
  - Add Slice 45 proving result entry

## Out of scope

- Any implementation changes
- New ADRs
- Changes to validate capability (Slice 46)
- Refusal boundary alignment (Slice 47)
- Worktree identity scenarios (Slice 48)
- appEnv/derive classification (Slice 49)
- New provider behaviors or provider packages

## Acceptance criteria

- `docs/spec/provider-model.md` clearly distinguishes reset intent from cleanup intent
- `docs/spec/provider-model.md` defines scope-confirmation as a valid lifecycle implementation
  for providers that own no mutable state
- `docs/scenarios/provider-model.scenarios.md` has scenarios covering both intent and
  scope-confirmation semantics
- `docs/guides/provider-authoring-guide.md` has a practical scope-confirmation section
  with a code example
- `docs/guides/provider-authoring-guide.md` documents process-scoped readiness and
  `{PORT}` placeholder behavior
- No implementation, ADR, or out-of-scope doc changes are introduced
