# Dev Slice 10 — Task 01

## Title

Add a thin CLI entrypoint for validated application-boundary input

## Objective

Implement the minimum CLI seam that makes current validated boundary behavior tangible without inventing provider loading, runtime wiring, or broader orchestration behavior.

This task should expose already-proven validation paths through `apps/cli` while keeping business rules in core.

## Sources of truth

Ground this task in:

- `docs/adr/0010-pnpm-workspace-monorepo-for-implementation.md`
- `docs/adr/0011-typescript-nodejs-for-initial-implementation.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/system-boundary.md`
- `docs/development/repo-map.md`
- `docs/development/dev-slice-03.md`

## Required outcome

Implement the minimum production change such that:

- `apps/cli` exists as a thin application entrypoint package
- the CLI can accept raw application input for one already-proven validation path
- successful validation returns structured output suitable for human or machine use
- failed validation returns stable structured validation output

## In scope

- a real `apps/cli` workspace package
- one or two narrow validation-oriented CLI commands
- tests proving the CLI accepts valid raw input and rejects invalid raw input
- minimal root script wiring needed to run the CLI during development

## Out of scope

- provider registration or discovery
- runtime wiring to real provider implementations
- derive/reset/cleanup CLI orchestration
- rich CLI UX
- broad command catalog
- output formatting beyond what the thin seam needs

## Acceptance criteria

- the CLI validates one raw worktree identity input path
- the CLI validates one raw repository configuration input path
- invalid CLI input returns structured validation output without smearing logic into the app layer
- the CLI package depends on core through workspace package boundaries only

## Safety and boundary expectations

- the CLI remains a thin app layer
- core retains validation and business-rule ownership
- the CLI does not invent provider wiring or hidden defaults
