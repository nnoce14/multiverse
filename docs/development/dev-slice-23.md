# Dev Slice 23 — CLI-Level Acceptance Coverage for Process-Scoped Lifecycle

## Status

Implemented on `main`

## Intent

Add CLI-level acceptance tests for `multiverse reset` and `multiverse cleanup` when a process-scoped resource is declared and registered.

Slices 21–22 proved the process-scoped provider works at the core API level. This slice closes the remaining coverage gap by exercising the full path from CLI arguments → providers module loading → process launch and termination, through the `runCli` function.

## Why this slice

Every other provider lifecycle path (name-scoped reset/cleanup, path-scoped reset/cleanup) has CLI-level acceptance coverage. Process-scoped is the only lifecycle capability that has been proven at the acceptance layer but not at the CLI invocation layer.

## Slice objective

1. Add a `process-scoped-test-providers.ts` fixture that exports a real `ProviderRegistry` using `createProcessScopedProvider`
2. Add `cli-process-scoped.acceptance.test.ts` proving that:
   - `multiverse reset` launches the declared process and returns success JSON
   - `multiverse cleanup` terminates the process and returns success JSON
   - `multiverse reset` with no worktree ID returns a non-zero exit with a refusal
   - each worktree instance gets its own isolated state directory

## Scope

- `tests/acceptance/fixtures/process-scoped-test-providers.ts`
- `tests/acceptance/cli-process-scoped.acceptance.test.ts`
- `docs/development/dev-slice-23.md`

## Out of scope

- Changes to the CLI, core, or providers
- Integration test tier (`tests/integration/`)
- Sample app changes

## Acceptance criteria

- `runCli(["reset", ...])` with a process-scoped resource returns exit code 0 and a JSON result with `resourceResets`
- `runCli(["cleanup", ...])` terminates the launched process and returns exit code 0
- `runCli(["reset", ...])` with an empty worktree ID returns exit code 1 and a refusal
- two distinct worktree IDs derive two distinct state directories at the CLI level
- all existing 189 tests remain green

## Definition of done

CLI acceptance tests prove that `reset` and `cleanup` commands work end-to-end with a real process-scoped provider, including process launch, state directory creation, and process termination.
