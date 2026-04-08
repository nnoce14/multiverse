# Dev Slice 40 — Task 01

## Title

Cold-start reproducibility walkthrough: README and roadmap truth-alignment

## Sources of truth

- Cold-start walkthrough performed against main as Slice 40 pre-work
- `README.md` — entry point for second engineers
- `docs/development/roadmap.md` — version posture record
- `docs/development/current-state.md` — authoritative state document

## Motivation

A cold-start walkthrough against `main` (Slice 40) verified that the documented
end-to-end workflow now succeeds cleanly. Every step of the external-demo-guide
executed correctly: sample-express runs, multi-worktree isolation is distinct,
reset and cleanup work, formal binary path works, auto-discovery works.

Two stale truth-alignment gaps remain from Slices 37 and the `0.5.0-alpha.1`
posture bump:

### Gap 1 — README says `--worktree-id` is "always required"

`README.md:173`:

> `--worktree-id` is always required.

This was true before Slice 37. After Slice 37 introduced automatic worktree-id
discovery, `--worktree-id` is optional when invoked from inside a git worktree.
The README is the repo entry point for second engineers; a reader who internalizes
this claim would either be confused when omitting `--worktree-id` succeeds, or
would never discover auto-discovery exists. The external-demo-guide is correct;
the README contradicts it.

### Gap 2 — `roadmap.md` version posture is stale

`roadmap.md` still reads `Current version posture: 0.4.0-alpha.1`. The posture
bump to `0.5.0-alpha.1` was captured in `current-state.md` and `package.json`
but not in `roadmap.md`. A second engineer reading both documents sees a
contradiction in the stated posture.

## In scope

- `README.md`
  - Fix `--worktree-id is always required` → accurate description of current
    behavior (optional with auto-discovery, always accepted as explicit override)
  - Fix CLI usage example `--format=env` → space form `--format env` as primary
    (both forms are now accepted, but space form is the documented primary per Slice 39)

- `docs/development/roadmap.md`
  - Update `Current version posture` to `0.5.0-alpha.1` with accurate `0.5.x` meaning

- `docs/development/tasks/dev-slice-40-task-01.md` (this file)

- `docs/development/current-state.md` (Slice 40 walkthrough result)
- `docs/development/repo-map.md` (slice count)

## Out of scope

- Changes to CLI behavior
- New acceptance tests (no new behavior being introduced)
- Changes to the external-demo-guide (already correct)
- Changes to provider code or configuration schema
- Any new feature or ergonomic improvement not grounded in the walkthrough

## Acceptance criteria

- `README.md` no longer says `--worktree-id` is always required
- `README.md` accurately describes optional auto-discovery with explicit override
- `roadmap.md` `Current version posture` reads `0.5.0-alpha.1`
- `pnpm vitest run` passes with no regression

## What this slice proves and what it does not

**Proves:**
- The documented end-to-end workflow (external-demo-guide) now succeeds cleanly
  for a second engineer without live guidance
- All remaining `0.5.x` cold-start blockers identified through walkthrough are
  now closed or addressed
- The README and roadmap no longer contain stale claims that contradict current
  behavior

**Does not prove:**
- The globally-linked `multiverse` binary path
- Step 5 with actual separate git worktree checkouts (simulated with `--worktree-id`)
- Distribution outside the repository
