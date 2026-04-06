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
* the product is still in active proving, but the next major focus is consumer workflow maturity rather than basic feasibility

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

### Provider model

The provider model has been proven across several shapes, including:

* name-scoped resource behavior
* path-scoped resource behavior
* local-port endpoint behavior
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

## Current highest-priority proving question

The current highest-priority question is:

**What is the cleanest explicit consumer integration model for composed applications, so that developers do not have to code directly against raw MULTIVERSE_* environment variables in the common 1.0 workflow?**

This is the main focus of the current implementation phase.

## Current priority

The current priority is:

**Refining the composed application developer experience**

That means work should preferentially strengthen:

* the common-case workflow for composed applications
* explicit and low-friction consumption of derived runtime values
* app-native configuration mapping where justified
* realistic multi-seam runtime flows
* continued integration coverage only where it sharpens confidence in the consumer experience

## What kinds of work are highest-value right now

Examples of work that are strongly aligned with the current phase:

* building a more complex proving application than the initial sample
* composing path-scoped, process-backed, and endpoint-based seams in one app
* adding integration tests for mixed-provider workflows
* refining docs/guides around composed application demos
* tightening CLI/runtime behavior only where it improves the common proving workflow

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
* the current focus is consumer workflow maturity
* the repo is not yet in ecosystem or outside-user optimization mode

A move beyond 0.3.x should happen only after the composed application workflow feels clean, the consumer integration model is materially improved, and the common-case workflow is stable enough for broader extension and usability work.

## Practical instruction for contributors and agents

When deciding what to work on next, prefer work that answers the current proving question.

Use this preference order:

1. richer composed application behavior
2. integration coverage for mixed-provider workflows
3. docs/guides that support the richer proving story
4. only then broader extension/ecosystem work

If a potential task is interesting but does not materially strengthen the current proving direction, it is probably not the highest-value next task.

## Related documents

* `docs/development/roadmap.md`
* `docs/development/implementation-strategy.md`
* `docs/development/repo-map.md`
* current ADRs under `docs/adr/`
