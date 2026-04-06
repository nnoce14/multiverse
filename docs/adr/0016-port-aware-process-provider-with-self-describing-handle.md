# ADR-0016: Port-Aware Process Provider with Self-Describing Connection Handle

## Status

Accepted

Settled open questions:
- Host: `localhost`-only for 1.0. No configurable host in the initial implementation.
- Readiness: liveness-only for the initial slice. Port-reachability is a named future extension.

## Context

ADR-0015 introduced process-scoped providers for managing explicitly requested child processes. The process-scoped handle is a provider-managed state directory (`{baseDir}/{resourceName}/{worktreeId}/`). This handle is correct as an isolated workspace but is **not self-describing**: a consuming application cannot connect to the launched process using only the handle. It must know where inside the state directory to look for connection metadata.

The most common local development use case for process-scoped isolation is running a service that listens on a network port (Redis, Postgres, a dev API server, a mock, etc.). For these services, the meaningful consumer-facing value is the connection address — `host:port` — not a directory path.

The current architecture already has a separation between resources (data isolation) and endpoints (address isolation). A port-aware process provider does not fit cleanly into either:

- It is not a pure resource provider — it manages an active process.
- It is not a pure endpoint provider — it has process lifecycle responsibilities.
- Using a `provider-local-port` endpoint alongside a `provider-process-scoped` resource requires two declarations for what is conceptually one thing: a single locally-running service on an isolated port.

A first-class provider that combines deterministic port assignment with process lifecycle management would close this gap, produce a self-describing handle, and remain consistent with the explicit, declarative model.

## Decision

A port-aware process provider is introduced under the following rules.

### 1. The port-aware process provider is a ResourceProvider

The port-aware process provider implements the existing `ResourceProvider` contract. No new provider interface type is required.

The resource handle it derives is the connection address: `{host}:{port}` (for example, `localhost:6380`).

This handle is fully self-describing. A consumer can read the `MULTIVERSE_RESOURCE_<NAME>` env var and connect to the service immediately without reading any files.

### 2. Port assignment is deterministic and derived from base port and worktree hash

The derived port is computed from a configured base port and a deterministic hash of the worktree ID, using the same approach as `provider-local-port`.

The formula guarantees:

- the same worktree ID and base port always derive the same port
- different worktree IDs derive different ports (within the configured range)
- the derived port is stable across process restarts

The provider is configured with `{ baseDir, basePort, command }`.

### 3. The port is passed to the launched process via a command token

The launch command may include the token `{PORT}`. The provider replaces `{PORT}` with the derived port string before spawning the child process.

Example: `["redis-server", "--port", "{PORT}"]` becomes `["redis-server", "--port", "6380"]`.

This is the only supported mechanism for communicating the derived port to the process in 1.0. Env-variable injection and other mechanisms are out of scope for the initial implementation.

If the command contains no `{PORT}` token, the provider launches the process without substitution. This is valid for processes that listen on a port inferred from another configuration mechanism, but it is the caller's responsibility to ensure the process actually uses the derived port.

### 4. The public handle is `{host}:{port}` — not the state directory

The `DerivedResourcePlan.handle` for a port-aware process resource is the connection address string: `{host}:{port}`.

The default host is `localhost`.

Provider-internal artifacts (PID file, etc.) are stored in a provider-managed state directory (`{baseDir}/{resourceName}/{worktreeId}/`) that is opaque to consumers. This directory is not the public handle and must not be exposed through the `ResourceProvider` contract.

### 5. Lifecycle semantics follow ADR-0015 with port-aware readiness

**derive**: returns the connection address `localhost:{port}`. No filesystem effects. Pure derivation.

**reset**: terminates any running process for this worktree instance, derives the port, substitutes `{PORT}` in the command, launches the new process, and performs a readiness check. On success, returns `ResourceReset` with the connection address handle.

**cleanup**: terminates the tracked process and removes the provider-managed state directory. Returns `ResourceCleanup`.

Readiness for the initial implementation is liveness-based (process remains alive for a bounded interval), consistent with the process-scoped provider. Port-reachability readiness is a future extension.

### 6. A new isolation strategy value is introduced: `"process-port-scoped"`

The existing `IsolationStrategy` union is extended with `"process-port-scoped"`.

This distinguishes port-aware process resources from plain process-scoped resources in repository configurations, derived plans, and any tooling that inspects isolation strategy.

### 7. The port-aware process provider does not replace the local-port endpoint provider

`provider-local-port` remains the correct choice when a port must be assigned to an application layer (an Express server, a dev proxy, etc.) without Multiverse managing the process lifecycle.

`provider-process-port-scoped` is the correct choice when Multiverse must both assign an isolated port and manage the lifecycle of the process that listens on that port.

