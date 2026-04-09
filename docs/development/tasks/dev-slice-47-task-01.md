# Dev Slice 47 — Task 01

## Title

Refusal boundary alignment — document naming split and close scenario gaps

## Sources of truth

- `docs/development/dev-slice-44.md` — Seam 3 gap inventory
- `docs/development/dev-slice-44-scenario-map.md` — Seam 3 and Seam 4 gap details
- `docs/spec/safety-and-refusal.md` — primary spec for refusal rules
- `docs/scenarios/safety-and-refusal.scenarios.md` — refusal scenario coverage
- `@multiverse/provider-contracts` — `Refusal` type with `category` field

## Audit findings

A full refusal audit was performed across all five commands (derive, validate, run, reset, cleanup):

**Category correctness**: All correct. No category conflation exists. Each command emits the
correct `category` value for every failure path. The four categories (`invalid_configuration`,
`unsupported_capability`, `unsafe_scope`, `provider_failure`) are used consistently throughout
core and CLI code.

**Message actionability**: Messages are generally actionable. The generic
`"Repository configuration is invalid."` from the repository validation pass is less specific
but lives in the spec's explicitly open area (messaging conventions are deferred).

**CLI output channel**: The `run` command routes refusal output to stderr while derive,
validate, reset, and cleanup put refusal JSON on stdout. This difference exists because `run`
wraps a child process (stdout is taken by the child). This is in the spec's explicitly open
area ("refusal reporting format") and is NOT changed here.

**Real gaps identified:**

1. **Spec/contract naming split undocumented**: `docs/spec/safety-and-refusal.md` uses
   human-readable names ("invalid configuration", spaces, lowercase). The `Refusal` type in
   `@multiverse/provider-contracts` uses machine-readable identifiers (`"invalid_configuration"`,
   underscores). Both forms are intentional but the split is unexplained, creating an apparent
   inconsistency for a reader.

2. **`run` missing from Operations Subject to Refusal list**: The spec lists derive, validate,
   reset, cleanup with "but is not limited to" language. `run` is a fifth command that can
   refuse (because it internally calls derive and requires worktree ownership). Adding `run`
   makes the spec explicitly match observable behavior.

3. **No scenario for unsafe scope during run**: Scenarios exist for unsafe scope × derive,
   validate, reset, and cleanup. No scenario exists for unsafe scope × run.

## In scope

- `docs/spec/safety-and-refusal.md`
  - Add a paragraph under Failure Categories documenting that the four category names
    correspond to `category` field values in the `Refusal` type (underscore form)
  - Add `run` to the "Operations Subject to Refusal" list

- `docs/scenarios/safety-and-refusal.scenarios.md`
  - Add one scenario: "unsafe scope causes refusal during run"

- `docs/development/tasks/dev-slice-47-task-01.md` (this file)

- `docs/development/current-state.md`
  - Add Slice 47 proving result entry

## Out of scope

- New refusal categories
- Changes to CLI output format or channel (stdout vs stderr for run is deferred)
- Improvements to generic error message text ("Repository configuration is invalid.")
- CLI refusal message wording changes of any kind
- Any implementation changes
- Slice 48 or 49 work

## Acceptance criteria

- `docs/spec/safety-and-refusal.md` explicitly states that the four category names
  correspond to `category` field values in `@multiverse/provider-contracts` `Refusal` type
  (underscore form), and that spec uses human-readable form and contract uses code form
- `docs/spec/safety-and-refusal.md` lists `run` in Operations Subject to Refusal
- `docs/scenarios/safety-and-refusal.scenarios.md` has a scenario for unsafe scope during run
- `pnpm test:contracts` and `pnpm test:acceptance` remain green (no code changes)
- No CLI behavior or output changes introduced
