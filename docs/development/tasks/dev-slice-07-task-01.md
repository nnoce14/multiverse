# Dev Slice 07 — Task 01

## Title

Turn the intended workspace package folders into explicit ESM workspace packages

## Objective

Implement the minimum repository-structure upgrade required to make the current package boundaries real rather than conventional.

The existing repository already uses the intended package folders:

- `packages/core`
- `packages/provider-contracts`
- `packages/providers-testkit`

This task makes those directories explicit pnpm workspace packages with Node.js and TypeScript package conventions, then updates the touched import paths to use package names instead of cross-package relative filesystem imports.

## Sources of truth

Ground this task in:

- `docs/adr/0010-pnpm-workspace-monorepo-for-implementation.md`
- `docs/adr/0011-typescript-nodejs-for-initial-implementation.md`
- `docs/development/repo-map.md`
- `docs/development/implementation-strategy.md`
- `docs/development/dev-slice-03.md`

## Required outcome

Implement the minimum production-grade repository upgrade such that:

- the intended package folders are real workspace packages with their own manifests
- package boundaries are expressed through explicit workspace dependencies
- package entrypoints are explicit and ESM-oriented
- touched cross-package imports use package entry names rather than relative directory traversal

## In scope

- `package.json` manifests for the current workspace packages only
- explicit `type: "module"` package posture for those workspace packages
- explicit `exports` and dependency declarations for the current package set
- updating imports in `packages/` and `tests/` to use package names for the touched package paths
- lockfile and workspace install changes required by the slice

## Out of scope

- adding new packages
- broad build-pipeline redesign
- project references unless they are strictly required to make this slice work
- publish/release automation
- repo-wide lint or formatting expansion beyond what this slice needs
- new product behavior

## Acceptance criteria

- `packages/core`, `packages/provider-contracts`, and `packages/providers-testkit` each have explicit package manifests
- the manifests express the intended dependency direction from ADR 0010
- the touched cross-package imports use package public entry names
- the package manifests and imports work under the current Node.js/TypeScript toolchain
- `pnpm install`, `pnpm typecheck`, and the current acceptance, contract, and unit tests succeed

## Safety and boundary expectations

- do not introduce new package boundaries beyond the current intended set
- do not move business rules between packages
- do not use the package upgrade as justification for unrelated cleanup
- preserve explicit core/provider-contract/testkit separation while making the boundary concrete
