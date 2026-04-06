# Dev Slice 22 — Process-Scoped Provider Lifecycle: Launch and Cleanup

## Status

Implemented on `main`

## Intent

Add `reset` and `cleanup` capabilities to `@multiverse/provider-process-scoped`.

Slice 21 established the provider-managed state directory as the public handle for process-scoped resources. This slice makes the provider effectful: it can launch, observe, and terminate a declared process using that directory as its owned workspace.

For process-scoped resources, `reset` means: ensure the declared process is running (relaunch if not running, or terminate and relaunch if already running). `cleanup` means: terminate the tracked process and remove provider-managed state.

This is the second step in the two-slice plan defined in ADR-0015 Notes for Implementation.

## Why this slice

Without lifecycle support, the process-scoped provider can only derive a handle. Developers cannot use it to start or stop declared processes through Multiverse. This slice closes that gap and fulfills the core commitment in ADR-0015: process-scoped providers may own execution and termination semantics for their tracked process instances.

## Process state directory layout

The provider state directory (`{baseDir}/{resourceName}/{worktreeId}/`) holds:

- `pid` — the PID of the running process (written on launch, removed on cleanup)

No other artifacts are created in this slice. Additional artifacts (readiness metadata, logs) are deferred to future slices.

## Readiness semantics (this slice)

Readiness for this slice: the process was spawned successfully and remained alive for a short bounded check interval (100ms).

If the process exits within that interval, the provider refuses with `provider_failure`.

This is explicit and observable. Future slices may extend readiness semantics (port reachability, health check URL) without changing the public contract.

## Reset semantics

`resetResource`:
1. Read `{stateDir}/pid`. If a PID exists and the process is alive, terminate it.
2. Launch the configured command as a detached child process with the Multiverse-derived env inherited from the `worktree`.
3. Write the new PID to `{stateDir}/pid`.
4. Wait up to 100ms; if the process has already exited, refuse with `provider_failure`.
5. Return `ResourceReset` with the state directory handle.

## Cleanup semantics

`cleanupResource`:
1. Read `{stateDir}/pid`. If a PID exists and the process is alive, terminate it (SIGTERM).
2. Remove `{stateDir}/` recursively.
3. Return `ResourceCleanup`.

If no PID file exists, cleanup still removes the directory and succeeds (idempotent).

## Slice objective

Extend `@multiverse/provider-process-scoped` such that:

1. the provider declares `reset: true` and `cleanup: true` in its capabilities
2. `resetResource` launches the configured command, writes a PID file, checks liveness, and returns `ResourceReset`
3. `cleanupResource` terminates the tracked process and removes the state directory
4. both refuse with `unsafe_scope` when the worktree ID is absent
5. `resetResource` refuses with `provider_failure` when the process exits within the readiness interval
6. contract tests cover the new capabilities
7. acceptance tests prove end-to-end lifecycle behavior

## Scope

- `packages/provider-process-scoped/src/index.ts` — add capabilities + lifecycle methods
- `tests/contracts/resource-provider.process-scoped.contract.test.ts` — extend with reset + cleanup tests
- `tests/acceptance/dev-slice-22.acceptance.test.ts`
- `docs/development/dev-slice-22-scenario-map.md`

## Out of scope

- Port-reachability readiness checks (future slice)
- Health check URL readiness
- Daemon registries or restart policies
- Multi-process graphs
- CLI changes
- Core changes
- Log file management

## Acceptance criteria

- `resetOneResource` succeeds for a process-scoped resource with `scopedReset: true`
- `cleanupOneResource` succeeds for a process-scoped resource with `scopedCleanup: true`
- reset launches the declared process and writes a PID file inside the state directory
- cleanup terminates the process and removes the state directory
- one worktree's reset or cleanup does not affect another worktree's isolated state directory
- both include the derived state directory handle in the result
- both refuse with `unsafe_scope` when worktree ID is absent
- reset refuses with `provider_failure` when the process exits immediately
- all existing 179 tests remain green

## Expected artifacts

- `packages/provider-process-scoped/src/index.ts` (extended)
- `tests/contracts/resource-provider.process-scoped.contract.test.ts` (extended)
- `tests/acceptance/dev-slice-22.acceptance.test.ts`
- `docs/development/dev-slice-22-scenario-map.md`

## Definition of done

This slice is done when `@multiverse/provider-process-scoped` launches and terminates declared processes, isolates state per worktree instance, passes liveness readiness checks, and acceptance tests prove the full lifecycle path end-to-end.
