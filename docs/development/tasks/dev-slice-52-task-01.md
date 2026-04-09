# Dev Slice 52 — Task 01

## Title

Public surface stability — complete the `--help` Options section and retire stale guidance

## Sources of truth

- `docs/development/current-state.md` — "What kinds of work are highest-value right now"
  lists "auditing and improving CLI help output" and "specifying expected output shape" as
  pending; both are done (Slices 50–51) but the section was not updated
- `docs/development/roadmap.md` — 0.7.x goal: "CLI help text" and "common command flows feel
  intentional rather than provisional"
- `apps/cli/src/index.ts` — `USAGE_LINES` constant introduced in Slice 50

## Audit findings

### `USAGE_LINES` Options section is incomplete

Slice 50 introduced structured help text with an Options section that lists three common flags.
Two flags are missing from the Options section:

1. **`--help` / `-h`** — added in Slice 50, works correctly, but the help text does not
   self-describe it. A user reading `--help` output cannot tell that `--help` is itself a
   supported flag from the Options section.

2. **`--format`** — visible in the derive command line as `[--format json|env]` but has no
   entry in the Options section with a description or default. This makes the help text look
   inconsistently structured.

### `current-state.md` guidance section is stale

The "What kinds of work are highest-value right now" section still lists two items as pending
that are now complete:
- "the current `--help` surface is a raw usage string, not a structured help system" (done, Slice 50)
- "no output-format spec exists for `derive`, `validate`, `reset`, `cleanup` result shapes" (done, Slice 51)

The "Practical instruction" numbered list references steps 1–4 in a sequence that was valid
before Slices 50–51; steps 1 and 2 are now mostly done.

Leaving these stale causes future contributors and coding agents to attempt work that is already
complete.

## In scope

- `apps/cli/src/index.ts`
  - Extend `USAGE_LINES` to include an "Options:" subsection for `--help`/`-h`
  - Add a separate "Options (derive only):" subsection for `--format json|env` with a default
    note
  - No other code changes

- `tests/acceptance/cli-help-flag.acceptance.test.ts`
  - Add tests that the help text includes `--help` in the Options section
  - Add tests that the help text includes `--format` in the Options section

- `docs/development/current-state.md`
  - Remove the two stale bullets from "What kinds of work are highest-value right now"
    (help-output and output-shape items are done)
  - Update "Practical instruction for contributors and agents" to reflect current state
  - Add Slice 52 proving result

- `docs/development/tasks/dev-slice-52-task-01.md` (this file)

## Out of scope

- Changing any flag names or CLI behavior
- Utility-command classification (`validate-worktree`, `validate-repository`) — still deferred,
  needs a design decision
- Per-command help text
- Guide updates (guide already accurately describes invocation; cross-referencing the output
  spec is a possible future slice but is not the load-bearing gap here)
- Output shape changes

## Acceptance criteria

- `runCli(["--help"]).stdout.join("\n")` contains `--help` in the Options section
- `runCli(["--help"]).stdout.join("\n")` contains `--format` in the Options section
- All existing `--help` exit-code and output-routing tests continue to pass
- `current-state.md` "What kinds of work" no longer lists done items as pending
- `pnpm test:acceptance` and `pnpm test` pass

## Safety / refusal expectations

No refusal behavior is touched. The `USAGE_LINES` change is additive only (new lines added).
