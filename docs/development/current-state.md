# Current State

## Purpose

This document summarizes the current state of Multiverse during active implementation.

It is intended to help contributors and coding agents quickly answer:

* what has already been proven
* what the current priority is
* what kinds of work are highest-value right now
* what is intentionally deferred

This is a short state-of-the-project document, not a full history.

## Current version posture

Current version posture: **0.6.0-alpha.1**

Interpretation:

* the core product thesis is proven in real workflows
* the usable core of Multiverse has moved well beyond isolated seam proofs
* the composed application consumer workflow is established and stable
* the provider model is extensible: a second endpoint shape, a non-first-party authoring path, a parameterized compliance suite, and CLI-level invocation proof are all on `main`
* all four 0.4.x roadmap exit criteria are met; the extensibility wave is complete
* all 0.5.x exit criteria are met: the documented second-engineer workflow is proven end-to-end, including real two-worktree auto-discovery/isolation and no-manual-`NODE_OPTIONS` TypeScript provider loading in workspace scope; outside-workspace packaging and distribution remain explicitly deferred
* `0.6.0-alpha.1` begins the semantic stability phase: the next honest proving question is whether lifecycle semantics, refusal behavior, and naming are consistent and trustworthy across providers, docs, and CLI output
* 1.0 expectations remain intentionally narrow

## What is already proven

The following are now considered proven enough to serve as the working baseline for continued implementation:

### Core product shape

* Multiverse is a local runtime isolation tool for multiple git worktrees of the same repository on one machine
* repository configuration remains explicit and declarative
* refusal is a first-class behavior
* core/provider boundaries remain explicit

### CLI/runtime model

* `derive` produces deterministic worktree-specific values
* `validate` verifies declared configuration and isolated outputs
* `run` acts as an explicit runtime wrapper for a user-supplied command
* `reset` and `cleanup` support declared lifecycle behavior where allowed
* `pnpm cli ...` remains the repo-local development path
* formal CLI packaging and binary invocation support for `multiverse ...` now exist alongside the repo-local `pnpm cli ...` development path
* `run` supports explicit app-native env injection for resources and endpoints
* endpoint app-native mapping now supports both `url` and extracted `port` values

### Provider model

The provider model has been proven across several shapes, including:

* name-scoped resource behavior
* path-scoped resource behavior
* local-port endpoint behavior
* fixed-host-port endpoint behavior
* process-scoped resource behavior
* process-port-scoped resource behavior

The model has also been exercised through acceptance, contract, unit, and integration testing.

### External proof

Multiverse has already been demonstrated against standalone external application workflows, not only in-repo sample code.

This matters because it proves the model is not limited to one tightly controlled internal shape.

### Composed application proof

A richer composed proving application now demonstrates that one application can consume multiple Multiverse-managed seams at once, including:

* a path-scoped resource
* a process-port-scoped resource
* a local-port endpoint

This proves that mixed-provider composition can work in one running application without collapsing the model.

The current composed proof also now demonstrates:

* app-native env mapping for all three seams
* typed endpoint mapping for `PORT`
* an application-owned runtime-config boundary in `sample-compose`

## Current highest-priority proving result

The most recently answered proving questions are:

**Can a second explicit endpoint-provider shape be added without changing the
established consumer workflow or weakening the core/provider boundary?**

ADR 0018 and ADR 0019 established the consumer workflow strongly enough to move
to this question. ADR 0020 and Slice 31 prove it through `fixed-host-port`, with
a narrow explicit `host`/`basePort` extension to shared endpoint declaration and
provider-input types.

**Can a provider be authored against `@multiverse/provider-contracts` alone and
consumed through the standard core/registry seam, with no knowledge of core
internals?**

Slice 32 answers yes: a provider implemented using only `@multiverse/provider-contracts`
types can be registered in a `ProviderRegistry` and consumed correctly through
`deriveOne`. This is a core/registry seam proof; it does not address CLI
invocation with an externally distributed provider, which is not yet in scope.

**Is resource provider derive compliance governable in the same way endpoint
compliance is?**

Slice 33 answers yes: `tests/contracts/resource-provider.derive.contract.test.ts`
is a single parameterized compliance suite covering all four first-party resource
providers and a non-first-party inline provider under the same six universal
derive assertions. Adding a new resource provider to the compliance gate is now
one entry in `providerCases`. This mirrors the endpoint-side pattern already
established in `endpoint-provider.derive.contract.test.ts`. Lifecycle capability
compliance (reset, cleanup, validate) remains in the existing per-provider
contract files, which are unchanged.

**Does the provider registration and loading path surface actionable errors to a
second author?**

