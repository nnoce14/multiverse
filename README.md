# Multiverse

**Multiverse** is currently a project codename for a local runtime isolation tool for parallel development across git worktrees of the same repository on one machine.

## Purpose

Multiverse is a design-first effort to define deterministic local runtime isolation across multiple git worktrees of the same repository.

The tool is intended to support both human developers and coding agents by ensuring that concurrent local execution does not collide through shared resources or misrouted local endpoints.

## Current Phase

Discovery and design.

This repository currently focuses on:

- product and behavior specification
- domain vocabulary
- architectural decisions
- behavior scenarios for future TDD implementation

## Design Approach

The repository follows a behavior-first design approach. Business rules and scenarios are being defined before implementation so that the eventual build phase can be driven by TDD rather than ad hoc local-development assumptions.

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
- `docs/spec/worktree-identity.md`

### Scenarios

Behavior-oriented scenarios intended to evolve into acceptance-test inputs for TDD:

- `docs/scenarios/endpoint-model.scenarios.md`
- `docs/scenarios/provider-model.scenarios.md`
- `docs/scenarios/repository-configuration.scenarios.md`
- `docs/scenarios/resource-isolation.scenarios.md`
- `docs/scenarios/safety-and-refusal.scenarios.md`
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
