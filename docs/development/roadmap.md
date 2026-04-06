# Multiverse Roadmap

## Purpose

This document records the current product roadmap for Multiverse.

It exists to give human contributors and coding agents a shared view of:

* the current version posture
* what each version line is intended to prove
* which kinds of work are highest-value right now
* what conditions should be met before moving to the next version milestone

This roadmap is a planning tool, not a promise of exact dates or exact issue ordering.

## Guiding principles

Multiverse development continues under the same core assumptions:

* human-led domain discovery happens before implementation
* business truth comes from ADRs, specs, scenarios, and active development docs
* implementation remains behavior-first and TDD-driven
* ergonomics should improve without introducing hidden behavior
* Multiverse remains a local runtime isolation tool, not a generic orchestrator
* extensibility should come through explicit provider contracts, not ad hoc exceptions

## Current version posture

Current version posture: **0.2.0-alpha.2**

What that means:

* the core isolation model is real and demonstrable
* the CLI has both a repo-local development path and a formal binary direction
* explicit `run` workflow exists
* multiple provider shapes have been implemented and tested
* the product is usable for bounded demos and proving work
* the model is still being stress-tested through richer application composition

This version line is still focused on **proving the core product**, not on ecosystem formalization.

## Version roadmap

## 0.2.x alpha — usable core, proving composition

### Meaning

The `0.2.x` line is for proving that the usable core of Multiverse works beyond isolated feature slices.

This line should demonstrate:

* deterministic isolation across worktrees
* a coherent CLI surface
* explicit runtime wrapper behavior
* stable consumer-facing runtime values
* richer composition of multiple providers within one application

### Current focus

The highest-priority work in `0.2.x` is:

* a richer proving application
* multiple resources and multiple endpoints in one app
* mixed provider types working together
* stronger end-to-end integration coverage for the composed application story
* docs and guides that reflect the composed workflow honestly

### In-scope work for this phase

Examples of appropriate work in this phase:

* more realistic proving apps
* mixed-provider composition
* richer integration tests
* reset/cleanup behavior across multiple isolated seams
* CLI/runtime polish that supports the common-case Node application workflow
* documentation updates that reflect implemented behavior accurately

### Out-of-scope emphasis for this phase

The following may still happen if necessary, but they are not the primary focus of `0.2.x`:

* formal provider ecosystem positioning
* broad provider-authoring guidance
* outside-contributor workflows
* global install/distribution polish beyond what is needed for credible core proving

### Exit criteria for moving beyond 0.2.x

The project should not move to the next version line until all of the following feel true:

* one richer application demonstrates mixed-provider composition cleanly
* multiple resources and endpoints can be consumed naturally in one app
* the current CLI/runtime contract feels stable enough for broader proving
* integration tests cover realistic composed workflows, not just isolated provider behavior
* no major abstraction redesign is required after the richer application proof

## 0.3.x alpha — realistic composed application behavior

### Meaning

The `0.3.x` line is for proving that Multiverse can support a realistic local application with several isolated runtime seams at once.

The focus is not feature count. The focus is **application composition under realistic pressure**.

### Primary proving goals

This version line should prove:

* one application can consume multiple Multiverse-managed values naturally
* multiple provider types can coexist without awkward special-casing
* lifecycle semantics remain understandable when several isolated seams exist together
* the common-case Node application story is becoming stronger and more credible

### Typical work in this phase

Examples:

* a richer proving application using several provider types
* path-scoped state plus process-backed supporting service plus local-port endpoint
* richer mixed-provider lifecycle testing
* guides that show composed application workflows clearly
* incremental consumer-experience improvements discovered through the richer demo

### Exit criteria for moving beyond 0.3.x

The project should not move beyond `0.3.x` until:

* a composed application workflow works end-to-end
* reset/cleanup behavior remains clear under mixed-provider composition
* the model still feels coherent after realistic application pressure
* the richer proving app can be demonstrated and explained without author-only knowledge

## 0.4.x alpha — extensibility proof

### Meaning

The `0.4.x` line is for proving that the provider model is extensible without distorting the architecture.

By this point, the core composed application story should already be credible. The next question becomes whether new providers can be added predictably and cleanly.

### Primary proving goals

This version line should prove:

* new provider shapes can be added without excessive core churn
* provider contracts are a real platform seam
* the distinction between core-maintained behavior and extension behavior remains clear
* the system can grow without becoming a special-case pile

### Typical work in this phase

Examples:

* one or more additional meaningful provider implementations
* refinement of provider capability semantics
* contributor-facing provider authoring guidance
* documentation clarifying what belongs in core versus what belongs in extensions

### Exit criteria for moving beyond 0.4.x

The project should not move beyond `0.4.x` until:

* at least one meaningful new provider shape has been added cleanly
* core/provider boundaries still hold under that pressure
* provider authoring expectations are understandable
* the extension story feels credible rather than hypothetical

## 0.5.x beta — early outside usability

### Meaning

The `0.5.x` line is the point where Multiverse should begin to feel usable to someone other than the primary author.

This is where "beta" starts to make sense.

### Primary proving goals

This version line should prove:

* another engineer can follow the docs and succeed
* the common-case Node workflow is understandable and reproducible
* the CLI surface feels intentional rather than provisional
* the product identity is clear

### Typical work in this phase

Examples:

* installation and invocation polish
* stronger guides and examples
* clearer error/refusal messages
* outside-user reproducibility of the core demos
* polish for the formal CLI surface

### Exit criteria for moving beyond 0.5.x

The project should not move beyond `0.5.x` until:

