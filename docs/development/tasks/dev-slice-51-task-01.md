# Dev Slice 51 — Task 01

## Title

Public surface stability — output-shape specification for primary CLI commands

## Sources of truth

- `docs/development/current-state.md` — 0.7.x gap: "specifying expected output shape for
  each command in source-of-truth docs (no output-format spec exists for `derive`, `validate`,
  `reset`, `cleanup` result shapes)"
- `docs/development/roadmap.md` — 0.7.x primary goals: "output conventions", "common command
  flows feel intentional rather than provisional"
- `packages/provider-contracts/src/index.ts` — canonical type definitions for all output shapes
- `packages/core/src/orchestration.ts` — return types that determine output JSON structure

## Audit findings

### No source-of-truth spec for CLI output shapes

All primary commands emit structured output, but that structure is only implicitly proven by
existing acceptance tests. There is no spec document a user or script author can consult to
understand what field names are stable, what the refusal shape looks like, or which output goes
to stdout vs stderr.

This creates a public-surface stability risk: a minor version could silently change a field
name (e.g. `resourcePlans` → `plans`) without violating any explicit stability promise.

### Behavioral asymmetry between `run` and other commands (documented, not changed)

All primary commands (`derive`, `validate`, `reset`, `cleanup`) write both success and refusal
JSON to **stdout**. `run` is the exception: on refusal, it writes JSON to **stderr** and leaves
stdout empty. This was identified in Slice 47 as "in the spec's explicitly open area" and was
not changed. The output-shape spec should document this asymmetry truthfully.

### Deferred candidates

- `validate-worktree` / `validate-repository` surface classification — Slice 50 visually
  separated them in help text; further action requires a design decision about whether to
  remove/move them, which is not yet supported by a source-of-truth directive
- Per-command help text
- Changing any output shape (this slice documents the existing shapes; shape changes are a
  separate product decision)

## In scope

- `docs/spec/cli-output-shapes.md` (new)
  - General output conventions: stdout vs stderr, exit codes, one-JSON-line-per-invocation rule
  - Refusal shape (shared across all commands)
  - Per-command success output shapes: `derive` (json), `derive` (env), `validate`, `reset`,
    `cleanup`, `run`
  - Shared object shapes: DerivedResourcePlan, DerivedEndpointMapping, ResourceValidation,
    ResourceReset, ResourceCleanup
  - The `run` stdout/stderr asymmetry documented explicitly

- `tests/acceptance/cli-output-shapes.acceptance.test.ts` (new)
  - Acceptance tests that make the output-shape spec executable:
    - `derive` JSON success: `ok: true`, `resourcePlans` array, `endpointMappings` array
    - `derive` JSON failure: `ok: false`, `refusal.category`, `refusal.reason`, to stdout
    - `derive --format=env` success: KEY=VALUE lines, one per resource/endpoint
    - `validate` success: `ok: true`, adds `resourceValidations` array
    - `reset` success: `ok: true`, `resourcePlans`, `resourceResets`
    - `cleanup` success: `ok: true`, `resourcePlans`, `resourceCleanups`
    - `run` success: stdout empty, stderr empty
    - `run` refusal: stderr has refusal JSON, stdout empty

- `docs/development/tasks/dev-slice-51-task-01.md` (this file)

- `docs/development/current-state.md`
  - Add Slice 51 proving result

## Out of scope

- Changing any CLI output shape or field name
- Adding per-command help text
- `validate-worktree` / `validate-repository` surface classification
- Output shape for `validate-worktree` or `validate-repository` (utility commands)
- New commands or flags
- Output format other than JSON and KEY=VALUE env format

## Acceptance criteria

- `docs/spec/cli-output-shapes.md` exists and documents all primary command output shapes
  including the `run` stdout/stderr asymmetry
- Acceptance tests explicitly verify the shape contract properties for all primary commands
- All existing tests remain green
- `pnpm test:acceptance` and `pnpm test` pass

## Safety / refusal expectations

No refusal behavior is modified. No CLI code is changed. This slice is documentation and test
coverage only.