Slice 34 addresses this: the CLI's `loadProviderRegistry` and
`readRepositoryConfiguration` functions previously swallowed underlying Node.js
errors in bare `catch {}` blocks. A provider author whose module failed to load
(syntax error, missing import, wrong path) received only an opaque file-path echo.
Both catch blocks now capture and include the underlying error message. This is
the highest-signal usability gap found in the 0.4.x hardening audit.

**Does the full `providers.ts` → CLI derive path work for a non-first-party
provider?**

Slice 35 closes the last named 0.4.x gap: a provider authored following the guide
— importing only from `@multiverse/provider-contracts`, registered in a
`providers.ts` file — is proven to derive correctly through `pnpm cli derive
--providers`. This extends the Slice 32 core/registry seam proof to cover the
complete documented invocation path. The provider authoring guide scope note no
longer marks CLI invocation as unproven.

**Is the in-repo `pnpm cli` path honest and followable from scratch by a second
engineer reading only the docs?**

Slice 36 addresses the most load-bearing cold-start gap in the external-demo-guide:
the guide never stated that it required a multiverse repo checkout with `pnpm install`
completed, or that the `@multiverse/provider-*` packages are workspace-local and not
on npm. A new "How this guide works" section makes the repo-local invocation path
explicit. Prerequisites now list the concrete clone and install steps. Step 2 clarifies
that provider imports are workspace packages, not separately installable. Step 4
clarifies that `pnpm cli` runs from the multiverse repo root.

**Does the CLI reduce the most common friction point — requiring `--worktree-id` on every
command — without violating the refusal-first contract?**

Slice 37 answers yes: when `--worktree-id` is omitted, the CLI now attempts strict
git-state discovery using `git worktree list --porcelain`. All matched worktrees —
primary checkout and linked — resolve to `path.basename` of the worktree path.
If discovery cannot safely resolve (not in a git repo, git unavailable, no matching
worktree path), the CLI refuses with an actionable message directing the caller to
pass `--worktree-id` explicitly. The flag remains supported and always overrides
discovery. ADR-0021 governs this decision, amending ADR-0014.

**Is the formal compiled binary documented and proven as an alternative invocation
path?**

Slice 38 proves `node apps/cli/bin/multiverse.js` as the formal binary invocation.
The build step (`pnpm --filter @multiverse/cli build`) produces the compiled binary.
All CLI behavior — auto-discovery, conventional defaults, all commands — is
identical through the compiled binary and the `pnpm cli` dev path. The external-demo-
guide now documents the build step, direct invocation, and the `NODE_OPTIONS=
"--import tsx/esm"` requirement for TypeScript provider files in the current
workspace setup. Explicitly deferred: globally-linked `multiverse` command and a
binary that loads TypeScript providers without a loader.

**Are the most load-bearing cold-start friction points in the documented workflow fixed?**

Slice 39 closes two load-bearing friction points identified during pre-work cold-start investigation:
(1) `readOption` silently dropped equals-form arguments (`--flag=value`); the guide's
Step 6 shows `--format=env` but the CLI returned JSON — no error, wrong output.
Fixed by extending `readOption` to handle both `--flag value` and `--flag=value` forms.
All flags (`--config`, `--providers`, `--worktree-id`, `--format`) inherit the fix.
(2) Guide Step 4 used the generic placeholder `node server.js`; a cold-start reader
without their own app could not complete the walkthrough. Fixed by adding a concrete
"Try it with the sample application" subsection pointing to `apps/sample-express/`.
Minor: Step 5 port examples were concrete values that did not match actual derivation
output; replaced with a note that ports are derived deterministically from worktree id.

**Did the cold-start walkthrough confirm the documented workflow is reproducible?**

Slice 40 performed a full cold-start walkthrough of the external-demo-guide workflow
against `main`. Every documented step succeeded: sample-express runs and prints the
expected output, multi-worktree isolation produces distinct paths and ports, reset and
cleanup work, the formal binary path builds and invokes correctly, and auto-discovery
resolves the worktree identity without `--worktree-id`. The two remaining truth-alignment
gaps found were: (1) README stated `--worktree-id` is "always required" — stale since
Slice 37; fixed. (2) `roadmap.md` version posture read `0.4.0-alpha.1` — stale since
the `0.5.0-alpha.1` bump; fixed. No remaining cold-start blockers were found in the
documented in-repo workflow.

**Is the globally-linked binary path provable and honest to document?**

Slice 41 performed a walkthrough of the globally-linked binary path. The binary
links and invokes correctly (`pnpm setup` → `pnpm --filter @multiverse/cli build`
→ `cd apps/cli && pnpm link --global` → `NODE_OPTIONS="--import tsx/esm" multiverse`).
All commands behave identically to `pnpm cli` from within the workspace. However,
the path does NOT work from outside the workspace: `tsx` is a workspace devDependency
and resolves relative to CWD; provider packages are workspace-local and not on npm.
The guide now documents the within-workspace proof with the structural limitation
stated explicitly. The stale usage/help string (showed `--worktree-id` as required
in `derive`, `validate`, `reset`, `cleanup`, `run` after Slice 37 made it optional)
was also fixed.

