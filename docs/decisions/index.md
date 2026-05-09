---
sidebar_position: 1
---

# Decision Records

This section catalogs the accepted architecture and product decisions for the Multiverse implementation.

Decision records are the authoritative source for why the system behaves the way it does. They precede implementation slices and are maintained across revisions.

Machine-readable JSON decision records live in `decisions/` at the repo root and are validated by `pnpm agent:validate`.

## Accepted Decisions

| ID | Title | Source |
|---|---|---|
| [decision-0001](./agentic-foundation-first) | Establish agentic workflow before implementation slices | swarm iteration 0 |
| [decision-0002](./git-worktrees-only) | Git worktrees only in v1 | `src-multiverse-old-reference` |
| [decision-0003](./branch-name-is-metadata) | Branch name is metadata, not identity | `src-multiverse-old-reference` |
| [decision-0004](./main-checkout-reserved-identity) | Main checkout uses reserved main identity | `src-multiverse-old-reference` |
| [decision-0005](./resource-isolation-strategies) | Resource isolation strategies for 1.0 | `src-multiverse-old-reference` |
| [decision-0006](./providers-implement-isolation-contracts) | Providers implement isolation contracts | `src-multiverse-old-reference` |
| [decision-0007](./endpoints-are-declared-objects) | Endpoints are declared communication objects | `src-multiverse-old-reference` |
| [decision-0008](./repository-configuration-is-explicit) | Repository configuration is explicit in 1.0 | `src-multiverse-old-reference` |
| [decision-0009](./unsafe-operations-are-refused) | Unsafe operations are refused in 1.0 | `src-multiverse-old-reference` |
| [decision-0010](./explicit-responsibility-boundaries) | Core, provider, repository, and application boundaries are explicit | `src-multiverse-old-reference` |
