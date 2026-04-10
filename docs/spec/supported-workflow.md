# Supported Common-Case Workflow for 1.0

## Purpose

This document states the officially supported common-case developer workflow for 1.0.

The external demo guide (`docs/guides/external-demo-guide.md`) is the practical tutorial
showing each step with working examples. This document is the official support boundary
statement: it says what Multiverse officially supports as the common case, what is outside
the common case but still supported, and what is explicitly deferred.

## The 1.0 common-case workflow

The supported common-case workflow is: a Node.js application developer working inside a
git repository with multiple worktree checkouts on one machine, using Multiverse to isolate
mutable local resources and local endpoint addresses across those worktrees.

### Preconditions

Before the workflow can operate, all of the following must be in place:

1. The multiverse repository is cloned and `pnpm install` has been run at the repo root.
   This makes `pnpm cli` available and resolves provider workspace packages.
2. The target application repository has a `multiverse.json` declaring its resources and
   endpoints.
3. The target application repository has a `providers.ts` registering provider
   implementations for each declared resource and endpoint name.
4. The developer is operating from inside a git worktree directory, so that worktree
   identity can be discovered automatically from git state (ADR-0021).

When preconditions 2–4 are met at the current working directory, no flag overrides are
needed for common invocations.

### Workflow steps

**Declare configuration (`multiverse.json`)**

Create `multiverse.json` at the root of the repository. Declare each resource and endpoint
the application needs, with its provider name and lifecycle flags. This file is read from
`./multiverse.json` relative to the working directory by default (ADR-0014).

**Register providers (`providers.ts`)**

Create `providers.ts` registering provider instances for each name declared in
`multiverse.json`. Provider packages (`@multiverse/provider-*`) are workspace packages that
resolve once `pnpm install` has been run. This file is read from `./providers.ts` by
default (ADR-0014).

**Run the application under isolation**

```
pnpm cli run -- <your-command>
```

Multiverse discovers the current worktree identity from git state (ADR-0021), derives
isolated values for that identity, injects them into the child process environment alongside
any declared `appEnv` aliases, and starts the command. If derivation fails for any reason,
Multiverse writes a JSON refusal to stderr and exits non-zero without starting the child.

**Inspect derived values**

```
pnpm cli derive
pnpm cli derive --format env
```

Inspect what Multiverse would derive for the current worktree: JSON (default) or
shell-sourceable `KEY=VALUE` pairs. The `--format env` output includes canonical
`MULTIVERSE_RESOURCE_*` and `MULTIVERSE_ENDPOINT_*` variables; it does not include
`appEnv` aliases (those are injected only by `run`). Useful for debugging and scripting
against canonical variable names.

**Reset isolated state**

```
pnpm cli reset
```

Reinitializes the isolated state belonging to the current worktree, for all resources that
declare `scopedReset: true`. Intended for use when the next run should start fresh without
leftover state from prior runs. Does not affect any other worktree's isolated state.

**Clean up isolated state**

```
pnpm cli cleanup
```

Permanently removes the isolated state belonging to the current worktree, for all resources
that declare `scopedCleanup: true`. Intended for use when the worktree is no longer in use.
Does not affect any other worktree's isolated state.

---

## Common-case invocation path

The officially supported invocation path for in-repository development is **`pnpm cli`**.

`pnpm cli` runs the CLI through the TypeScript source using `tsx`, without requiring a build
step. It is available from the multiverse repo root once `pnpm install` has been run.

All primary commands (`run`, `derive`, `validate`, `reset`, `cleanup`) are available through
`pnpm cli`. All flags accept both space form (`--flag VALUE`) and equals form
(`--flag=VALUE`).

---

## Conventional defaults (ADR-0014, ADR-0021)

| Aspect | Default | Override |
|---|---|---|
| Configuration file | `./multiverse.json` (CWD-relative) | `--config PATH` |
| Provider module | `./providers.ts` (CWD-relative) | `--providers MODULE` |
| Worktree identity | `path.basename` of current git worktree path | `--worktree-id VALUE` |

When all three resolve correctly, no flags are needed:

```
pnpm cli run -- node server.js
pnpm cli derive
pnpm cli reset
pnpm cli cleanup
```

If the current directory is not inside a git worktree, or if git is unavailable, worktree
identity discovery fails with an actionable refusal directing the caller to pass
`--worktree-id` explicitly.

---

## Consumer integration model (ADR-0018, ADR-0019)

`run` injects derived values into the child process environment:

- `MULTIVERSE_WORKTREE_ID` — the resolved worktree identity
- `MULTIVERSE_RESOURCE_<NAME>` — the derived handle for each declared resource
- `MULTIVERSE_ENDPOINT_<NAME>` — the derived address for each declared endpoint

