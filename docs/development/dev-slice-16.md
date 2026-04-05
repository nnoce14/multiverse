# Dev Slice 16 — Name-Scoped Provider Lifecycle: Reset and Cleanup

## Status

Implemented on `main`

## Intent

Add `reset` and `cleanup` capabilities to `@multiverse/provider-name-scoped`.

Without these, the `reset` and `cleanup` CLI commands return `unsupported_capability` even when a resource declares `scopedReset: true` or `scopedCleanup: true`. This makes the two destructive lifecycle commands useless against real name-scoped resources and breaks the 1.0 guarantee that reset and cleanup are available when declared.

## Why this slice next

The name-scoped provider is the most common resource type (databases, schemas, queues). Reset and cleanup are the two operations developers use most during active development — reset to reinitialize a worktree's database, cleanup to tear it down when done.

Making these work on the first concrete resource provider closes the loop on the full lifecycle for the most common use case.

## Provider lifecycle contract for 1.0

For the name-scoped provider, reset and cleanup are scope-confirmation operations:

- the provider verifies the worktree ID is present
- the provider returns a structured confirmation (`ResourceReset` or `ResourceCleanup`) with the resource name, provider, worktree ID, and capability
- the derived handle identifies what the consumer should act on (drop and recreate the database, delete the schema, etc.)
- the provider does not perform the actual database operation — that is the responsibility of the consuming application or a future technology-specific provider layer

This is correct for 1.0: the tool's job is to determine safe scope and return structured results. Execution of the destructive action belongs to the consumer.

## Slice objective

Extend `@multiverse/provider-name-scoped` such that:

1. the provider declares `reset: true` and `cleanup: true` in its capabilities
2. `resetResource` returns a `ResourceReset` when the worktree ID is present
3. `cleanupResource` returns a `ResourceCleanup` when the worktree ID is present
4. both refuse with `unsafe_scope` when the worktree ID is absent
5. contract tests cover the new capabilities
6. acceptance tests prove end-to-end reset and cleanup through the CLI path

## Scope

- `packages/provider-name-scoped/src/index.ts` — add capabilities + methods
- `tests/contracts/resource-provider.name-scoped.contract.test.ts` — extend with reset + cleanup tests
- `tests/acceptance/dev-slice-16.acceptance.test.ts`
- slice and task docs

## Out of scope

- actual database operations (drop, recreate, delete)
- validate capability
- path-scoped lifecycle (Slice 17)
- CLI changes
- core changes

## Acceptance criteria

- `resetOneResource` succeeds for a name-scoped resource with `scopedReset: true`
- `cleanupOneResource` succeeds for a name-scoped resource with `scopedCleanup: true`
- `resetOneResource` returns `unsupported_capability` when provider lacks reset (existing behavior, must stay green)
- `cleanupOneResource` returns `unsupported_capability` when provider lacks cleanup (existing behavior, must stay green)
- unsafe_scope is returned when worktree ID is absent for reset or cleanup
- all existing 100 tests remain green

## Definition of done

This slice is done when `@multiverse/provider-name-scoped` declares and implements reset and cleanup, and tests prove the full lifecycle path works end-to-end.
