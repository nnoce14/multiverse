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

Current version posture: **0.2.0-alpha.2**

Interpretation:

* the core product thesis is proven in constrained but real workflows
* the CLI is usable in both repo-local development and formal binary-oriented directions
* multiple provider types now exist and are covered at several test tiers
* the product is still in active proving, not stabilization or ecosystem mode

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
* formal CLI packaging/binary work is underway or newly established, depending on current branch state

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

## Current highest-priority proving question

The current highest-priority question is:

**Can one richer application consume multiple Multiverse-managed resources and endpoints at once, using mixed provider types, without the model becoming awkward or inconsistent?**

This is the main focus of the current implementation phase.

## Current priority

The current priority is:

**Richer mixed-provider composition in a single application**

That means work should preferentially strengthen:

* applications with multiple resources
* applications with multiple endpoints
* multiple provider types used together
* realistic end-to-end runtime consumption
* realistic reset/cleanup behavior across composed seams
* integration coverage for composed workflows

## What kinds of work are highest-value right now

Examples of work that are strongly aligned with the current phase:

* building a more complex proving application than the initial sample
* composing path-scoped, process-backed, and endpoint-based seams in one app
* adding integration tests for mixed-provider workflows
* refining docs/guides around composed application demos
* tightening CLI/runtime behavior only where it improves the common proving workflow

## What is intentionally deferred

The following are explicitly lower priority until richer composition is proven:

* broad provider ecosystem positioning
* formal provider-authoring guidance
* community-extension workflow optimization
* generalized plugin/ecosystem framing
* broad distribution polish beyond what is needed for current proving work

These are not rejected. They are deferred until the richer composed application proof is complete.

## Version-milestone meaning for the current phase

The `0.2.x` line should be understood as:

* usable core
* still proving composition
* not yet in ecosystem or outside-user optimization mode

A move beyond `0.2.x` should happen only after richer mixed-provider application composition is convincingly demonstrated.

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
