# Dev Slice 22 — Scenario Map

## Slice theme

Process-scoped provider lifecycle: launch and cleanup

## Scenario goal

Demonstrate that the process-scoped provider can launch a declared process under isolated runtime configuration, track it via a PID file in the provider-managed state directory, terminate it on cleanup, and refuse explicitly when scope or readiness requirements are not met.

## Primary feature area

### Feature area A — Reset (launch)

#### Scenario A1.1

Given a valid worktree instance  
And a process-scoped resource with `scopedReset: true`  
And a configured command that starts successfully  
When `resetOneResource` is called  
Then the declared process is running  
And a PID file exists inside the state directory  
And the result contains the state directory handle

#### Scenario A1.2

Given a process-scoped resource that was already launched  
When `resetOneResource` is called again  
Then the previous process is terminated  
And a new process is launched  
And the PID file reflects the new process

#### Scenario A1.3

Given a process-scoped resource  
And the worktree ID is absent  
When `resetOneResource` is called  
Then the result is a refusal with category `unsafe_scope`

#### Scenario A1.4

Given a process-scoped resource configured with a command that exits immediately  
When `resetOneResource` is called  
Then the result is a refusal with category `provider_failure`

### Feature area B — Cleanup (terminate)

#### Scenario B1.1

Given a running process-scoped resource  
And a process-scoped resource with `scopedCleanup: true`  
When `cleanupOneResource` is called  
Then the process is terminated  
And the state directory is removed  
And the result contains the state directory handle

#### Scenario B1.2

Given a process-scoped resource with no running process (no PID file)  
When `cleanupOneResource` is called  
Then the state directory is removed  
And the result is successful (idempotent)

#### Scenario B1.3

Given a process-scoped resource  
And the worktree ID is absent  
When `cleanupOneResource` is called  
Then the result is a refusal with category `unsafe_scope`

### Feature area C — Worktree isolation

#### Scenario C1.1

Given two worktree instances with distinct IDs  
And each has a running process-scoped resource  
When `cleanupOneResource` is called for worktree A  
Then worktree A's process is terminated and its state directory removed  
And worktree B's process continues running and its state directory is unchanged

### Feature area D — Contract compliance

#### Scenario D1.1

Given the process-scoped provider  
When evaluated against the resource provider reset contract  
Then it satisfies all required contract behaviors

#### Scenario D1.2

Given the process-scoped provider  
When evaluated against the resource provider cleanup contract  
Then it satisfies all required contract behaviors

## Recommended test layering

### Acceptance tests

Use these to prove:

- end-to-end reset behavior: process launches, PID file written, handle returned
- end-to-end cleanup: process terminated, state directory removed
- reset of an already-running process: old process terminated, new process started
- worktree isolation: cleanup of one worktree does not affect another
- refusal on absent worktree ID for reset and cleanup
- refusal on fast-exiting process (`provider_failure`)

### Contract tests

Use these to prove:

- the provider declares `reset: true` and `cleanup: true` capabilities
- `resetResource` returns `ResourceReset` for valid input
- `cleanupResource` returns `ResourceCleanup` for valid input

## Minimum viable scenario set

1. reset launches a process and writes a PID file
2. cleanup terminates the process and removes the state directory
3. cleanup with no prior process is idempotent
4. two worktrees remain isolated across reset/cleanup operations
5. absent worktree ID is refused as `unsafe_scope` for both operations
6. fast-exiting process is refused as `provider_failure` on reset
