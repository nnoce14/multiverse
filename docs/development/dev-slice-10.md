# Dev Slice 10 — Thin CLI Validation Entrypoint

## Status

Implemented on `main`

## Intent

Expose the already-proven validation seams through a thin CLI entrypoint so raw application input can be validated at the boundary without moving business rules into the app layer.

This slice keeps the CLI limited to parsing, delegation, and structured output.

## Why this slice after the trusted core seams

By the time this slice lands, the core already has validated worktree identity and repository-configuration paths.

The CLI should not re-implement those rules.

It should make them tangible to the user while keeping the app boundary thin.

## Slice objective

Implement the CLI validation seam such that:

1. `apps/cli` exists as a thin application entrypoint package
2. the CLI accepts raw application input for one already-proven validation path
3. successful validation returns structured output suitable for human or machine use
4. failed validation returns stable structured validation output

## Scope

This slice includes:

- a real `apps/cli` workspace package
- narrow validation-oriented CLI commands
- tests proving the CLI accepts valid raw input and rejects invalid raw input
- minimal root script wiring needed to run the CLI during development

## Out of scope

This slice does not include:

- provider registration or discovery
- runtime wiring to real provider implementations
- derive/reset/cleanup CLI orchestration
- rich CLI UX
- broad command catalog
- output formatting beyond the thin seam

## Architectural stance

The CLI is a thin app layer.

Core retains validation and business-rule ownership.

The CLI may parse and present results, but it does not invent provider wiring or hidden defaults.

## Acceptance criteria

- the CLI validates one raw worktree identity input path
- the CLI validates one raw repository configuration input path
- invalid CLI input returns structured validation output without smearing logic into the app layer
- the CLI package depends on core through workspace package boundaries only

## Expected artifacts

- thin CLI package entrypoint
- validation-oriented CLI commands
- acceptance coverage for CLI validation behavior

## Definition of done

This slice is done when raw CLI input can be validated at the application boundary through a thin entrypoint, and the CLI remains a presentation layer rather than a business-rule layer.
