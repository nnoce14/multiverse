# ADR-0014: Strict conventional defaults for common CLI options

## Status

Accepted

## Context

Every Multiverse CLI command that operates on a repository configuration and a providers module requires `--config` and `--providers` to be specified explicitly. For the common case — working in the root of a repository that already has the conventional files in place — this is repetitive ceremony without information value.

Strict conventional defaults reduce that ceremony while keeping the tool explicit and inspectable. The key constraint is that defaults must be strict and documented, not magical or inferred.

## Decision

The following CLI options adopt documented conventional defaults:

| Option | Conventional default |
|---|---|
| `--config` | `./multiverse.json` (resolved relative to the current working directory) |
| `--providers` | `./providers.ts` (resolved relative to the current working directory) |

These defaults apply to all commands that accept these options: `derive`, `validate`, `reset`, `cleanup`, and `run`.

### Behavior when the default path does not exist

If a default path is used and the file does not exist, the command fails with the same file-read error it would produce if the user had specified that path explicitly. There is no special handling or fallback.

### `--worktree-id` remains required

Worktree identity is not defaulted, inferred, or auto-detected. The caller must always supply `--worktree-id` explicitly.

Defaulting the worktree identity would be inference, which violates the hard constraint that Multiverse must not infer managed-object scope.

### Inspectability

The convention is visible and documented. When a consumer omits `--config` or `--providers`, they can reason about what file was used without reading Multiverse source code.

## Consequences

- Common invocations become materially shorter
- The convention is the same across all commands — no per-command surprises
- The tool remains explicit: defaults are visible in documentation, not hidden behind magic discovery
- `--worktree-id` staying required preserves the safety boundary from ADR-0008

## What this is not

Conventional defaults are not:

- auto-detection (no filesystem scanning beyond the single conventional path)
- inference of configuration from project structure
- fallback chains across multiple candidate paths
- worktree identity resolution from git state
