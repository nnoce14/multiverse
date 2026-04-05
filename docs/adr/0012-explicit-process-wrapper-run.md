# ADR-0012: Explicit process wrapper — `multiverse run`

## Status

Accepted

## Context

After deriving isolated runtime values, a consumer must manually extract those values and inject them into their process environment. This is friction: the consumer reads JSON output, copies values, and re-injects them as environment variables before starting their application.

The natural solution is a direct process wrapper that derives values and launches the consumer's command with those values already injected as environment variables. This eliminates the copy/paste loop entirely.

However, a process wrapper risks scope creep toward general orchestration. The design must preserve explicit boundaries.

## Decision

Introduce a `run` subcommand to the CLI with the following semantics:

```
multiverse run [--config PATH] [--providers MODULE] --worktree-id VALUE -- <cmd> [args...]
```

Everything after `--` is the user-supplied command and arguments. Multiverse does not interpret it.

### Behavior

1. Derive isolated values by calling the existing `deriveOne` path with the supplied configuration, providers, and worktree identity.
2. If derivation fails (any refusal): write the refusal JSON to **stderr**, exit non-zero. The child process is never started.
3. If derivation succeeds: inject the derived values as environment variables into the child process environment, spawn the child, inherit its stdio streams, and propagate its exit code.

### Environment variable injection

The injected variables follow the runtime env naming convention defined in ADR-0013:

- `MULTIVERSE_WORKTREE_ID` — the worktree identity used for derivation
- `MULTIVERSE_RESOURCE_<NAME>` — the derived handle for each declared resource
- `MULTIVERSE_ENDPOINT_<NAME>` — the derived address for each declared endpoint

The child process environment is the parent's current environment extended with the Multiverse-injected variables. Multiverse does not sanitize or restrict the parent environment.

### Explicit boundaries

`multiverse run` must not:

- infer what command to run
- start or manage long-running background processes as a supervisor
- restart the child process on failure
- watch for file changes and re-run
- inject values not derived through the explicit derivation path
- mutate the current shell's environment
- accept a format flag (output goes to the child, not to stdout)

These responsibilities belong to external tools, not to Multiverse.

## Consequences

- Consumers can start their application with isolated values without any manual copy/paste
- The command is fully explicit: the user supplies the config, providers, worktree identity, and command
- Refusal semantics remain intact — the child never starts if derivation is refused
- Stdio pass-through means the child's output appears naturally in the terminal
- Exit code propagation means the caller can detect child failure normally

## Out of scope

- Process supervision or restart behavior
- Port extraction from endpoint addresses (reserved for a future ADR if needed)
- Watching or reacting to application lifecycle events
- Managed process registries
