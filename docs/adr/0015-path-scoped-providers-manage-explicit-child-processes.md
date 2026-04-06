# ADR-0015: Process-scoped providers manage explicitly requested child processes only

## Status

Proposed

## Context

Multiverse currently supports explicit local runtime isolation for:

* path-scoped resources
* name-scoped resources
* local-port endpoints

The current product shape has also evolved to include an explicit runtime wrapper command that launches a user-supplied child process under Multiverse-derived isolated runtime configuration.

The next likely provider category is a **process-scoped provider**. This would allow Multiverse to manage runtime isolation for local development processes whose isolated behavior cannot be represented purely as a derived filesystem path or port assignment.

Examples may include:

* local service daemons
* development servers that require isolated process instances
* supporting processes started as part of a local development workflow

This introduces a boundary risk.

Multiverse is intended to be a **local runtime isolation tool**, not a generic process orchestrator or hidden supervisor. If process-scoped behavior is underspecified, implementation may drift into:

* hidden process management
* broad orchestration behavior
* implicit service startup
* unclear lifecycle ownership
* accidental overlap with generic dev-process managers

A source-of-truth decision is needed before process-scoped implementation begins.

## Decision

For 1.0-era Multiverse behavior, a process-scoped provider is allowed only under the following rules:

### 1. Process-scoped providers manage explicitly requested child processes only

A process-scoped provider may launch, observe, and terminate only a process that has been explicitly requested by the consumer through a Multiverse command or declared workflow surface.

Multiverse must not infer which application process to start.

### 2. Multiverse remains an explicit runtime wrapper, not a generic process orchestrator

Process-scoped support does not change Multiverse into a general-purpose orchestrator.

Multiverse must not, in 1.0:

* discover arbitrary long-lived services automatically
* supervise unrelated background services
* mutate the user’s current shell environment
* infer startup commands from framework conventions
* silently restart failed processes
* coordinate multi-process dependency graphs implicitly
* become the source of truth for generic process topology

### 3. Process-scoped lifecycle is explicit and command-bounded

Any process-scoped action must be tied to explicit user intent.

Allowed examples:

* launch this declared process under isolated runtime values
* terminate this process instance
* clean up tracked process state for this isolated instance

Not allowed examples:

* auto-start all missing processes
* implicitly keep services alive in the background
* automatically revive processes after shell exit without explicit design support

### 4. Process-scoped providers may own execution and termination semantics for their tracked process instances

Unlike generic name-scoped providers, a process-scoped provider may be effectful in its own seam because the process instance is the provider-managed runtime object.

That means a process-scoped provider may perform:

* explicit process launch
* readiness observation as defined by the provider contract
* explicit termination
* explicit cleanup of provider-managed process state

This is allowed only for process instances that are within the declared and explicit provider scope.

### 5. Readiness must be explicit, observable, and provider-defined

If a process-scoped provider claims a launched process is ready, readiness semantics must be explicit.

Examples may include:

* process started successfully and remained alive for a bounded interval
* configured port became reachable
* declared health check succeeded

Readiness must not rely on vague assumptions such as “spawn succeeded, so the process is probably usable.”

### 6. Failure and refusal behavior remain first-class

A process-scoped provider must fail or refuse explicitly when:

* launch configuration is invalid
* required executable or runtime is unavailable
* readiness criteria are not met
* the requested process scope is ambiguous
* cleanup or termination would exceed the declared isolated scope

Multiverse must continue to refuse rather than guess.

### 7. The process-scoped provider contract must preserve core/provider boundaries

Core remains responsible for:

* evaluating repository configuration
* validating declarations and scope safety
* coordinating lifecycle requests
* enforcing refusal and business rules

The process-scoped provider remains responsible for:

* technology-specific process launch behavior
* provider-defined readiness checks
* technology-specific process termination
* provider-managed process-state cleanup

Core must not absorb provider-specific process policy.

### 8. 1.0 process-scoped support is limited to explicit single-command execution semantics

The initial supported process-scoped model is intentionally narrow.

In scope for the first process-scoped slice:

* launching an explicitly supplied command
* tracking the resulting isolated process instance
* applying provider-defined readiness checks if required
* terminating or cleaning up the tracked isolated instance

Out of scope for the first process-scoped slice:

* multi-process graphs
* dependency orchestration
* daemon registries
* service composition
* restart policies
* shell/session resurrection
* hidden background orchestration
* framework-specific command inference

## Consequences

### Positive

* Multiverse can grow into more realistic local runtime isolation scenarios
* process-scoped behavior can be added without abandoning explicitness
* the product remains understandable to users
* the core/provider boundary stays intact
* the line between “explicit wrapper” and “generic orchestrator” stays visible

### Negative

* initial process-scoped behavior will be intentionally narrow
* some users may expect broader orchestration than Multiverse will provide
* richer process management use cases will require future design work
* contributors will need clear provider contracts and readiness semantics

## Notes for implementation

The first process-scoped implementation should be treated as an extensibility proof, not as a full orchestration layer.

The implementation should favor:

* explicit command surfaces
* explicit readiness semantics
* explicit tracked-instance cleanup
* strong refusal behavior

The implementation should avoid:

* hidden defaults
* implicit supervision
* speculative restart behavior
* framework-specific heuristics

## Related

* ADR-0004: resource isolation strategies
* ADR-0005: providers implement isolation contracts
* ADR-0008: unsafe operations are refused in 1.0
* ADR-0009: core/provider/repository/application boundaries are explicit
* ADR-0012: explicit runtime wrapper command
* ADR-0013: stable runtime environment naming
* ADR-0014: conventional defaults for config and provider registration
