---
sidebar_position: 5
---

# decision-0004: Main checkout uses reserved main identity

**Status:** Accepted  
**Source:** `src-multiverse-old-reference`

## Decision

The main checkout uses the reserved Worktree ID `main` and Worktree Label `main`.

## Rationale

This keeps the main checkout explicit and avoids special casing through absence of identity. The main checkout has valid, predictable identity rather than being treated as a special case or an unmanaged worktree.

## Consequences

The reserved identity `main` must not be assignable to a linked worktree. Implementation must detect and refuse attempts to assign `main` to a non-main checkout.
