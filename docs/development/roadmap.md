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

Current version posture: **0.3.0-alpha.3**

What that means:

* the usable core of Multiverse is proven
* the CLI has both a repo-local development path and a formal binary direction
* explicit `run` workflow exists
* multiple provider shapes have been implemented and tested
* a richer composed application workflow has now been proven through mixed-provider integration
* the current `0.3.x` proving path now includes:
  * explicit app-native env mapping for resources and endpoints
  * typed endpoint mapping for `url` and `port`
  * an application-owned runtime-config boundary proof in `sample-compose`
* the current focus is confirming that the common-case workflow is now credible enough to transition toward `0.4.x` extensibility proof

## Version roadmap

## 0.2.x alpha — usable core, proving composition

### Meaning

The `0.2.x` line is for proving that the usable core of Multiverse works beyond isolated feature slices.

This line proves:

* deterministic isolation across worktrees
* a coherent CLI surface
* explicit runtime wrapper behavior
* stable consumer-facing runtime values
* richer composition of multiple providers within one application

### What 0.2.x proved

The `0.2.x` line established:

* deterministic derivation across multiple provider types
* explicit runtime wrapper behavior through `run`
* conventional defaults for repository-local usage
* process-scoped and process-port-scoped provider support
* formal CLI packaging direction
* a richer proving application using mixed providers together in one app

### Consumer experience emphasis in 0.2.x

Consumer-experience work in this phase focused on:

* removing obvious friction from the basic path
* making docs and CLI usage more accurate
* reducing repetitive setup pain
* making the core product usable in bounded demos and proving workflows

### Exit criteria for moving beyond 0.2.x

The project should not move to the next version line until all of the following feel true:

* one richer application demonstrates mixed-provider composition cleanly
* multiple resources and endpoints can be consumed naturally in one app
* the current CLI/runtime contract feels stable enough for broader proving
* integration tests cover realistic composed workflows, not just isolated provider behavior
* no major abstraction redesign is required after the richer application proof

## 0.3.x alpha — composed application behavior and consumer workflow refinement

### Meaning

The `0.3.x` line is for refining the composed application workflow now that richer mixed-provider composition has been proven.

The focus is no longer basic feasibility. The focus is making the composed application workflow cleaner, more natural, and more representative of the intended 1.0 common-case experience.

### Primary proving goals

This version line should prove:

* one application can consume multiple Multiverse-managed values naturally
* multiple provider types can coexist without awkward special-casing
* lifecycle semantics remain understandable when several isolated seams exist together
* the common-case Node application story becomes stronger and more credible
* the developer-facing integration model becomes cleaner than direct raw `MULTIVERSE_*` usage in application code

### Consumer experience focus in this phase

The `0.3.x` line should refine how applications consume Multiverse-derived runtime values.

The current `MULTIVERSE_*` environment variables are a useful transport seam, but they are not the ideal long-term app-facing programming model for 1.0.

This phase should therefore explore and prove cleaner integration patterns for composed applications, such as:

* application-owned runtime config boundaries
* explicit mapping from declared Multiverse resources and endpoints to app-native environment variables
* reducing or eliminating the need for consumer application code to read raw `MULTIVERSE_*` names directly

Any such improvement must remain explicit and declarative. Hidden inference and implicit file mutation remain out of scope.

### Preferred direction

The likely preferred 1.0-facing direction is:

* Multiverse continues to derive isolated runtime values and inject them into the child process launched by `run`
* consumer applications should not need Multiverse-specific code scattered through the application
* application code should ideally consume either:

  * app-owned runtime config derived at one boundary, or
  * explicitly mapped app-native environment variables such as `PORT`, `DATABASE_URL`, or similar

The product should evolve away from requiring direct reads of raw `MULTIVERSE_*` names throughout consumer application code.

### What 0.3.x has now proven

The current `0.3.x` implementation has proven a concrete common-case consumer path:

* `multiverse run` still injects canonical `MULTIVERSE_*` transport variables
* repository configuration can map resources to app-native env names explicitly
* repository configuration can map endpoints to either:
  * full `url` values, or
  * extracted `port` values
* a composed application can consume those app-owned names at one explicit runtime-config boundary instead of scattering direct `MULTIVERSE_*` reads through the app

