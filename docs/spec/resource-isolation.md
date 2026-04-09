# Resource Isolation

## Purpose

This document defines the business rules for modeling and isolating resources across parallel worktree instances.

## Resource Definition

A resource is any mutable local dependency or mutable integration-owned state whose behavior can interfere across worktree instances if not isolated.

A resource exists to capture collision risk in local runtime behavior.

## Included Resource Types

Resources may include real local infrastructure and integration-owned state.

### Real Local Infrastructure

Real local infrastructure refers to backing systems or runtime dependencies that exist independently of the application process and are used during local development.

Examples include:

- local databases
- local storage emulators
- local brokers or queues
- local search engines
- local emulator processes

### Integration-Owned State

Integration-owned state refers to mutable state produced or consumed by application integrations, especially fake or local-only implementations.

Examples include:

- fake email outbox data
- fake search index state
- local replay or recording stores
- local webhook delivery artifacts
- mock integration persistence used for local behavior

## Resource Exclusions

Endpoints are not resources.

A resource models mutable state and collision risk.

An endpoint models communication routing and misdirection risk.

Endpoints are defined separately.

## Resource Isolation Requirement

Every resource must define how it maintains isolation across worktree instances.

In 1.0, every resource must declare exactly one primary isolation strategy.

## Isolation Strategies

### Name-Scoped

A resource is isolated through a unique logical name or prefix within a shared backing system.

Examples include:

- database names
- schema names
- queue names
- storage prefixes
- index names

### Path-Scoped

A resource is isolated through a unique filesystem path on the local machine.

Examples include:

- SQLite files
- artifact directories
- temporary directories
- fake integration output folders
- local emulator workspace paths

### Process-Scoped

A resource is isolated through a dedicated process or runtime instance.

Examples include:

- a dedicated emulator instance
- a dedicated local mock service process
- a dedicated per-worktree runtime for a stateful local dependency

## Resource Declaration Requirements

Each resource must declare:

- a resource name
- a provider
- a primary isolation strategy
- whether scoped validate is supported (optional; defaults to false)
- whether scoped reset is supported
- whether scoped cleanup is supported

## Provider Relationship

A resource and a provider are distinct concepts.

A resource describes what must be isolated.

A provider describes how a concrete technology carries out the required isolation strategy and lifecycle behavior.

## Lifecycle Expectations

Resource isolation is not limited to value derivation.

A resource may also define scoped lifecycle actions.

### Scoped Reset

A reset operation reinitializes or destroys only the isolated state belonging to one worktree instance.

### Scoped Cleanup

A cleanup operation removes tool-generated or provider-managed state belonging only to one worktree instance when that state is no longer needed.

## Safety Rules

1. No resource operation may intentionally target another worktree instance's isolated state.
2. If the tool cannot safely determine the owning scope of a destructive action, it must not proceed silently.
3. Resource isolation behavior must preserve worktree-instance boundaries even when two worktrees share the same branch metadata.

## Open Areas

The following remain outside the scope of this document and will be defined separately:

- endpoint modeling
- endpoint routing guarantees
- provider contracts in detail
- configuration materialization behavior
