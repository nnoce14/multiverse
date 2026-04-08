# Dev Slice 41 — Task 01

## Title

Globally-linked binary reproducibility walkthrough: stale usage string fix and honest doc

## Sources of truth

- Globally-linked binary walkthrough performed against main as Slice 41 pre-work
- `apps/cli/src/index.ts` — CLI implementation and usage string
- `docs/guides/external-demo-guide.md` — formal binary section
- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` — governs auto-discovery

## Motivation

A cold-start walkthrough of the globally-linked binary path revealed one
load-bearing correctness gap and one documentation gap.

### Load-bearing gap: stale usage/help string

`apps/cli/src/index.ts:632` contains the fallback usage string shown when an
unknown command is invoked. It still shows `--worktree-id VALUE` as required in
every command (`derive`, `validate`, `reset`, `cleanup`, `run`). Since Slice 37
introduced auto-discovery, `--worktree-id` is optional in all five of those
commands. A second engineer who discovers the CLI by running it with no arguments
gets a misleading description of the interface.

### What the walkthrough found about the globally-linked binary path

The globally-linked binary (`pnpm setup` → `pnpm link --global` → `multiverse`)
works mechanically from within the multiverse workspace directory. All commands
behave identically to the `pnpm cli` path when `NODE_OPTIONS="--import tsx/esm"`
is set.

However, the path does NOT work from outside the workspace because:

1. `tsx` is a workspace devDependency. `NODE_OPTIONS="--import tsx/esm"` resolves
   `tsx` relative to CWD. From outside the workspace there is no `tsx` to find.
2. Provider packages (`@multiverse/provider-path-scoped` etc.) are workspace-local
   and not published to npm. Any `providers.ts` must import from those workspace
   packages. This makes the provider file always workspace-relative regardless of
   how the CLI is invoked.

The globally-linked binary is therefore not materially more capable than
`node apps/cli/bin/multiverse.js` at this point. Both require the workspace.
The guide's existing "What is deferred" note is correct; this slice adds the honest
in-workspace proof and structural limitation statement.

## In scope

- `apps/cli/src/index.ts`
  - Fix the fallback usage string to reflect that `--worktree-id` is optional
    in `derive`, `validate`, `reset`, `cleanup`, and `run` (marked `[--worktree-id VALUE]`)
  - Keep `validate-worktree --worktree-id VALUE` required (that subcommand still
    requires it)

- `tests/acceptance/dev-slice-41.acceptance.test.ts` (new)
  - Verify the unknown-command usage string shows `[--worktree-id VALUE]` (optional)
    for `derive` and does not contain the old required form

- `docs/guides/external-demo-guide.md`
  - Expand the "Using the formal binary" section to include a "Globally-linked
    binary" subsection documenting the steps that work from within the workspace
    (`pnpm setup`, build, `pnpm link --global`, `NODE_OPTIONS` invocation)
  - State the structural limitation clearly: only works from within the workspace
    (tsx is workspace-local; provider packages are not published to npm)

- `docs/development/tasks/dev-slice-41-task-01.md` (this file)
- `docs/development/current-state.md` (truth-alignment)
- `docs/development/repo-map.md` (slice count)

## Out of scope

- Fixing `tsx` resolution from outside the workspace (requires global tsx install
  or workspace compilation — a larger change)
- Publishing provider packages to npm
- A globally-installed binary that works without the workspace
- Changes to any provider or core package
- New commands, flags, or configuration options

## Acceptance criteria

- `multiverse` (unknown command) usage string shows `--worktree-id` as optional
  in `derive`, `validate`, `reset`, `cleanup`, and `run`
- The guide documents the globally-linked binary steps with the structural
  limitation stated explicitly
- `pnpm vitest run` passes with no regression

## What this slice proves and what it does not

**Proves:**
- The globally-linked binary path succeeds from within the multiverse workspace
  with `pnpm setup` + `NODE_OPTIONS="--import tsx/esm"`
- All commands (`derive`, `validate`, `run`, `reset`, `cleanup`) behave identically
  to the `pnpm cli` path through the linked binary
- The usage string accurately reflects current CLI behavior including optional
  `--worktree-id`

**Does not prove:**
- A globally-linked binary that works from outside the multiverse workspace
- A binary that loads TypeScript providers without `NODE_OPTIONS`
- Provider packages usable without a multiverse workspace clone
- Distribution outside the repository