This means the `0.3.x` line is no longer primarily exploring whether a cleaner consumer model is possible. It has a credible explicit proving path.

### Typical work in this phase

Examples:

* refining the richer proving application
* proving cleaner runtime-config boundary patterns
* designing and proving explicit app-native env mapping
* strengthening mixed-provider integration coverage where it improves confidence
* reducing friction discovered through the richer composed application workflow
* improving docs and guides for the composed app story

### Explicit constraints for this phase

The following are not acceptable directions for this phase:

* hidden inference of consumer configuration names
* silent mutation of arbitrary consumer config files
* broad framework-specific magic
* turning Multiverse into an invasive application framework
* introducing broader ecosystem abstractions before the consumer workflow is mature

### Exit criteria for moving beyond 0.3.x

The project should not move beyond `0.3.x` until:

* a composed application workflow feels clean rather than merely possible
* the consumer integration model is materially improved from raw `MULTIVERSE_*` reads in app code
* reset and cleanup behavior remain understandable under mixed-provider composition
* the richer proving app can be demonstrated and explained without author-only knowledge
* the common-case workflow is stable enough to support broader extension and usability work

At the current `0.3.0-alpha.3` posture, no additional single concrete product-behavior gap is defined in the source-of-truth documents. Remaining `0.3.x` work, if any, is more likely to be:

* bounded stabilization of the chosen consumer model, or
* documentation and transition work that makes readiness for `0.4.x` explicit

## 0.4.x alpha — extensibility proof

### Meaning

The `0.4.x` line is for proving that the provider model is extensible without distorting the architecture.

By this point, the composed application workflow should already be credible. The next question becomes whether new providers can be added predictably and cleanly.

### Primary proving goals

This version line should prove:

* new provider shapes can be added without excessive core churn
* provider contracts are a real platform seam
* the distinction between core-maintained behavior and extension behavior remains clear
* the system can grow without becoming a special-case pile

### Consumer experience focus in this phase

This phase should also prove that extensibility does not degrade the user experience.

That means:

* extension points remain understandable
* provider capabilities remain predictable
* consumer workflows do not become cluttered by extension-specific special cases
* app-native configuration mapping, if adopted, remains explicit and stable across provider growth

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

### Consumer experience focus in this phase

By `0.5.x`, the cleaner consumer integration model should become the documented default for the common case.

That means:

* the recommended workflow should not require consumer application code to depend directly on raw `MULTIVERSE_*` names throughout the app
* the common-case path should be either:

  * application-owned runtime config boundaries, or
  * explicit app-native environment variable mapping
* the install/build/link story should be coherent
* getting-started guides should be sufficient without live guidance

### Typical work in this phase

Examples:

* installation and invocation polish
* stronger guides and examples
* clearer error/refusal messages
* outside-user reproducibility of the core demos
* polish for the formal CLI surface
* documentation that makes the common-case integration model feel obvious

### Exit criteria for moving beyond 0.5.x

The project should not move beyond `0.5.x` until:

* another engineer can use the tool successfully from docs
* the common-case workflow is not dependent on live guidance
* docs and product language are stable enough for early outside experimentation
* the recommended consumer integration model is clear and reproducible

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
* the semantics of the chosen consumer integration model

### Typical work in this phase

Examples:

* tightening lifecycle definitions across providers
* clarifying and testing refusal outcomes
* documenting and verifying edge-case behavior
* removing ambiguous terminology from docs and CLI output
* ensuring provider capability semantics remain consistent
* ensuring app-native configuration mapping or runtime-config boundary behavior is stable and predictable

### Exit criteria for moving beyond 0.6.x

The project should not move beyond `0.6.x` until:

* lifecycle semantics feel consistent and trustworthy
* refusal behavior is understandable and predictable
* major core terms are stable across docs, code, and CLI output
* users can infer what Multiverse will do without guesswork
* the consumer configuration model feels dependable rather than still exploratory

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
* the public explanation of how applications should consume Multiverse-managed runtime values

### Typical work in this phase

Examples:

