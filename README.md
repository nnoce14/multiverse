# Multiverse

**Multiverse** is currently a project codename for a local runtime isolation tool for parallel development across git worktrees of the same repository on one machine.

## Purpose

Multiverse is a design-first effort to define deterministic local runtime isolation across multiple git worktrees of the same repository.

The tool is intended to support both human developers and coding agents by ensuring that concurrent local execution does not collide through shared resources or misrouted local endpoints.

## Current Phase

Design complete. The repository is now in implementation preparation and first-slice TDD planning.

This repository currently focuses on:

- accepted product and behavior specifications
- domain vocabulary and architectural decisions
- scenario documents that drive acceptance-first TDD
- implementation preparation for the first development slice

## Design Approach

The repository follows a behavior-first approach. Business rules, scenarios, and architectural decisions were defined before implementation so that development can proceed through acceptance-first TDD rather than ad hoc local-development assumptions.

## Implementation Structure

Multiverse is implemented as a pnpm workspace monorepo using TypeScript on Node.js for the npm ecosystem.. The codebase uses a small set of workspace packages to preserve explicit boundaries between core behavior, provider contracts, and application entrypoints.

## Development Docs

Implementation is guided by the repository’s development and agent-facing documents:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/development/implementation-strategy.md`
- `docs/development/dev-slice-01.md`
- `docs/development/repo-map.md`

## Repository Layout

The implementation is expected to grow primarily through:

- `apps/` — thin application entrypoints
- `packages/` — core and provider-related workspace packages
- `tests/` — acceptance, contract, and unit tests
- `docs/` — specifications, scenarios, ADRs, and development guidance

## Document Map

This repository is currently organized around behavior-first design artifacts.

### Specifications

Business rules, guarantees, and domain concepts:

- `docs/spec/endpoint-model.md`
- `docs/spec/glossary.md`
- `docs/spec/product-spec.md`
- `docs/spec/provider-model.md`
- `docs/spec/repository-configuration.md`
- `docs/spec/resource-isolation.md`
- `docs/spec/safety-and-refusal.md`
- `docs/spec/system-boundary.md`
- `docs/spec/worktree-identity.md`

### Scenarios

Behavior-oriented scenarios intended to evolve into acceptance-test inputs for TDD:

- `docs/scenarios/endpoint-model.scenarios.md`
- `docs/scenarios/provider-model.scenarios.md`
- `docs/scenarios/repository-configuration.scenarios.md`
- `docs/scenarios/resource-isolation.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
- `docs/scenarios/system-boundary.scenarios.md`
- `docs/scenarios/worktree-identity.scenarios.md`

### ADRs

Accepted architectural decisions that close alternatives:

- `docs/adr/0001-git-worktrees-only-v1.md`
- `docs/adr/0002-branch-name-is-metadata.md`
- `docs/adr/0003-main-checkout-uses-reserved-main-identity.md`
- `docs/adr/0004-resource-isolation-strategies.md`
- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0006-endpoints-are-declared-communication-objects.md`
- `docs/adr/0007-repository-configuration-is-explicit-in-1-0.md`
- `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/adr/0010-pnpm-workspace-monorepo-for-implementation.md`
- `docs/adr/0011-typescript-nodejs-for-initial-implementation.md`

## Core Constraint

The tool's core responsibility is isolation.

It is not currently intended to be:

- a package manager
- a deployment tool
- a process orchestrator
- an agent-specific framework

## Initial Scope

- one repository
- one machine
- multiple git worktrees
- deterministic local runtime isolation
