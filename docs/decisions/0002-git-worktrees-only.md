---
sidebar_position: 3
---

# decision-0002: Git worktrees only in v1

**Status:** Accepted  
**Source:** `src-multiverse-old-reference`

## Decision

The tool will explicitly support git worktrees in v1 and will not attempt to support arbitrary parallel checkouts.

## Rationale

This narrows the domain and reduces ambiguity during initial design and implementation.

## Reversal Trigger

If a compelling use case for non-git-worktree parallel isolation emerges with sufficient user demand and a clear safety model, this decision can be revisited in a post-1.0 cycle.
