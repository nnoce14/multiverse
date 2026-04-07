# Dev Slice 37 — Task 01

## Title

Automatic worktree-id discovery: git-worktree-path conventional default

## Sources of truth

- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` — governing decision
- `docs/adr/0003-main-checkout-uses-reserved-main-identity.md` — main identity rule
- `docs/adr/0002-branch-name-is-metadata.md` — branch name is not identity
- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md` — refusal contract
- `docs/adr/0014-strict-conventional-defaults.md` — amended by ADR-0021

## Motivation

The 0.5.x proving question is: can a second engineer follow the docs and succeed
without live guidance?

Every CLI command currently requires `--worktree-id` explicitly. When an engineer
is already operating from inside a git worktree directory (the common case), they
must look up or remember the id they chose and type it on every invocation.

ADR-0021 establishes a strict, inspectable conventional default: if `--worktree-id`
is omitted, the CLI reads the current worktree's path from `git worktree list`,
derives the id from the path basename (or `"main"` for the main checkout), and
proceeds. If discovery cannot safely resolve, it refuses with an actionable message.

This is the same pattern as `--config`/`--providers` defaults. It is not inference.

## In scope

- `apps/cli/src/index.ts`
  - Add `discoverWorktreeId(cwd: string): { id: string } | { error: string }`
    helper function that runs `git worktree list --porcelain`, parses the output,
    and returns the id or an error string
  - Modify `readCommonOptions` to: attempt discovery when `--worktree-id` is absent,
    convert discovery errors to `CliResult` usage errors
  - All five commands that call `readCommonOptions` inherit the behavior:
    `derive`, `validate`, `run`, `reset`, `cleanup`

- `tests/acceptance/dev-slice-37.acceptance.test.ts` (new)
  - Acceptance test: automatic discovery success (cwd = repo root → id = "main")
  - Acceptance test: explicit `--worktree-id` override (overrides discovery)
  - Acceptance test: discovery refusal when cwd is not inside a git worktree

- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` (already written)

- `docs/guides/external-demo-guide.md` (update)
  - Note that `--worktree-id` is now optional when invoking from inside a git worktree
  - Keep examples that show explicit `--worktree-id` as the override form

## Out of scope

- The formal `multiverse` binary path (Slice 38)
- Branch-name-based discovery (ADR-0002: branch name is metadata only)
- Persistent registry or UUID-based identity (deferred; "recreated worktree gets
  new lifecycle identity" scenario not addressed here)
- Changes to provider contracts or core business logic
- New commands or new output formats
- Any inference of resources, providers, or configuration from git state

## Discovery algorithm

```
1. If --worktree-id present → use it, skip discovery
2. Run: git worktree list --porcelain (from cwd)
3. Parse porcelain blocks → list of { path, isMain }
   - First block = main worktree → isMain = true
4. Find block whose path is a prefix of (or equal to) cwd
5. If main worktree matched → id = "main"
6. If linked worktree matched → id = path.basename(entry.path)
7. If no match, empty basename, or git fails → refuse with message:
   "Cannot determine worktree identity from git state. Pass --worktree-id explicitly."
```

## Refusal cases

| Condition | Refusal message |
|---|---|
| `git` unavailable or not a repo | "Cannot determine worktree identity from git state. Pass --worktree-id explicitly." |
| cwd not inside any known worktree | same |
| resolved basename is empty | same |

## Acceptance criteria

- `pnpm cli derive` (no `--worktree-id`) from within the multiverse repo root
  succeeds and uses `"main"` as the worktree id
- `pnpm cli derive --worktree-id explicit-id` uses `"explicit-id"` and does not
  attempt discovery
- `pnpm cli derive` (no `--worktree-id`) from a temp directory outside any git
  repo refuses with an actionable message
- `pnpm vitest run` passes with no regressions

## Files expected to change

- `apps/cli/src/index.ts`
- `tests/acceptance/dev-slice-37.acceptance.test.ts` (new)
- `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` (already written)
- `docs/guides/external-demo-guide.md`
- `docs/development/tasks/dev-slice-37-task-01.md` (this file)

## Truth-alignment on completion

- `docs/development/current-state.md` — add Slice 37 proving result; update
  highest-value work section (formal binary path becomes the next named item)
- `docs/development/repo-map.md` — update slice count to 37

## What this slice proves and what it does not

**Proves:**
- The CLI can reduce the most common invocation friction without inference
- Discovery is strict and inspectable (git worktree structure)
- Refusal-first behavior is preserved for ambiguous cases
- `--worktree-id` remains a reliable explicit override

**Does not prove:**
- Stable identity across worktree recreation at the same path
- Identity management for non-git environments
- The formal `multiverse` binary invocation path
