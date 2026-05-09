---
sidebar_position: 4
---

# decision-0003: Branch name is metadata, not identity

**Status:** Accepted  
**Source:** `src-multiverse-old-reference`

## Decision

Branch name is treated as optional metadata and not as the canonical worktree identity.

## Rationale

Multiple worktrees may share the same branch, branches may change, and detached HEAD states exist. Using branch name as identity would create unsafe scope ambiguity under all three of these normal conditions.

## Consequences

Worktree identity must be derived from a tool-owned identifier rather than from git branch metadata. Labels may incorporate branch-derived metadata for readability, but isolation must never depend on branch name being unique or stable.