**Is real multi-worktree isolation with auto-discovery proven against actual `git worktree add` checkouts?**

Slice 42 closes the last load-bearing workflow proof gap in the external-demo-guide:
Step 5 had only been simulated with explicit `--worktree-id` values. A new acceptance
test now creates a real linked worktree checkout, runs `derive` from both the primary
checkout and the linked worktree without `--worktree-id`, and proves that discovered
worktree identities differ and produce non-colliding DB paths and ports. Step 5 now
uses the concrete sample-express command and documents auto-discovery for real
worktrees, with `--worktree-id` retained as an explicit override.

**Can the compiled/global binary path load TypeScript providers without manual `NODE_OPTIONS` in workspace scope?**

Slice 43 answers yes. The CLI now applies a narrow TypeScript-provider loading
fallback through `tsx/esm/api` when a TypeScript providers module is supplied on
the compiled/global binary path. In current workspace scope, a second engineer can
invoke `node apps/cli/bin/multiverse.js` or a globally-linked `multiverse` command
with a TypeScript providers module without manually setting
`NODE_OPTIONS="--import tsx/esm"`. Outside-workspace provider packaging and
distribution remain deferred.

**What are the semantic stability gaps that constitute the 0.6.x proving wave?**

Slice 44 establishes the planning baseline for `0.6.x`. A full provider lifecycle
capability matrix, a six-seam stability audit, and a proposed follow-on slice sequence
are documented in `docs/development/dev-slice-44.md`. The scenario-to-source-of-truth
cross-reference is in `docs/development/dev-slice-44-scenario-map.md`. Key findings:
no first-party provider implements `validateResource()` (spec gap); the scope-confirmation
vs effectful lifecycle distinction is proven in code but absent from spec docs; the
worktree identity scenario for the main checkout is inconsistent with ADR-0021
auto-discovery behavior. Four follow-on slices (45–49) are proposed to close these gaps.

**Are the lifecycle semantics — reset vs cleanup intent and scope-confirmation vs effectful
behavior — expressed clearly in source-of-truth documents?**

Slice 45 answers yes. `docs/spec/provider-model.md` now clearly distinguishes reset
intent ("prepare for fresh use; instance continues") from cleanup intent ("permanent
removal; instance no longer expected in use"). A scope-confirmation pattern is defined
for providers that own no mutable state: they may declare and implement reset/cleanup by
returning scope metadata without side effects, which is the correct behavior for logical-
identifier handles. `docs/scenarios/provider-model.scenarios.md` adds four scenarios
covering these distinctions. `docs/guides/provider-authoring-guide.md` adds a practical
scope-confirmation section with a code example, and a built-in provider reference
documenting process-scoped readiness (fixed-interval wait after spawn) and the
process-port-scoped `{PORT}` placeholder substitution.

## Current priority

The current priority is:

**`0.6.x` semantic stability — lifecycle semantics, refusal behavior, and naming consistency across providers, docs, and CLI output. The `0.5.x` early outside-usability phase is complete. Outside-workspace packaging and distribution remain explicitly deferred.**

## What kinds of work are highest-value right now

Examples of work that are strongly aligned with the current `0.6.x` phase:

* tightening lifecycle definitions across provider types (reset, cleanup, validate semantics)
* clarifying and testing refusal outcomes across all commands and providers
* naming consistency across docs, code, and CLI output
* making reset and cleanup behavior predictable for composed multi-provider applications
* spec or ADR groundwork before any implementation work in this area

## What is intentionally deferred

The following remain explicitly deferred:

* provider packaging and distribution outside the repository as standalone npm packages
* globally-linked binary usability for non-workspace repositories
* community-extension workflow optimization
* generalized plugin/ecosystem framing
* broad CLI redesign or new command surface
* new provider packages beyond the current six

## Practical instruction for contributors and agents

When deciding what to work on next, prefer work that answers the current proving question:

**Are Multiverse lifecycle semantics, refusal behavior, and naming consistent and
trustworthy across providers, docs, and CLI output?**

Use this preference order:

1. identify lifecycle or refusal behavior that is ambiguous or inconsistent across provider types
2. establish clear definitions through spec or ADR work before writing implementation code
3. validate that docs, code, and CLI output use consistent terminology
4. only then broader surface polish or new capabilities

## Related documents

* `docs/development/roadmap.md`
* `docs/development/implementation-strategy.md`
* `docs/development/repo-map.md`
* current ADRs under `docs/adr/`