* another engineer can use the tool successfully from docs
* the common-case workflow is not dependent on live guidance
* docs and product language are stable enough for early outside experimentation

## 0.6.x–0.9.x beta — hardening toward 1.0

### Meaning

These version lines are for hardening, narrowing, and deciding what 1.0 truly includes.

The point is not to add everything. The point is to stabilize the supported core.

### Expected focus

Examples:

* lifecycle semantics hardening
* provider boundary hardening
* refusal behavior hardening
* CLI/distribution refinement
* support boundary definition
* deciding what remains deferred beyond 1.0

## 0.6.x beta — semantic stability

### Meaning

The `0.6.x` line is for stabilizing the product contract.

By this stage, Multiverse should already have a credible common-case workflow and a stronger proving story. The focus now shifts from proving new ideas to making existing semantics dependable.

### Primary goals

This version line should stabilize:

* lifecycle semantics across provider types
* refusal behavior and error boundaries
* naming consistency for core concepts
* reset and cleanup expectations
* the meaning of "ready" where providers expose lifecycle behavior

### Typical work in this phase

Examples:

* tightening lifecycle definitions across providers
* clarifying and testing refusal outcomes
* documenting and verifying edge-case behavior
* removing ambiguous terminology from docs and CLI output
* ensuring provider capability semantics remain consistent

### Exit criteria for moving beyond 0.6.x

The project should not move beyond `0.6.x` until:

* lifecycle semantics feel consistent and trustworthy
* refusal behavior is understandable and predictable
* major core terms are stable across docs, code, and CLI output
* users can infer what Multiverse will do without guesswork

## 0.7.x beta — public surface stability

### Meaning

The `0.7.x` line is for stabilizing the public-facing product surface.

The goal is to make the CLI, help text, output formats, and usage patterns feel intentional rather than still shifting under active development.

### Primary goals

This version line should stabilize:

* command names
* flags and invocation patterns
* CLI help text
* output conventions
* installation/build/link expectations
* example and guide consistency

### Typical work in this phase

Examples:

* refining command and flag naming
* improving help output and examples
* making output formats more consistent
* aligning docs with the actual invocation surface
* reducing inconsistencies between repo-local and formal CLI usage paths

### Exit criteria for moving beyond 0.7.x

The project should not move beyond `0.7.x` until:

* the CLI surface feels coherent and stable
* documentation examples are consistent with actual usage
* common command flows feel intentional rather than provisional
* users are not forced to relearn the surface between minor milestones

## 0.8.x beta — support boundary definition

### Meaning

The `0.8.x` line is for defining what Multiverse officially supports for 1.0.

The goal is not to support everything. The goal is to make the intended scope explicit and defensible.

### Primary goals

This version line should define:

* which provider types are first-class for 1.0
* which workflows are part of the supported common case
* which behaviors remain experimental
* what belongs in core versus extensions
* what is intentionally deferred beyond 1.0

### Typical work in this phase

Examples:

* documenting supported provider categories
* clarifying the common-case Node workflow for 1.0
* defining what remains out of scope
* making the extension story explicit
* marking experimental or deferred areas clearly

### Exit criteria for moving beyond 0.8.x

The project should not move beyond `0.8.x` until:

* users can tell what Multiverse officially supports
* users can tell what remains experimental or deferred
* the core-versus-extension boundary is understandable
* 1.0 no longer depends on broad or ambiguous promises

## 0.9.x beta — release-candidate hardening

### Meaning

The `0.9.x` line is the final hardening stage before 1.0.

By this point, the product should no longer be discovering its identity. The remaining work is validating, tightening, and removing trust-eroding rough edges.

### Primary goals

This version line should finalize:

* documentation accuracy
* integration proof for supported workflows
* final CLI and lifecycle polish
* final refusal/error clarity
* release-readiness of the core supported experience

### Typical work in this phase

Examples:

* final guide and README accuracy pass
* final end-to-end validation of supported workflows
* smoke testing of the formal CLI path
* cleanup of rough edges that would undermine trust
* final verification that support boundaries and product language are aligned

### Exit criteria for moving beyond 0.9.x

The project should not move beyond `0.9.x` until:

* the supported workflows have been validated end to end
* docs are accurate and trustworthy
* remaining rough edges are no longer likely to surprise users
* the team is validating the release candidate rather than still discovering the product

## 1.0.0 — supported core model

### Meaning

`1.0.0` should mean that the supported product truth is stable.

At 1.0, Multiverse should provide:

* a stable core isolation model
* honest and documented lifecycle semantics
* a coherent CLI surface
* a strong common-case local Node workflow
* proof of composed application behavior
* credible extensibility through provider contracts
* documentation sufficient for independent use

### What 1.0 does not need to mean

It does not need to mean:

* every possible provider exists
* every runtime or language is supported
* generic orchestration of arbitrary systems
* complete ecosystem maturity

It should mean that the product is trustworthy in its intended scope.

## Immediate direction

The current near-term direction remains:

* finish proving richer mixed-provider application composition
* keep the work anchored to the `0.2.x` line
* defer provider-ecosystem formalization until the richer composition proof is complete

## Practical summary

One-line summary of the roadmap:

* `0.2.x` proves the usable core and richer composition
* `0.3.x` proves realistic composed application behavior
* `0.4.x` proves extensibility
* `0.5.x` proves early outside usability
* `0.6.x` stabilizes semantics
* `0.7.x` stabilizes product surface
* `0.8.x` stabilizes support boundaries
* `0.9.x` release candidate hardening
* `1.0.0` proves a stable trustworthy product within its intended scope
