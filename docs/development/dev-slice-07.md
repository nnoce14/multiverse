# Dev Slice 07 — Explicit ESM Workspace Packages

## Status

Implemented on `main`

## Intent

Make the intended package folders into explicit workspace packages with package-managed entrypoints and dependency direction, so the repository boundaries are concrete rather than conventional.

This slice turns the package structure into something the toolchain can enforce directly.

## Why this slice after the initial core slices

The core validation and orchestration slices established the business model.

The next implementation boundary is the package boundary itself.

Before later CLI and provider work can remain cleanly separated, the workspace packages need to exist as first-class Node.js and TypeScript packages with explicit exports and workspace dependencies.

## Slice objective

Implement the workspace-package boundary upgrade such that:

1. the intended package folders have explicit `package.json` manifests
2. package boundaries are expressed through explicit workspace dependencies
3. package entrypoints are explicit and ESM-oriented
4. touched cross-package imports use public package entry points rather than relative filesystem paths

## Scope

This slice includes:

- `package.json` manifests for the current workspace packages
- explicit `type: "module"` posture for the workspace packages
- explicit `exports` and dependency declarations for the current package set
- import-path updates for the touched package paths
- lockfile and workspace-install changes required by the package upgrade

## Out of scope

This slice does not include:

- adding new packages
- broad build-pipeline redesign
- project references unless strictly required
- publish or release automation
- repo-wide lint or formatting expansion
- new product behavior

## Architectural stance

Package structure should mirror the responsibility model already established elsewhere.

The point of this slice is not to invent new abstractions.

It is to make the existing package boundaries enforceable by the workspace toolchain and import graph.

## Acceptance criteria

- `packages/core`, `packages/provider-contracts`, and `packages/providers-testkit` each have explicit package manifests
- the manifests express the intended dependency direction from the workspace-monorepo ADR
- the touched cross-package imports use package public entry names
- the package manifests and imports work under the current Node.js/TypeScript toolchain
- `pnpm install`, `pnpm typecheck`, and the current acceptance, contract, and unit tests succeed

## Expected artifacts

- explicit workspace package manifests
- ESM package exports
- workspace dependency wiring
- updated cross-package import paths

## Definition of done

This slice is done when the intended package folders are real workspace packages, and the repository can rely on package boundaries instead of informal filesystem convention.
