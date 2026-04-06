# Dev Slice 24 — Scenario Map

## Slice theme

Port-aware process provider: deterministic TCP handle derivation and full lifecycle

## Scenario goal

Demonstrate that the port-aware process provider derives a stable, unique `localhost:{port}` handle per worktree, substitutes `{PORT}` into the configured command, manages the process lifecycle, and refuses correctly when scope or readiness requirements are not met.

## Primary feature area

### Feature area A — Deterministic handle derivation

#### Scenario A1.1

Given a valid worktree instance with a known ID  
And a port-aware process provider configured with a base port and a command  
And a declared resource with a name  
When the provider derives the resource handle  
Then the handle is `localhost:{port}` where port is within `[basePort, basePort + 1000)`

#### Scenario A1.2

Given a valid worktree instance  
And a port-aware process provider  
When the provider derives a handle twice with the same input  
Then both derived handles are identical

#### Scenario A1.3

Given two worktree instances with distinct IDs  
And the same base port and resource name  
When the provider derives handles for both  
Then the two derived handles differ (different ports)

#### Scenario A1.4

Given a worktree instance with no ID  
When the provider attempts to derive a handle  
Then the result is a refusal with category `unsafe_scope`

### Feature area B — {PORT} substitution

#### Scenario B1.1

Given a port-aware process provider configured with a command containing `{PORT}`  
When reset is called with a valid worktree  
Then the process is launched with `{PORT}` replaced by the derived port number  
And the handle reflects that same port

### Feature area C — Reset (launch)

#### Scenario C1.1

Given a valid worktree instance  
And a process-port-scoped resource with `scopedReset: true`  
And a long-running command  
When `resetOneResource` is called  
Then the process is running  
And the result handle is `localhost:{port}`

#### Scenario C1.2

Given a process-port-scoped resource  
And the worktree ID is absent  
When `resetOneResource` is called  
Then the result is a refusal with category `unsafe_scope`

#### Scenario C1.3

Given a process-port-scoped resource configured with a command that exits immediately  
When `resetOneResource` is called  
Then the result is a refusal with category `provider_failure`

### Feature area D — Cleanup (terminate)

#### Scenario D1.1

Given a running process-port-scoped resource  
When `cleanupOneResource` is called  
Then the process is terminated  
And the state directory is removed

#### Scenario D1.2

Given a process-port-scoped resource with no running process  
When `cleanupOneResource` is called  
Then the result is successful (idempotent)

### Feature area E — Worktree isolation

#### Scenario E1.1

Given two worktree instances each with a running process-port-scoped resource  
When `cleanupOneResource` is called for worktree A  
Then worktree A's process is terminated  
And worktree B's process continues running

### Feature area F — Contract compliance

#### Scenario F1.1

Given the port-aware process provider  
When evaluated against the resource provider derive contract  
Then it satisfies all required behaviors

#### Scenario F1.2

Given the port-aware process provider  
When evaluated against the resource provider reset contract  
Then it declares `reset: true` and returns `ResourceReset` for valid input

#### Scenario F1.3

Given the port-aware process provider  
When evaluated against the resource provider cleanup contract  
Then it declares `cleanup: true` and returns `ResourceCleanup` for valid input

## Minimum viable scenario set

1. valid worktree derives `localhost:{port}` within `[basePort, basePort + 1000)`
2. same input always derives the same handle
3. two distinct worktree IDs derive distinct handles
4. missing worktree ID is refused as `unsafe_scope`
5. `{PORT}` in command is replaced with the derived port
6. reset launches a process and returns the connection handle
7. reset of a fast-exiting process is refused as `provider_failure`
8. cleanup terminates the process and removes the state directory
9. two worktrees remain isolated across cleanup operations
10. provider satisfies resource provider contract for derive, reset, and cleanup
