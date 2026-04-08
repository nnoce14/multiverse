# Dev Slice 42 — Task 01

## Title

Real git worktree proof: parallel isolation with auto-discovery

## Sources of truth

- `docs/guides/external-demo-guide.md` — Step 5 is the target
- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` — governs auto-discovery
- `docs/development/current-state.md` — 0.5.x checkpoint assessment

## Motivation

The 0.5.x proving question is: can a second engineer use Multiverse successfully
from docs without live guidance?

All documented steps have been proven end-to-end — except one.

**Step 5** (run two worktrees simultaneously) has only ever been simulated by
passing `--worktree-id` explicitly. Every walkthrough used `--worktree-id main`
and `--worktree-id feature-login` as stand-ins. The product's central claim —
"Multiverse gives each git worktree isolated, non-colliding runtime values
automatically" — has never been exercised against actual `git worktree add`
checkouts of the same repository.

This is the last remaining substantive 0.5.x gap. Closing it proves:

1. Auto-discovery resolves distinct identities from two real git worktree
   directories without any `--worktree-id` argument.
2. The two derived configurations (DB path, port) are distinct and non-colliding.
3. A second engineer following Step 5 gets the stated behavior with real git
   worktrees, not just simulated identity strings.

### What this slice does not need to prove

- Two servers running simultaneously (proving derived values are distinct is
  sufficient; server startup is already proven in Step 4)
- Worktrees outside the multiverse repo (the proof uses the multiverse repo
  itself as the target application via `apps/sample-express/`)

## In scope

- `tests/acceptance/dev-slice-42.acceptance.test.ts` (new)
  - Create a real `git worktree add` checkout of the current repo in a temp dir
  - Call `runCli` with `cwd` set to the worktree directory — no `--worktree-id`
  - Call `runCli` with `cwd` set to the primary checkout — no `--worktree-id`
  - Assert the two resolved worktree IDs are different (auto-discovery)
  - Assert the two derived DB paths are distinct (no collision)
  - Assert the two derived ports are distinct (no collision)
  - Clean up the worktree after the test

- `docs/guides/external-demo-guide.md`
  - Step 5: replace generic `node server.js` with the sample-express concrete
    command (consistent with Step 4)
  - Step 5: add a note that with real git worktrees, no `--worktree-id` is needed
    — auto-discovery handles identity from each worktree's directory path
  - Step 5: clarify that `--worktree-id` remains available as an explicit override

- `docs/development/tasks/dev-slice-42-task-01.md` (this file)
- `docs/development/current-state.md` (truth-alignment)
- `docs/development/repo-map.md` (slice count)

## Out of scope

- Running two servers concurrently in the acceptance test
- Worktrees of repositories other than the multiverse repo
- Changes to auto-discovery logic (Slice 37 — already proven)
- Changes to CLI behavior, providers, or configuration schema
- `NODE_OPTIONS` elimination
- Global binary outside-workspace proof

## Acceptance criteria

- Acceptance test creates a real git worktree, verifies distinct identity
  resolution and non-colliding derived values from each — with no `--worktree-id`
- Guide Step 5 uses the sample-express concrete command
- Guide Step 5 accurately reflects that real git worktrees need no `--worktree-id`
- `pnpm vitest run` passes with no regression

## What this slice proves and what it does not

**Proves:**
- Auto-discovery resolves distinct worktree identities from two actual git
  worktree directories of the same repository
- The derived runtime configurations (DB path, port) are isolated and distinct
  between the two worktrees — no collision
- A second engineer following Guide Step 5 with real git worktrees gets the
  behavior described, without needing to pass `--worktree-id`

**Does not prove:**
- Two servers running simultaneously (Step 4 covers single-server startup)
- Worktrees of external application repositories independent of the multiverse
  workspace
- `NODE_OPTIONS` elimination or global binary outside the workspace
