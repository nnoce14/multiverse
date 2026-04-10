# Provider Support Classification for 1.0

## Purpose

This document states which first-party providers are first-class for the 1.0 common case
and which are supported for specific use cases with stated constraints.

The goal is to let a user answer "which providers can I depend on for 1.0?" without reading
source code or ADRs.

This document classifies only the six first-party providers shipped with Multiverse.
Custom providers authored against `@multiverse/provider-contracts` may cover any use case
the contract supports; this document does not classify them.

## Classification model

Two tiers are used. All six first-party providers are in scope for 1.0 — none are
deferred, experimental, or outside the 1.0 stability guarantee. The distinction is between
providers that are the recommended first reach for common use cases, and those that are
valid but address more specialized scenarios.

### First-class for the 1.0 common case

A provider is first-class when it covers the common-case developer isolation need, is used
in the primary documented workflow (external demo guide or composed sample), and has no
known constraints that a common-case user needs to work around.

### Supported in 1.0 (for specific use cases, within stated constraints)

A provider is supported-with-constraints when it is implemented, tested, and in scope for
1.0, but covers a more specialized use case, carries constraints documented in its governing
ADR, or has capability limitations that are intentional by design.

Using a supported-with-constraints provider is valid and appropriate when the use case
requires it. The constraints are documented below and in the governing ADRs.

---

## Resource providers

### `name-scoped` — First-class for the 1.0 common case

**What it isolates:** A unique logical name or prefix within a shared backing system — for
example, a database name, schema name, queue name, or storage prefix. The backing system
(the database, queue, or service) is managed separately; Multiverse provides the scoped name.

**Capabilities:** derive, reset (scope-confirmation), cleanup (scope-confirmation)

**Handle shape:** `{resourceName}_{worktreeId}` — a string identifier

**Lifecycle note:** Reset and cleanup are scope-confirmation operations. The provider returns
the standard result metadata to confirm the correct worktree scope was recognized, without
performing side effects. This is the correct behavior for a provider that owns a logical
name rather than physical state: the backing system manages its own lifecycle, and the
application is responsible for using the scoped name to interact with it. This pattern is
documented in `docs/spec/provider-model.md`.

**Validate not supported:** Validate is not applicable to name-scoped resources. The provider
derives a logical identifier, not physical state. Verifying that a scoped name resolves to a
usable backing resource would require querying an external system, which is outside the
provider's declared responsibility.

**Governing spec:** ADR-0004 (`resource-isolation-strategies.md`) explicitly names
`name-scoped` as one of three 1.0 isolation strategies.

**When to use:** Isolating resources whose underlying data storage is managed by a backing
system that accepts scoped names — local databases, queues, search indexes, storage prefixes.

---

### `path-scoped` — First-class for the 1.0 common case

**What it isolates:** A unique filesystem path for each worktree instance — for example, a
SQLite file path, an artifact directory, or a fake-integration output folder.

**Capabilities:** derive, validate, reset (effectful), cleanup (effectful)

**Handle shape:** `{baseDir}/{resourceName}/{worktreeId}` — a filesystem path

**Lifecycle note:** Reset removes the derived path recursively and returns; cleanup does the
same. Both are effectful and targeted to the worktree instance's specific derived path.
Neither operation can affect another worktree's path because the worktree ID is embedded in
the path.

**Validate:** Checks that the derived path is accessible using `accessSync`. Returns
`provider_failure` if the path is not accessible. This is the only first-party resource
provider with `validate` support, because path access is a meaningful, provider-owned check.

**Governing spec:** ADR-0004 names `path-scoped` as one of three 1.0 isolation strategies.
The validate capability was added in Slice 46.

**When to use:** Isolating file-backed local resources — SQLite databases, local artifact
stores, emulator workspace directories.

---

### `process-scoped` — Supported in 1.0 (for specific use cases)

**What it isolates:** A dedicated per-worktree process instance for a stateful local
dependency — for example, a local service daemon or an emulator that cannot be isolated
by name or path alone.

**Capabilities:** derive, reset (effectful: terminate + relaunch + liveness check),
cleanup (effectful: terminate + remove state directory)

**Handle shape:** `{baseDir}/{resourceName}/{worktreeId}/` — the provider-managed state
directory path, not a network address

**Constraints (from ADR-0015):**
- Multiverse manages only explicitly requested child processes; it does not discover or
  supervise arbitrary processes
- The launch command is provider configuration at registration time, not in `multiverse.json`
- Readiness is liveness-based: the process must remain alive for a polling interval after
  spawn; port-reachability readiness is a named future extension
- The handle is the state directory path, not a network address; consumers must know where
  inside that directory to find connection metadata (e.g., the PID file)
- Multiverse does not restart processes silently after failure; restart requires an explicit
  `reset` call

**Validate not supported:** The provider manages a directory handle. There is no
provider-owned check that verifies whether the service inside is ready to accept connections
— that requires process or network inspection, which depends on the specific technology.
Liveness is asserted during `reset`; an explicit separate validate step would replicate that
check without adding meaningful guarantees.

**Governing spec:** ADR-0015 explicitly admits process-scoped providers for 1.0-era behavior
under the stated constraints.

**When to use:** Local service processes that need per-worktree isolation but whose
consumer-facing interface is not primarily a network address — or when you need full process
lifecycle control and the handle being a state directory path is acceptable to your workflow.

