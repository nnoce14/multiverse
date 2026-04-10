# Dev Slice 56 — Task 01

## Title

Remove `validate-worktree` (Option B from utility-command decision memo)

## Decision authority

`docs/development/tasks/utility-command-surface-decision-memo.md` — Option B chosen.

## Rationale

`validate-worktree` validated that a worktree identity string is non-empty and non-blank.
ADR-0021 (Slice 37) embedded that same validation into every primary command's path via
`discoverWorktreeId` / `readCommonOptions`. A caller who passes an invalid or missing
`--worktree-id` to any primary command receives an actionable refusal. The standalone
command replicates existing inline behavior without adding user-facing value.

`validate-repository` is retained: it lints a config file independently of providers,
worktree identity, and git state. That capability has no equivalent elsewhere on the surface.

The `validateWorktreeIdentity` function in `@multiverse/core` is NOT removed — it is still
used internally by the CLI's auto-discovery path (`discoverWorktreeId`). Only the CLI
command that exposed it as a standalone surface is removed.

## In scope

- `apps/cli/src/index.ts`
  - Remove `validateWorktreeIdentity` from the named import
  - Remove `handleValidateWorktree` function
  - Remove `validate-worktree` dispatch case from `runCli()`
  - Remove `"  validate-worktree    --worktree-id VALUE"` from `USAGE_LINES`

- `tests/acceptance/dev-slice-10.acceptance.test.ts`
  - Remove the two `validate-worktree` test cases
  - Keep all `validate-repository` and `derive` test cases

- `tests/acceptance/dev-slice-41.acceptance.test.ts`
  - Remove the test that verifies `validate-worktree` appears in the usage string
  - Update the file description comment

- `tests/acceptance/cli-help-flag.acceptance.test.ts`
  - Update the utility-section-label test to verify the label precedes
    `validate-repository` only (not `validate-worktree`)

- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md`
  - Add a short amendment note: `validate-worktree` removed; rationale follows from
    this ADR (inline validation in primary commands makes standalone command redundant)

- `docs/development/tasks/utility-command-surface-decision-memo.md`
  - Mark the memo status as "Resolved — Option B implemented (Slice 56)"

- `docs/development/current-state.md`
  - Add Slice 56 proving result

- `docs/development/tasks/dev-slice-56-task-01.md` (this file)

## Out of scope

- Removing `validateWorktreeIdentity` from `@multiverse/core` — internal function, still
  used by `discoverWorktreeId` in the CLI
- Removing unit tests in `tests/unit/worktree-identity-boundary.test.ts` — they test the
  core function, not the CLI command
- Renaming or restructuring `validate-repository`
- Adding `validate-repository` to the guide
- Any CLI behavior changes beyond the removal
- Guide redesign or new doc sections

## Acceptance criteria

- `runCli(["validate-worktree", "--worktree-id", "x"])` returns exit 1 with usage
  to stderr (unknown command fallback)
- `runCli(["validate-repository", "--config", configPath])` still works correctly
- `runCli(["--help"]).stdout.join("\n")` does not contain `validate-worktree`
- `runCli(["--help"]).stdout.join("\n")` still contains `validate-repository`
- `runCli(["--help"]).stdout.join("\n")` still contains the `Utility commands` label
- `pnpm test` passes

## Compatibility note

This is a breaking change for any caller that uses `validate-worktree` directly.
The command is not documented in the guide, has no scenario coverage, and has no
established external user workflow. The blast radius is expected to be minimal.
Callers that need worktree identity validation can run any primary command with the
target worktree id and inspect the refusal if the id is invalid.
