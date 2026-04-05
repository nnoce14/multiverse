# ADR-0013: Runtime environment variable naming convention

## Status

Accepted

## Context

When Multiverse injects derived values into a child process (via `multiverse run`) or emits them as shell-sourceable output (via `derive --format=env`), the variable names must be deterministic and consistent across both paths.

An ad-hoc naming scheme creates friction for consumers who need to know what variable names to expect before they can write their application configuration.

A documented convention removes that uncertainty and makes the contract stable enough to depend on.

## Decision

All Multiverse-injected environment variables use the `MULTIVERSE_` prefix followed by a category and a normalized name.

### Name normalization rule

A declared name (resource name or endpoint name) is normalized to an env key segment by:

1. Converting to uppercase
2. Replacing all hyphens (`-`) with underscores (`_`)

Example: `primary-db` → `PRIMARY_DB`, `app-base-url` → `APP_BASE_URL`.

### Variable categories

#### Worktree identity

```
MULTIVERSE_WORKTREE_ID=<worktreeId>
```

The exact worktree identity value used for the current derivation.

#### Resource handles

```
MULTIVERSE_RESOURCE_<NAME>=<handle>
```

Where `<NAME>` is the normalized declared resource name and `<handle>` is the provider-derived isolation handle (e.g., a namespaced database name or a scoped filesystem path).

#### Endpoint addresses

```
MULTIVERSE_ENDPOINT_<NAME>=<address>
```

Where `<NAME>` is the normalized declared endpoint name and `<address>` is the provider-derived full address string (e.g., `http://localhost:3001`).

### Consistency requirement

The same normalization rule and category prefixes apply in both:

- `multiverse run` env injection (ADR-0012)
- `multiverse derive --format=env` output

The two paths must emit identical variable names for the same declared objects.

## Consequences

- Consumers can predict variable names from their `multiverse.json` declaration without running the tool first
- Both `run` and `derive --format=env` produce identical variable name shapes
- The convention is unambiguous: the normalization rule is deterministic and documented
- There is no ambiguity for names containing numbers, multiple hyphens, or mixed case — the rule applies uniformly

## Out of scope for 1.0

- Port extraction variables (e.g., `MULTIVERSE_ENDPOINT_<NAME>_PORT`) — reserved for a future ADR when the provider model supports structured address decomposition
- Variables derived from provider-specific metadata beyond handle and address
