# ADR-0021: Git-worktree-path conventional default for `--worktree-id`

## Status

Accepted

Amends ADR-0014.

## Context

ADR-0014 established conventional defaults for `--config` and `--providers` but
explicitly excluded `--worktree-id`:

> Worktree identity is not defaulted, inferred, or auto-detected. The caller
> must always supply `--worktree-id` explicitly.

The rationale at the time was that "defaulting the worktree identity would be
inference, which violates the hard constraint that Multiverse must not infer
managed-object scope."

That rationale correctly targets fuzzy inference — guessing which resource or
port a worktree "probably" owns based on project structure or naming conventions.
It does not apply to reading a concrete, inspectable fact from git's own worktree
data structure.

`git worktree list --porcelain` gives the absolute filesystem path of each known
worktree. The basename of that path is:

- deterministic for a given worktree
- unique across all worktrees in the same repository
- inspectable without reading Multiverse source code
- stable for the lifetime of the worktree

This is the same character as the `--config`/`--providers` conventional defaults:
strict convention, not discovery or inference.

The 0.5.x proving question — can a second engineer follow the docs and succeed
without live guidance? — identifies having to pass `--worktree-id` on every
command as a real friction point, especially when the engineer is already
operating from within a named worktree directory.

## Decision

### 1. `--worktree-id` adopts a git-state conventional default

When `--worktree-id` is omitted, the CLI attempts to discover worktree identity
from git state using the following strict algorithm:

1. Run `git worktree list --porcelain` from the current working directory.
2. Parse the output to find the worktree entry whose path is a prefix of (or
   equal to) the current working directory.
3. If the matched entry is the **main worktree** (the first entry in the
   porcelain output), the identity is the reserved value `"main"` (ADR-0003).
4. If the matched entry is a **linked worktree**, the identity is
   `path.basename(entry.path)`.
5. If no entry matches, or if the git command fails, or if the resolved basename
   is empty — refuse with an actionable error message directing the caller to
   pass `--worktree-id` explicitly.

### 2. `--worktree-id` remains supported and always overrides discovery

If `--worktree-id` is supplied by the caller, it is used as-is. Discovery is
not attempted. This preserves backward compatibility and explicit override for
any case where the conventional default does not match the intended id.

### 3. Refusal is required when discovery cannot safely resolve

The CLI must refuse — not guess — in all ambiguous or unsafe cases:

- not inside a git repository
- git is unavailable on PATH
- `git worktree list` fails for any reason
- no worktree path is a prefix of the current working directory
- resolved basename is empty

Refusal must include an actionable message: the caller must be told to pass
`--worktree-id` explicitly.

### 4. Discovery applies to all commands that accept `--worktree-id`

The conventional default applies consistently to: `derive`, `validate`, `run`,
`reset`, and `cleanup`. No per-command special casing.

### 5. Discovered identity is visible in output

The derived worktree id should be surfaced in successful output so operators
can verify what was resolved without reading source code. The current JSON
output for `derive` already includes `worktreeId` in each derived plan and
mapping; no additional output is required.

## What this is not

This decision is not:

- identity inference from branch name (ADR-0002 remains in force: branch name
  is metadata, not identity)
- resource or provider inference (the hard 1.0 constraint is unchanged)
- auto-creation of worktree state
- a registry-based identity system (the "recreated worktree gets new lifecycle
  identity" scenario from `worktree-identity.scenarios.md` is not addressed
  here — it requires a persistent registry and is explicitly deferred)
- a guarantee of stable identity across worktree recreation at the same path

## Consequences

- The most common invocation becomes materially shorter:
  `pnpm cli run -- node server.js` instead of
  `pnpm cli run --worktree-id feature-login -- node server.js`
- The convention remains inspectable: the discovered id is the git worktree
  basename, visible in `git worktree list` output
- `--worktree-id` remains the authoritative explicit override
- The "recreated worktree gets new lifecycle identity" scenario remains
  aspirational and is explicitly deferred to a future registry-based approach

## Related

- ADR-0001: git worktrees only in 1.0
- ADR-0002: branch name is metadata, not identity
- ADR-0003: main checkout uses reserved `main` identity
- ADR-0008: unsafe operations are refused
- ADR-0014: strict conventional defaults (amended by this ADR)