* refining command and flag naming
* improving help output and examples
* making output formats more consistent
* aligning docs with the actual invocation surface
* reducing inconsistencies between repo-local and formal CLI usage paths
* aligning all guides around the stable consumer integration model

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
* what consumer integration model is officially supported for 1.0

### Typical work in this phase

Examples:

* documenting supported provider categories
* clarifying the common-case Node workflow for 1.0
* defining what remains out of scope
* making the extension story explicit
* marking experimental or deferred areas clearly
* documenting the official consumer-facing configuration story

### Exit criteria for moving beyond 0.8.x

The project should not move beyond `0.8.x` until:

* users can tell what Multiverse officially supports
* users can tell what remains experimental or deferred
* the core-versus-extension boundary is understandable
* the supported consumer integration model is explicit
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
* final trust in the supported consumer configuration model

### Typical work in this phase

Examples:

* final guide and README accuracy pass
* final end-to-end validation of supported workflows
* smoke testing of the formal CLI path
* cleanup of rough edges that would undermine trust
* final verification that support boundaries and product language are aligned
* final verification that applications can integrate without invasive Multiverse-specific code changes in the common case

### Exit criteria for moving beyond 0.9.x

The project should not move beyond `0.9.x` until:

* the supported workflows have been validated end to end
* docs are accurate and trustworthy
* remaining rough edges are no longer likely to surprise users
* the team is validating the release candidate rather than still discovering the product

## 1.0.0 — stable, trustworthy, intentionally bounded

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

### Consumer experience expectation for 1.0

At 1.0, Multiverse should not require developers in the common case to scatter direct reads of raw `MULTIVERSE_*` environment variables throughout consumer application code.

The 1.0 common-case experience should instead provide a cleaner and more explicit model, such as:

* application-owned runtime config boundaries, or
* explicit app-native environment variable mapping

The transport seam may still involve environment injection internally, but the intended app-facing programming model should be cleaner, more stable, and less invasive.

### What 1.0 does not need to mean

It does not need to mean:

* every possible provider exists
* every runtime or language is supported
* generic orchestration of arbitrary systems
* complete ecosystem maturity

It should mean that the product is trustworthy in its intended scope.

## Immediate direction

The current near-term direction is:

* confirm and document the now-proven common-case consumer workflow
* stabilize the chosen consumer model where needed without broadening scope
* transition toward `0.4.x` extensibility proof once no concrete remaining `0.3.x` consumer gap is identified

Provider-ecosystem formalization remains deferred until the consumer workflow for composed applications is more mature.

### Configuration and CLI boundary for the current phase

The current preferred direction for reducing developer friction is:

1. explicit app-native environment variable overlay at process launch
2. application-owned runtime config boundaries where needed
3. generated or overlay config-file workflows only if explicitly declared and truly necessary

The current implementation has already proven items 1 and 2 in the composed sample application. No broader config-overlay workflow is currently justified by the source documents.

The following are explicitly out of bounds for the common path:

* hidden inference of consumer configuration names
* silent mutation of developer-owned config files
* broad framework-specific magic
* implicit discovery beyond documented conventional defaults

### CLI invocation expectations

Until the formal CLI installation/distribution story is fully mature, the product must distinguish between:

* repo-local development invocation (`pnpm cli ...`)
* formal built or linked CLI invocation (`multiverse ...`)

Documentation and guides must keep those paths explicit and must not present the formal binary path as universally available when it depends on build/link/install steps.

### Configuration philosophy

Conventional defaults are acceptable when they are:

* strict
* documented
* inspectable
* easy to override explicitly

Additional convenience through hidden discovery is not part of the intended 1.0 direction.

If Multiverse later supports config-file overlays (for example `.env.local` or `local.settings.json`), those workflows must remain explicit and non-destructive. Developer-owned configuration files must not be silently rewritten.

## Practical summary

One-line summary of the roadmap:

* `0.2.x` proved the usable core and richer composition
* `0.3.x` refines composed application behavior and consumer workflow
* `0.4.x` proves extensibility
* `0.5.x` proves early outside usability
* `0.6.x` stabilizes semantics
* `0.7.x` stabilizes the public CLI/docs surface
* `0.8.x` defines support boundaries
* `0.9.x` hardens the release candidate
* `1.0.0` delivers a stable trustworthy product within its intended scope
