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

Current version posture: **0.3.0-alpha.3**

Interpretation:

* the core product thesis is proven in real workflows
* the usable core of Multiverse has moved beyond isolated seam proofs
* a richer composed application workflow has now been demonstrated through mixed-provider integration
* the product is still in active proving, but the consumer-workflow question is now materially narrower than it was before ADR 0018 and ADR 0019
* the repository has now started the first `0.4.x` extensibility proof with a second endpoint-provider shape

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

## Current highest-priority proving question

The current highest-priority question is:

**Can a second explicit endpoint-provider shape be added without changing the established consumer workflow or weakening the core/provider boundary?**

ADR 0018 and ADR 0019 established the consumer workflow strongly enough to move to this next question. ADR 0020 defines the first narrow extensibility proof.

## Current priority

The current priority is:

**Executing and stabilizing the first `0.4.x` extensibility proof while preserving the now-proven consumer workflow**

That means work should preferentially strengthen:

* the first additional provider shape under the existing endpoint contract
* clarity of the line between repository-owned declaration config and provider-owned derivation rules
* confidence that `run` and app-native endpoint mapping remain unchanged for consumers
* docs and tests that make the new extensibility seam understandable without widening scope

## What kinds of work are highest-value right now

Examples of work that are strongly aligned with the current phase:

* implementing one additional meaningful provider shape cleanly
* tightening docs around what belongs in core versus provider code
* bounded stabilization of declaration validation and refusal behavior for the new seam
* preserving the proven app-native mapping and runtime-config boundary story while extensibility grows

## What is intentionally deferred

The following remain explicitly lower priority until the composed application consumer workflow is more mature:

* broad provider ecosystem positioning
* formal provider-authoring guidance
* community-extension workflow optimization
* generalized plugin/ecosystem framing

These are not rejected. They are deferred until the richer composed application proof is complete.

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
