# Worktree Identity

## Core Concepts

### Worktree ID

A tool-owned unique identifier for a specific worktree instance.

### Worktree Label

A human-readable label associated with a worktree instance.

### Branch Name

Optional metadata. Branch name is not identity.

## Invariants

1. Every active worktree instance has exactly one canonical Worktree ID.
2. Worktree ID is stable for the lifetime of the worktree instance.
3. Recreating a worktree, even on the same branch, creates a new lifecycle and a new Worktree ID.
4. Branch name is metadata, not identity.
5. The main checkout has a valid identity.

## Main Checkout

The main checkout uses the reserved Worktree ID `main` and reserved Worktree Label `main`.

## Linked Worktrees

A linked worktree receives:

- a tool-owned unique Worktree ID
- a human-readable Worktree Label
- optional branch metadata

## Labeling

The label may incorporate branch-derived metadata and a unique token for readability, but the label is not authoritative for isolation.
