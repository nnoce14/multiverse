# Dev Slice 07 — Scenario Map

## Slice theme

Explicit ESM workspace packages

## Scenario goal

Demonstrate that the intended package folders behave as concrete workspace packages with explicit entrypoints and boundary-respecting imports.

This scenario map is intentionally narrow.
It proves package boundary enforcement, not new product behavior.

## Primary feature area

### Feature area A — Make workspace packages explicit

#### Scenario A1.1

Given the intended workspace package folders  
When the workspace is installed  
Then each package has an explicit manifest and package entrypoint

### Feature area B — Preserve boundary-respecting imports

#### Scenario B1.1

Given cross-package code in the touched implementation path  
When the code imports another workspace package  
Then the import uses the owning package’s public entry point

#### Scenario B1.2

Given touched package imports in tests  
When the test suite is run  
Then the imports resolve through package names rather than relative filesystem traversal

### Feature area C — Keep the toolchain working

#### Scenario C1.1

Given the explicit workspace package layout  
When `pnpm install`, `pnpm typecheck`, and the suite run  
Then the workspace remains usable under the current Node.js and TypeScript toolchain

## Recommended test layering

### Acceptance / behavior tests

Use these to prove:

- the workspace packages can be consumed through their public entrypoints
- the boundary-preserving import graph works end to end

### Integration checks

Use these to prove:

- `pnpm install`
- `pnpm typecheck`
- acceptance, contract, and unit suites

## Minimum viable scenario set

The leanest proof set for this slice is:

1. workspace packages are explicit
2. public package entrypoints resolve
3. touched imports use package names
4. the workspace toolchain remains green
