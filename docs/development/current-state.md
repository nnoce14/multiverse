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

Current version posture: **0.4.0-alpha.1**

Interpretation:

* the core product thesis is proven in real workflows
* the usable core of Multiverse has moved beyond isolated seam proofs
* a richer composed application workflow has now been demonstrated through mixed-provider integration
* the product remains in active proving, but the consumer-workflow question is now materially narrower than it was before ADR 0018 and ADR 0019
* the current published project version is `0.4.0-alpha.1`, reflecting that `main` now contains the first narrow `0.4.x` extensibility proof for an additional endpoint-provider shape
* `0.4.0-alpha.1` is explicitly a proof posture: it documents that the new provider shape is live while keeping the `0.3.x` consumer workflow unchanged and the 1.0 expectations intentionally narrow

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

## Current priority

The current priority is:

**`0.4.x` extensibility proof is complete — transition planning toward `0.5.x`**

Slices 31–35 have fully closed the 0.4.x extension story: a second endpoint
provider shape (Slice 31), non-first-party authoring proof and guide (Slice 32),
parameterized derive compliance suite (Slice 33), CLI error surfacing (Slice 34),
and CLI-level non-first-party invocation proof (Slice 35). All four 0.4.x roadmap
exit criteria are now met.

The next question is 0.5.x: can another engineer follow the docs and succeed?
That is a different class of work — cold-start usability, install/invocation path,
and getting-started guide — not more provider extension proving.

## What kinds of work are highest-value right now

Examples of work that are strongly aligned with the current phase:

* assessing the 0.4.x exit criteria formally and declaring the checkpoint
* defining the first concrete 0.5.x slice (outside-user usability proof)
* identifying the most load-bearing cold-start friction a second engineer would
  encounter following the existing docs

## What is intentionally deferred

The following remain explicitly lower priority until the `0.4.x` extensibility
proof is more complete:

* broad provider ecosystem positioning
* provider packaging and distribution outside the repository
* community-extension workflow optimization
* generalized plugin/ecosystem framing

A narrow provider authoring guide and core/registry acceptance proof now exist
(Slice 32). Broader ecosystem framing remains deferred.

## Version-milestone meaning for the current phase

The 0.3.x line should be understood as:

* composed application behavior is now proven enough to refine
* the current focus is confirming that the chosen consumer workflow is credible and stable enough
* the repo is not yet in ecosystem or outside-user optimization mode

A move beyond 0.3.x should happen only after the composed application workflow feels clean, the consumer integration model is materially improved, and the common-case workflow is stable enough for broader extension and usability work.

At the current repo state, the source documents do not define one remaining concrete product-behavior gap inside `0.3.x`. If more `0.3.x` work is needed, it is most likely a narrow stabilization or documentation clarification, not a new exploratory consumer-model feature.

## Practical instruction for contributors and agents

When deciding what to work on next, prefer work that answers the current proving question.

Use this preference order:

1. bounded stabilization of the proven common-case workflow
2. docs/guides that support the richer proving story
3. transition planning toward the next major proving question
4. only then broader extension/ecosystem work

If a potential task is interesting but does not materially strengthen the current proving direction, it is probably not the highest-value next task.

## Related documents

* `docs/development/roadmap.md`
* `docs/development/implementation-strategy.md`
* `docs/development/repo-map.md`
* current ADRs under `docs/adr/`
