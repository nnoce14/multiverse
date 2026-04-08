# Dev Slice 43 — Task 01

## Title

Compiled/global binary usability: no manual `NODE_OPTIONS` for TypeScript providers (workspace scope only)

## Sources of truth

- `docs/development/current-state.md` — current 0.5.x priority
- `docs/development/roadmap.md` — 0.5.x usability direction
- `docs/guides/external-demo-guide.md` — formal binary workflow
- `docs/guides/provider-authoring-guide.md` — explicit provider loading boundary

## Motivation

After Slice 42 and the follow-up public truth-alignment pass, the documented
second-engineer workflow is proven end-to-end on `main`.

The highest-value remaining friction in current 0.5.x scope is that compiled and
globally-linked binary invocation requires users to manually set:

`NODE_OPTIONS="--import tsx/esm"`

for TypeScript provider modules.

This friction is procedural and avoidable in the current workspace model.

## In scope

- `tests/acceptance/dev-slice-43.acceptance.test.ts` (new)
  - prove compiled binary invocation succeeds with TypeScript providers without
    manually supplying `NODE_OPTIONS`
  - keep proof in workspace scope only

- `apps/cli/src/index.ts`
  - add the narrowest safe provider-loading fallback needed to support
    TypeScript provider modules without manual `NODE_OPTIONS` in the current
    workspace model
  - preserve existing explicit provider module behavior and refusal/error shape

- `docs/guides/external-demo-guide.md`
  - update formal binary guidance to reflect no manual `NODE_OPTIONS` requirement
    in current workspace path if implementation is proven
  - keep outside-workspace limitations explicit

- `docs/development/current-state.md`
- `docs/development/repo-map.md`
  - truth-align slice completion and current 0.5.x status

## Out of scope

- Packaging/distribution redesign outside the workspace
- Provider discovery or auto-registration
- New provider shapes
- Major CLI redesign
- Claims that globally-linked binary use outside workspace is solved

## Acceptance criteria

- Compiled binary invocation (`node apps/cli/bin/multiverse.js ...`) can load
  a TypeScript providers module in current workspace scope without requiring the
  user to set `NODE_OPTIONS` manually
- Existing CLI behavior is unchanged for explicit provider loading semantics
- `scripts/codex-env.sh pnpm vitest run` passes

## What this slice proves and what it does not

**Proves:**
- Within current workspace scope, TypeScript provider modules can be loaded on
  compiled/global binary paths without users manually setting `NODE_OPTIONS`

**Does not prove:**
- Provider distribution/packaging outside the workspace
- Full outside-workspace global-binary usability
- Any new provider model behavior beyond loader usability
