# Dev Slice 39 — Task 01

## Title

Cold-start reproducibility fixes: equals-form argument parsing and concrete sample-app reference

## Sources of truth

- Cold-start walkthrough performed against main as Slice 39 pre-work
- `docs/guides/external-demo-guide.md` — consumer-facing guide
- `apps/cli/src/index.ts` — CLI argument parsing
- `apps/sample-express/` — canonical in-repo proving application

## Motivation

The 0.5.x proving question is: can a second engineer follow the docs and succeed
without live guidance?

A cold-start walkthrough against the current guide revealed two load-bearing
friction points that block end-to-end success:

### Friction 1 — Silent CLI bug: equals-form arguments are ignored

`readOption` only handles `--flag value` (space-separated). The `--flag=value`
equals form is silently ignored — the flag's value is dropped and the default
behavior applies.

Confirmed breakage:
- `--format=env` → silently returns JSON (guide Step 6 uses this form)
- `--worktree-id=X` → silently falls back to auto-discovery

This is the worst kind of friction: no error, wrong output, no indication anything
is wrong.

### Friction 2 — No concrete application to run

Steps 1–3 are followable. Step 4 uses `node server.js` as a generic placeholder.
A cold-start engineer without their own app cannot complete the walkthrough.
The canonical in-repo sample application (`apps/sample-express`) is never
referenced in the guide. The command to run it is not documented.

### Minor friction also addressed

- Guide Step 5 port examples (5100/5101) do not match actual derivation output,
  since ports are computed from the worktree id hash. Clarified in the guide.
- Guide Step 5 does not explain when explicit `--worktree-id` applies vs when
  auto-discovery is sufficient. Added a brief clarifying note.

## In scope

- `apps/cli/src/index.ts`
  - Update `readOption` to parse both `--flag value` and `--flag=value` forms
  - All flags (`--config`, `--providers`, `--worktree-id`, `--format`) inherit the fix

- `tests/acceptance/dev-slice-39.acceptance.test.ts` (new)
  - `--format=env` works with equals form
  - `--worktree-id=X` overrides auto-discovery when passed with equals form

- `docs/guides/external-demo-guide.md`
  - Step 4: add a "Try it with the sample app" subsection showing the concrete
    command for `apps/sample-express`
  - Step 6: update to use `--format env` (space form) as the primary example;
    note that `--format=env` equals form also works after this fix
  - Step 5: replace concrete port examples with a note that ports are derived
    deterministically from the worktree id; add a brief note on when explicit
    `--worktree-id` applies vs auto-discovery

- `docs/development/tasks/dev-slice-39-task-01.md` (this file)

## Out of scope

- Changes to argument parsing beyond `readOption` (no new flag shapes or positional args)
- New commands, providers, or configuration options
- The globally-linked `multiverse` binary path (deferred in Slice 38)
- Any fix that is not directly grounded in the cold-start walkthrough findings

## Acceptance criteria

- `--format=env` produces KEY=VALUE output (not JSON)
- `--format json` still produces JSON output
- `--worktree-id=feature-login` overrides auto-discovery (worktree id = "feature-login")
- A cold-start reader following Step 4 of the external-demo-guide has a concrete
  runnable command they can use without bringing their own application
- `pnpm vitest run` passes with no regression

## Files expected to change

- `apps/cli/src/index.ts`
- `tests/acceptance/dev-slice-39.acceptance.test.ts` (new)
- `docs/guides/external-demo-guide.md`
- `docs/development/current-state.md` (truth-alignment)
- `docs/development/repo-map.md` (slice count)
- `docs/development/tasks/dev-slice-39-task-01.md` (this file)

## What this slice proves and what it does not

**Proves:**
- A second engineer following the guide can run commands in either argument form
  without silent failures
- A cold-start reader can complete the end-to-end workflow using the in-repo
  sample application without needing to bring their own app
- The most load-bearing cold-start friction points identified in the walkthrough
  are closed

**Does not prove:**
- The walkthrough succeeds with the globally-linked `multiverse` binary
- Step 5 parallel worktree proof with actual separate git worktree checkouts
- Every possible argument form or edge case in CLI parsing
