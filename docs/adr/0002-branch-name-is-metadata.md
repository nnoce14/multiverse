# ADR 0002: Branch name is metadata, not identity

## Status
Accepted

## Decision
Branch name is treated as optional metadata and not as the canonical worktree identity.

## Rationale
Multiple worktrees may share the same branch, branches may change, and detached HEAD states exist.