Where `<NAME>` is the declared name uppercased with hyphens replaced by underscores.

### Preferred consumer pattern: `appEnv` with typed endpoint mapping

Declare `appEnv` on resources and endpoints. `run` then injects both canonical
`MULTIVERSE_*` variables and the declared app-native names. For endpoint declarations,
typed extraction supports:

- `url` — the full derived address string
- `port` — the numeric port extracted from the derived address, as a string

The preferred pattern for composed applications is to read app-owned names at one explicit
runtime-config boundary rather than scatter `MULTIVERSE_*` reads throughout the
application code. The `apps/sample-compose/` proving application demonstrates this pattern.

Reading canonical `MULTIVERSE_*` names directly is supported but not the preferred pattern
for applications with multiple managed seams.

---

## What is outside the common case but supported in 1.0

The following are valid, implemented, and in scope for 1.0, but are not the primary
common-case recommendation.

### Explicit `--worktree-id` override

Pass `--worktree-id VALUE` on any primary command to override auto-discovery. Required when
git state is unavailable or the discovered identity does not match the intended value.
`--worktree-id` always overrides discovery.

### Explicit `--config` and `--providers` overrides

Pass `--config PATH` and `--providers MODULE` when configuration files are not at the
conventional default locations. Needed when running from a directory that does not contain
`multiverse.json` or `providers.ts`, or when managing multiple configurations from one
working directory.

### Formal compiled binary

After running `pnpm --filter @multiverse/cli build`, the compiled binary is available at
`apps/cli/bin/multiverse.js` and can be invoked as:

```
node apps/cli/bin/multiverse.js <command> [options]
```

All commands, flags, auto-discovery, and conventional defaults behave identically to
`pnpm cli`. Within the workspace, TypeScript provider modules load without manual
`NODE_OPTIONS`. The compiled binary is the formal artifact that underpins the linked binary
path (ADR-0017). `pnpm cli` remains the primary development path.

### Globally-linked binary (within-workspace)

The compiled binary can be linked globally using `pnpm link --global` from `apps/cli/`,
exposing `multiverse` as a shell command. This path is proven within the multiverse
workspace. All commands behave identically. The structural limitation applies: provider
packages are workspace-local and must resolve from workspace `node_modules`.

### `validate` command

`validate` verifies that derived values are usable for providers that declare
`scopedValidate: true`. This is supported and explicit but is not a required step in the
normal workflow — `run` proceeds with derivation, not validate.

---

## What is deferred for 1.0

The following are explicitly outside the 1.0 workflow support statement. They are not
deficiencies; they are intentional scope boundaries for the current release.

**Outside-workspace usage**

Provider packages (`@multiverse/provider-*`) are workspace packages not published to npm.
Any `providers.ts` must import provider packages that resolve in the multiverse workspace.
Using Multiverse in a repository that is not the multiverse workspace — where provider
imports cannot resolve — is not a supported workflow for 1.0. Provider packaging and
distribution are explicitly deferred.

**Standalone global binary for non-workspace repositories**

The globally-linked binary cannot resolve provider package imports from outside the
workspace. A truly standalone `multiverse` binary usable in any repository requires
provider package publication, which is deferred.

**Configuration inference from project structure**

Multiverse does not infer the location of `multiverse.json`, the provider module, or
provider implementations from framework conventions, project layout, or environment hints.
Configuration is always explicit. ADR-0007 (repository configuration is explicit in 1.0)
and the hard 1.0 constraint against provider inference apply.

**Configuration overlay or profile selection**

There is one `multiverse.json` and one `providers.ts` per invocation. Environment-specific
overlay files, profile switching, or conditional configuration are not supported and not
planned for 1.0.

---

## Relationship to existing docs

| Document | Relationship |
|---|---|
| `docs/guides/external-demo-guide.md` | The practical tutorial; this doc is the support boundary statement |
| `docs/spec/provider-support-classification.md` | Which providers are first-class vs supported-with-constraints |
| `docs/adr/0014-strict-conventional-defaults.md` | Governs `--config` and `--providers` conventional defaults |
| `docs/adr/0021-git-worktree-path-conventional-default-for-worktree-id.md` | Governs worktree identity auto-discovery |
| `docs/adr/0012-explicit-process-wrapper-run.md` | Governs `run` semantics and env injection |
| `docs/adr/0018-explicit-app-native-env-mapping-for-run.md` | Governs `appEnv` mapping |
| `docs/adr/0019-explicit-typed-endpoint-mapping.md` | Governs typed endpoint extraction (`url`, `port`) |
| `docs/adr/0017-cli-package-and-binary-invocation-surface.md` | Governs the formal binary and invocation paths |
