# Dev Slice 50 — Task 01

## Title

Public surface stability — `--help` / `-h` flag behavior and structured usage text

## Sources of truth

- `docs/development/current-state.md` — 0.7.x priority statement; "auditing and improving CLI
  help output (the current `--help` surface is a raw usage string, not a structured help system)"
- `docs/development/roadmap.md` — 0.7.x primary goals: "CLI help text", "common command flows
  feel intentional rather than provisional"
- `docs/guides/external-demo-guide.md` — "Using the formal binary" section explicitly shows
  `multiverse --help` as a step to verify the globally-linked binary is working

## Audit findings

### `--help` / `-h` exits 1

Running `pnpm cli --help` or `multiverse --help` falls through the unknown-command path and
returns exit code 1 with the usage blob written to stderr.

The external-demo-guide uses `multiverse --help` as a verification step:
```
multiverse --help
```

A command that exits 1 when used for verification silently misleads the caller (shell scripts,
CI verification steps, onboarding checklists). The standard expectation is exit 0.

### Usage string is a single unreadable blob

The current fallback message is a 250+ character single-line string:

```
Usage: multiverse <validate-worktree --worktree-id VALUE | validate-repository --config PATH | ...>
```

This is not scannable. Current-state.md names this gap explicitly.

### Secondary gaps (deferred — not in this slice)

- Whether `validate-worktree` and `validate-repository` belong on the same surface as primary
  commands — kept in the structured help for now; their surface classification is a separate
  design question
- Per-command help (`multiverse derive --help`)
- Output format specification for individual commands

## In scope

- `apps/cli/src/index.ts`
  - Add `USAGE_LINES` constant: structured multi-line help text (array of strings)
  - Add `--help` / `-h` handling at the start of `runCli`: returns `exitCode: 0`, prints
    `USAGE_LINES` to stdout
  - Replace the single-line unknown-command fallback with `USAGE_LINES` sent to stderr,
    exit 1

- `tests/acceptance/dev-slice-41.acceptance.test.ts`
  - Update pattern assertions to join stderr lines before matching (currently assumes single
    usage line; multi-line output breaks the find-one-line approach)

- `tests/acceptance/cli-help-flag.acceptance.test.ts` (new)
  - `--help` exits 0 and writes to stdout, not stderr
  - `-h` exits 0 and writes to stdout, not stderr
  - Help text contains each primary command name
  - Unknown command exits 1 and writes to stderr

- `docs/development/tasks/dev-slice-50-task-01.md` (this file)

- `docs/development/current-state.md`
  - Add Slice 50 proving result

## Out of scope

- Classifying or reclassifying `validate-worktree` / `validate-repository`
- Per-command help text
- Changing `usage()` error messages for specific option errors (missing --config, unknown --format, etc.)
- Output format specification work
- Any new commands or flags beyond `--help` / `-h`

## Acceptance criteria

- `runCli(["--help"])` returns `exitCode: 0` with non-empty stdout and empty stderr
- `runCli(["-h"])` returns `exitCode: 0` with non-empty stdout and empty stderr
- Help stdout contains the names of all primary commands: `derive`, `validate`, `reset`,
  `cleanup`, `run`
- Unknown command still exits 1 with usage text to stderr
- All existing acceptance and unit tests remain green
- `pnpm test:acceptance` and `pnpm test:unit` pass

## Safety / refusal expectations

No refusal behavior is touched. The `usage()` function for specific option errors is unchanged.
