# ADR 0001: Git worktrees only in v1

## Status
Accepted

## Decision
The tool will explicitly support git worktrees in v1 and will not attempt to support arbitrary parallel checkouts.

## Rationale
This narrows the domain and reduces ambiguity during initial design and implementation.