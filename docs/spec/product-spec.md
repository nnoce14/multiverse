# Product Spec

## Problem Statement

Enable safe parallel local development in multiple git worktrees of the same repository on one machine by giving each worktree an isolated runtime context for mutable local resources and local endpoint routing.

## Primary Goal

Ensure isolation.

## Non-Goals for 1.0

- arbitrary parallel checkouts beyond git worktrees
- deployment management
- rich inspection UX
- agent-specific workflow behavior
- package manager abstraction beyond the chosen target ecosystem

## Required Guarantees for 1.0

1. Two worktrees of the same repository can run locally without isolated-resource collisions.
2. Runtime context derivation is deterministic for a given worktree instance.
3. Reset or cleanup operations for one worktree do not destroy another worktree's isolated state.
4. Local fake integration state does not leak across worktrees.
