# Dev Slice 24 — Port-Aware Process Provider: `@multiverse/provider-process-port-scoped`

## Status

Implemented on `main`

## Intent

Implement `@multiverse/provider-process-port-scoped` — the first concrete port-aware process-backed resource provider, defined in ADR-0016.

This provider combines deterministic port assignment with process lifecycle management. The public handle is `localhost:{port}` — a self-describing TCP connection address that consumers can use immediately without reading any files.

## Slice objective

1. Add `"process-port-scoped"` to `IsolationStrategy` in `@multiverse/provider-contracts`
2. Create `@multiverse/provider-process-port-scoped` as an explicit workspace package
3. Export `createProcessPortScopedProvider({ baseDir, basePort, command })` returning a `ResourceProvider`
4. Derive handle as `localhost:{port}`, port computed by `sha256(worktreeId + resourceName).readUInt32BE(0) % 1000 + basePort`
5. Implement `reset`: substitute `{PORT}` in command, launch process, 100ms liveness check
6. Implement `cleanup`: terminate process, remove state directory
7. Refuse with `unsafe_scope` when worktree ID is absent
8. Refuse with `provider_failure` when process exits within the readiness interval
9. Resource provider contract tests
10. Acceptance tests

## Scope

- `packages/provider-contracts/src/index.ts` — add `"process-port-scoped"` to `IsolationStrategy`
- `packages/provider-process-port-scoped/package.json`
- `packages/provider-process-port-scoped/src/index.ts`
- `package.json` (root devDependencies)
- `tests/contracts/resource-provider.process-port-scoped.contract.test.ts`
- `tests/acceptance/dev-slice-24.acceptance.test.ts`
- `docs/development/dev-slice-24.md` + scenario map

## Out of scope

- Port-reachability readiness (named future extension per ADR-0016)
- Host configurability (`localhost` only for 1.0)
- CLI changes
- Core changes
- Integration tests (follow-up slice)

## Handle and port

```
handle  = "localhost:{port}"
port    = basePort + (sha256(worktreeId + resourceName).readUInt32BE(0) % 1000)
```

Handle is scheme-free. This is a generic TCP address, not an HTTP endpoint.

## {PORT} substitution

Before spawn, all occurrences of the literal string `{PORT}` in the command array are replaced with the derived port as a decimal string.

## State directory (internal)

`{baseDir}/{resourceName}/{worktreeId}/` — stores PID file. Not the public handle.

## Acceptance criteria

- a valid worktree derives a handle of the form `localhost:{port}`
- the same worktree ID, base port, and resource name always derive the same handle
- two distinct worktree IDs derive distinct handles (different ports)
- `{PORT}` in the command is replaced with the derived port before launch
- reset with a long-running process returns `ResourceReset` with the connection handle
- reset with a process that exits immediately is refused as `provider_failure`
- cleanup terminates the process and removes the state directory
- missing worktree ID is refused as `unsafe_scope` for all operations
- provider satisfies the resource provider contract for derive, reset, and cleanup
- all existing 193 tests remain green

## Definition of done

`@multiverse/provider-process-port-scoped` is implemented, the contract and acceptance tests pass, and the handle shape is `localhost:{port}` with no HTTP-specific semantics in tests or documentation.
