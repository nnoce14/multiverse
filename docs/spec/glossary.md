# Glossary

## Repository

A source repository containing one main checkout and zero or more linked git worktrees.

## Worktree

A git worktree checkout associated with a repository and requiring a unique local runtime identity.

## Worktree Instance

A specific lifecycle of a worktree. If a worktree is removed and later recreated, even for the same branch, that recreated worktree is a new worktree instance.

## Worktree Identity

The canonical identity assigned by the tool to a specific worktree instance.

## Worktree ID

A tool-owned unique identifier for a worktree instance.

The Worktree ID is authoritative for isolation and is not defined by the branch name.

## Worktree Label

A human-readable label associated with a worktree instance.

The label may include branch-derived metadata for readability, but it is not authoritative for isolation.

## Branch Name

Optional metadata describing the branch associated with a worktree instance.

Branch name is not identity.

## Runtime Context

The derived set of isolation values associated with a worktree instance.

Examples may include namespace primitives, derived artifact roots, derived temporary paths, and provider-specific scoped values.

## Resource

A mutable local dependency or mutable integration-owned state whose behavior can interfere across worktree instances if not isolated.

A resource models state collision risk.

## Endpoint

A local communication address whose routing must remain correct for the owning worktree instance.

An endpoint models communication misdirection risk.

## Provider

A concrete strategy that fulfills an isolation contract for a declared repository object.

The tool defines one high-level provider abstraction with two provider domains:

- resource providers
- endpoint providers

## Resource Provider

A provider that carries out isolation behavior for a resource.

## Endpoint Provider

A provider that carries out isolation behavior for an endpoint.

## Derive

A required provider capability that computes scoped values for a single worktree instance.

## Validate

An optional provider capability that verifies whether derived scope or values are usable, coherent, or safe to act upon.

## Reset

An optional destructive lifecycle capability that reinitializes or destroys only the isolated state belonging to one worktree instance.

## Cleanup

An optional lifecycle capability that removes tool-generated or provider-managed isolated state belonging only to one worktree instance when that state is no longer needed.

## Isolation Strategy

The primary strategy a resource uses to maintain isolation across worktree instances.

In 1.0, resource isolation strategies are:

- name-scoped
- path-scoped
- process-scoped

## Name-Scoped

A resource isolation strategy in which isolation is achieved through a unique logical name or prefix within a shared backing system.

## Path-Scoped

A resource isolation strategy in which isolation is achieved through a unique filesystem path on the local machine.

## Process-Scoped

A resource isolation strategy in which isolation is achieved through a dedicated process or runtime instance.
