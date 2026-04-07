# Dev Slice 36 — Task 01

## Title

Cold-start getting-started guide: explicit repo-local path for the common workflow

## Sources of truth

- `docs/development/roadmap.md` — 0.5.x proving goals
- `docs/guides/external-demo-guide.md` — current consumer-facing guide
- `docs/development/current-state.md` — 0.5.x priority statement
- `apps/sample-express/` — canonical in-repo proving application

## Motivation

The 0.5.x proving question is: **can a second engineer follow the docs and
succeed without live guidance?**

The current external-demo-guide walks through `multiverse.json`, `providers.ts`,
`pnpm cli run`, worktree isolation, and reset/cleanup. But it has a critical
omission: it never states that it requires the reader to be operating from within
the multiverse repo root, with `pnpm install` already run and workspace packages
available. A cold-start engineer who reads it and tries to `import { createPathScopedProvider } from "@multiverse/provider-path-scoped"` has no path to
install that package — it is not on npm.

The formal `multiverse` binary exists (`apps/cli/bin/multiverse.js`, built by
`pnpm --filter @multiverse/cli build`) and can be linked globally with
`pnpm link --global`, but this path is undocumented as a getting-started step.

The most honest and valuable first 0.5.x slice is to make the current documented
path — the in-repo `pnpm cli` path — explicit, accurate, and followable from
scratch, using the existing `sample-express` application as the concrete reference.

This is not about building a full distribution/install pipeline. It is about
proving that the CURRENT path (repo-local) can be followed end-to-end by a second
engineer reading only the docs.

## In scope

- `docs/guides/external-demo-guide.md` (update)
  - Add a clear "How this guide works" section at the top that states:
    - This guide uses the repo-local `pnpm cli` invocation path
    - It requires a multiverse repo checkout with `pnpm install` completed
    - The provider packages (`@multiverse/provider-*`) are available as workspace
      packages within the multiverse repo — they do not need to be installed
      separately
    - All commands are run from the multiverse repo root
  - Update prerequisites to be explicit about the above
  - Update provider package imports in Step 2 to clarify they are workspace-local
  - Verify each step is accurate against the current CLI behavior

- `apps/sample-express/` (read, do not change unless broken)
  - Walk through the external-demo-guide steps using the sample-express app as
    the concrete reference, noting any gaps
  - If steps fail or are inaccurate, fix the guide (not the app)

- No new code changes to the CLI, core, or providers unless a concrete bug is
  discovered that blocks the cold-start path

## Out of scope

- Building or documenting the formal `multiverse` binary distribution path
  (that is 0.5.x follow-on work once the in-repo path is proven)
- npm publishing or package distribution
- New provider packages or CLI commands
- getting-started guide for the provider-authoring path (that is the
  provider-authoring-guide's job)
- broad CLI redesign or UX changes

## Acceptance criteria

- The external-demo-guide states explicitly at the top what the reader needs
  (multiverse repo checkout, pnpm install, commands run from repo root)
- The guide's Steps 1–7 are accurate and followable against the current CLI
  behavior
- No step assumes the reader has installed `@multiverse/*` packages separately
- `pnpm vitest run` continues to pass (no regression)

## Files expected to change

- `docs/guides/external-demo-guide.md` (update)
- `docs/development/tasks/dev-slice-36-task-01.md` (this file)

## Truth-alignment on completion

- `docs/development/current-state.md` — add Slice 36 proving result; update
  highest-value work section to reflect what remains in 0.5.x after this slice
- `docs/development/repo-map.md` — not required unless repo structure changes
- No version bump — posture is already at `0.5.0-alpha.1`

## What this slice proves and what it still does not prove

**Proves:**
- The in-repo `pnpm cli` path is honest and followable from scratch
- A second engineer who reads the external-demo-guide knows what they need
  and can follow it to a working result

**Does not prove:**
- The formal `multiverse` binary path (build + link + use)
- A zero-install path (npm install from registry)
- Cold-start success with the formal binary for an engineer who doesn't want
  to clone the full repo
