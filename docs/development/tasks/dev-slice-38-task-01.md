# Dev Slice 38 — Task 01

## Title

Formal `multiverse` binary path: build, invoke, and document the compiled CLI

## Sources of truth

- `docs/adr/0017-cli-package-and-binary-invocation-surface.md` — governing decision
- `docs/guides/external-demo-guide.md` — consumer-facing guide to update
- `apps/cli/` — CLI package with build infrastructure

## Motivation

ADR-0017 established the formal CLI binary direction: `apps/cli` builds to
`dist/index.js` via `tsc`, and `bin/multiverse.js` is a committed shebang wrapper
that bootstraps the compiled output. The `pnpm cli` dev path remains unchanged.

The gap: the external-demo-guide and README document only the `pnpm cli` path.
A second engineer who wants to invoke the compiled binary — without the `pnpm cli`
workspace script — has no documented path to follow.

This slice proves and documents one explicit formal binary invocation path that a
second engineer can follow from scratch.

## What pre-investigation established

Before writing this task doc, the following was verified against the current repo:

1. **Build step works**: `pnpm --filter @multiverse/cli build` compiles
   `apps/cli/src/index.ts` → `apps/cli/dist/index.js`. The `bin/multiverse.js`
   wrapper is already committed and does not need changes.

2. **Direct invocation works**: `node apps/cli/bin/multiverse.js` is a valid
   formal binary invocation. Auto-discovery (Slice 37) and conventional defaults
   (ADR-0014) behave identically to the `pnpm cli` path.

3. **TypeScript providers require a loader**: workspace provider packages export
   `.ts` files directly (no compiled JavaScript output). `node` cannot import them
   natively. Within the workspace, `NODE_OPTIONS="--import tsx/esm"` registers the
   tsx loader and resolves this.

4. **Global link has environment prerequisites**: `pnpm link --global` requires
   `pnpm setup` and PATH configuration that is environment-specific. End-to-end
   proof of a globally-linked `multiverse` command is deferred.

## In scope

- `docs/guides/external-demo-guide.md`
  - Add a "Using the formal binary" section documenting:
    - The build step (`pnpm --filter @multiverse/cli build`)
    - Direct invocation: `node apps/cli/bin/multiverse.js <command>`
    - The `NODE_OPTIONS="--import tsx/esm"` requirement for TypeScript providers
      within the current workspace setup
    - That this path and the `pnpm cli` path invoke the same underlying CLI logic
  - Make clear the `pnpm cli` path remains the primary recommendation for
    in-repo TypeScript provider development

- `docs/development/tasks/dev-slice-38-task-01.md` (this file)

- `docs/development/current-state.md` (truth-alignment on completion)
- `docs/development/repo-map.md` (slice count on completion)

## Out of scope

- Global link proof (`multiverse` on PATH without `node apps/cli/bin/...`)
  — requires environment-specific `pnpm setup`; deferred
- Compiling workspace packages to JavaScript — significant build-pipeline change;
  deferred
- Standalone binary without tsx dependency — requires bundling or compiled
  workspace packages; deferred
- npm publish or external distribution
- Changes to CLI behavior, commands, or output formats
- New provider packages or CLI commands

## Acceptance criteria

- A reader of the external-demo-guide can follow the formal binary steps without
  live guidance
- The documented steps are accurate against the current CLI implementation
- The `NODE_OPTIONS` requirement for TypeScript providers is stated explicitly
- The relationship between the `pnpm cli` path and the formal binary path is clear
- `pnpm vitest run` continues to pass with no regression

## What this slice proves and what it does not

**Proves:**
- The formal binary (`node apps/cli/bin/multiverse.js`) can be built and invoked
- Auto-discovery, conventional defaults, and all CLI behavior is identical through
  the formal binary path
- A second engineer can follow documented steps to build and use the compiled binary

**Does not prove:**
- A globally-linked `multiverse` command (`pnpm link --global`)
- A binary that works without `tsx` for TypeScript provider files
- Distribution outside the repository