---

### `process-port-scoped` — Supported in 1.0 (for specific use cases)

**What it isolates:** A dedicated per-worktree process instance for a service that exposes
a network port — combining deterministic port assignment with process lifecycle management
in a single resource declaration.

**Capabilities:** derive, reset (effectful: terminate + port substitution + relaunch +
liveness check), cleanup (effectful: terminate + remove state directory)

**Handle shape:** `localhost:{port}` — a self-describing connection address

**Constraints (from ADR-0016):**
- The derived port is deterministic: `basePort + hash(worktreeId + resourceName) % 1000`
- The launch command may include `{PORT}` as a literal token; it is replaced with the
  derived port string at launch. No other port injection mechanism is supported in 1.0.
- Readiness is liveness-based (consistent with `process-scoped`); port-reachability
  readiness is explicitly a named future extension in ADR-0016
- Host is fixed to `localhost`; configurable host is deferred
- This provider is distinct from `local-port`: use `local-port` when Multiverse should
  assign a port to an application layer it does not manage; use this provider when
  Multiverse must both assign the port and manage the process lifecycle

**Validate not supported:** Consistent with `process-scoped`. Liveness is checked during
`reset`. A separate validate step would duplicate liveness checking without meaningful
additional coverage, given that process state can change at any moment.

**Governing spec:** ADR-0016 introduces `process-port-scoped` as a fourth isolation strategy
alongside the three named in ADR-0004.

**When to use:** Local service processes that expose a network port and require both isolated
port assignment and Multiverse-managed process lifecycle in a single declaration — for
example, an in-memory cache, a local search sidecar, or a development mock server.

---

## Endpoint providers

### `local-port` — First-class for the 1.0 common case

**What it isolates:** A unique local HTTP port for each worktree instance, derived
deterministically from the worktree identity, endpoint name, and a configured base port.

**Capabilities:** derive

**Address shape:** `http://localhost:{port}`

**Port derivation:** `basePort + sha256(worktreeId + endpointName) % 1000`

**Lifecycle note:** Endpoint providers are derive-only in the current scope. Endpoints model
communication routing and ownership; they do not own stateful resources that require reset
or cleanup. The `endpoint-model.md` spec defines validate as optional for endpoint providers;
it is not currently implemented for `local-port`.

**Governing spec:** `local-port` is the original endpoint provider shape proven from the
first composed application proofs and used in the external demo guide as the primary endpoint
isolation mechanism.

**When to use:** Assigning an isolated local HTTP port to an application process — the most
common endpoint isolation need.

---

### `fixed-host-port` — Supported in 1.0 (for specific use cases)

**What it isolates:** A unique HTTP URL for each worktree instance using a configured host
and a deterministically derived port.

**Capabilities:** derive

**Address shape:** `http://{host}:{port}`

**Constraints (from ADR-0020):**
- Provider is derive-only; validate, reset, and cleanup are not applicable
- Scheme is fixed to `http` in the current implementation; configurable scheme is deferred
- Host is repository-configured — must be a non-empty hostname or IP literal
- Base port is repository-configured and must be an integer in the valid TCP range
- Port collision risk exists when base port ranges overlap across multiple providers or
  repositories; repository owners are responsible for choosing non-overlapping ranges
- This provider is explicitly an extensibility proof: it was introduced in ADR-0020 to
  demonstrate that the endpoint provider seam is not synonymous with `local-port`

**Governing spec:** ADR-0020 introduces `fixed-host-port` as the first 0.4.x extensibility
proof for the endpoint provider seam.

**When to use:** Endpoint isolation when the application requires a specific host address
(e.g., `127.0.0.1` rather than `localhost`) or when the URL host is externally constrained
by the application's configuration format.

---

## Lifecycle capability summary

| Provider | Derive | Validate | Reset | Cleanup |
|---|---|---|---|---|
| `name-scoped` | ✓ | — (intentional) | ✓ scope-confirm | ✓ scope-confirm |
| `path-scoped` | ✓ | ✓ | ✓ effectful | ✓ effectful |
| `process-scoped` | ✓ | — (intentional) | ✓ effectful | ✓ effectful |
| `process-port-scoped` | ✓ | — (intentional) | ✓ effectful | ✓ effectful |
| `local-port` | ✓ | — (derive-only scope) | n/a | n/a |
| `fixed-host-port` | ✓ | — (derive-only scope) | n/a | n/a |

**Note on "—" entries:** The absent capabilities are intentional. Each is explained in the
provider section above and in the governing ADR. The `—` does not indicate a deficiency or
a planned future addition — it indicates that the capability does not apply to the
provider's design.

## What is deferred

The following are not part of the 1.0 classification and are not expected to be added
before 1.0:

- provider packaging and distribution as standalone npm packages outside the repository
- additional first-party provider shapes beyond the current six
- port-reachability readiness for process-scoped and process-port-scoped providers
- configurable scheme for `fixed-host-port`
- configurable host for `process-port-scoped`
- validate capability for endpoint providers
- additional env injection mechanisms for process-scoped providers beyond `{PORT}` token

These are named here to make the 1.0 boundary explicit. They may be considered for post-1.0
work but are not part of the current support guarantee.