A single repository configuration may use both providers for different declared objects.

### 8. The port-aware process provider does not replace the process-scoped provider

`provider-process-scoped` remains the correct choice when the resource requires process isolation but the handle is a state directory rather than a network address.

`provider-process-port-scoped` is the correct choice specifically for processes that expose a network port as their consumer-facing interface.

### 9. Core and provider boundaries from ADR-0015 are preserved

Core remains responsible for:

- evaluating repository configuration
- validating declarations and scope safety
- coordinating lifecycle requests
- enforcing refusal and business rules

The port-aware process provider remains responsible for:

- deterministic port derivation
- `{PORT}` token substitution in the launch command
- process launch and termination
- provider-managed state directory lifecycle
- liveness readiness checks

Core must not absorb port derivation logic or process management policy.

### 10. Refusal behavior is explicit

The port-aware process provider must refuse when:

- worktree ID is absent (`unsafe_scope`)
- the process exits within the readiness interval (`provider_failure`)
- process launch fails entirely (no PID returned) (`provider_failure`)

## Consequences

### Positive

- consumers receive a self-describing `host:port` handle and can connect immediately
- a single resource declaration covers both port assignment and process lifecycle
- no new provider interface types are required — the existing `ResourceProvider` contract is sufficient
- the core/provider boundary from ADR-0015 is preserved unchanged
- the existing `provider-process-scoped` and `provider-local-port` providers remain valid for their respective use cases
- the `{PORT}` substitution pattern is explicit and easy to audit

### Negative

- a new isolation strategy value (`"process-port-scoped"`) adds a fourth strategy to the union
- port collision risk exists if base port ranges for multiple providers overlap — this is the caller's responsibility to configure correctly, as with `provider-local-port`
- `{PORT}` substitution is a simple string replacement; commands with complex quoting or shell expansion are the caller's responsibility

## Open questions before implementation

The following questions should be resolved or explicitly accepted before the implementation slice is opened.

### Q1: Port derivation formula

The `provider-local-port` formula for deterministic port assignment should be reused or explicitly adapted. The implementation slice should reference the same formula or document why it differs.

### Q2: Host configurability

The initial implementation uses `localhost` as the fixed host. Should `host` be a configurable parameter in the provider config, or is `localhost` the only supported value for 1.0?

Proposed answer: `localhost` only for 1.0. Configurability deferred.

### Q3: Port-reachability readiness

Liveness-based readiness (process remains alive for 100ms) is consistent with the process-scoped provider. A future slice could add TCP port-reachability as a richer readiness option.

Proposed answer: liveness only for the initial implementation. Port-reachability is a named future extension.

## Notes for implementation

The first implementation slice should:

- add `"process-port-scoped"` to `IsolationStrategy` in `@multiverse/provider-contracts`
- create `@multiverse/provider-process-port-scoped` as an explicit workspace package
- export `createProcessPortScopedProvider({ baseDir, basePort, command })` returning a `ResourceProvider`
- derive handle as `localhost:{port}` (no URL scheme — this provider is for generic TCP services, not HTTP-only)
- implement `reset` and `cleanup` capabilities (process lifecycle follows ADR-0015 patterns)
- add resource provider contract tests
- add acceptance tests proving deterministic handle derivation, `{PORT}` substitution, process isolation, and refusal behavior

### Port derivation formula

Port is derived using the same algorithm as `provider-local-port`:

```
port = basePort + (sha256(worktreeId + resourceName).readUInt32BE(0) % PORT_RANGE)
```

where `PORT_RANGE = 1000`.

This guarantees determinism, worktree-uniqueness within the range, and stability across restarts. The same formula is used so that both providers have a consistent, auditable approach to port assignment.

Note: `provider-local-port` hashes `worktreeId + endpointName`; `provider-process-port-scoped` hashes `worktreeId + resourceName`. The inputs differ by the type of declared object, but the algorithm is identical.

### `{PORT}` substitution

Before spawning, the provider replaces all occurrences of the literal string `{PORT}` in the configured command array with the derived port number as a string.

Example: `["redis-server", "--port", "{PORT}"]` → `["redis-server", "--port", "6380"]`

Provider-managed state directory layout follows ADR-0015: `{baseDir}/{resourceName}/{worktreeId}/`.

## Related

- ADR-0004: resource isolation strategies
- ADR-0005: providers implement isolation contracts
- ADR-0008: unsafe operations are refused in 1.0
- ADR-0009: core/provider/repository/application boundaries are explicit
- ADR-0012: explicit runtime wrapper command
- ADR-0015: process-scoped providers manage explicitly requested child processes only
