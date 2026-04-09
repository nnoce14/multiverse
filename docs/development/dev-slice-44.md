# Dev Slice 44 — 0.6.x Semantic Stability: Planning Pass

## Type

Planning and docs only. No implementation changes, no spec rewrites, no new ADRs.

## Context

The `0.5.x` early outside-usability phase is complete as of Slices 36–43. The documented
second-engineer workflow is proven end-to-end. Version posture has advanced to
`0.6.0-alpha.1`.

The `0.6.x` line targets semantic stability: making lifecycle semantics, refusal behavior,
and naming consistent and trustworthy across providers, docs, and CLI output. Before any
implementation slices begin, this planning pass establishes the evidence base: what is
stable, what needs alignment, what has genuine spec gaps, and what remains deferred.

## What this slice delivers

- `docs/development/dev-slice-44.md` — this planning document
- `docs/development/dev-slice-44-scenario-map.md` — seam-to-source-of-truth cross-reference

No spec, ADR, scenario, or implementation changes. Those belong to follow-on slices.

## Semantic seams in scope for 0.6.x

Six semantic seams have been identified for this wave:

1. **Lifecycle semantics across provider types** — reset vs cleanup distinction;
   scope-confirmation vs effectful provider behavior; provider-specific meanings
2. **Validate capability** — spec gap; no first-party provider implements validate;
   `scopedValidate` declaration field is parsed but has no current effect
3. **Refusal and error-boundary semantics** — category correctness, message consistency,
   intentional naming split between spec and contract
4. **Naming and terminology** — undocumented concepts in specs and guides;
   features present in code but absent from source-of-truth docs
5. **Consumer integration semantics** — appEnv exclusion from `derive --format=env`;
   explicit deferred classification for enhancement candidates
6. **Worktree identity scenario alignment** — main checkout identity in scenarios
   vs ADR-0021 auto-discovery behavior

## Provider lifecycle capability matrix

Verified from current source code across all six first-party providers:

| Provider | derive | validate | reset | cleanup | Notes |
|---|---|---|---|---|---|
| name-scoped | ✓ required | ✗ not declared | ✓ scope-confirm | ✓ scope-confirm | Owns no state; reset/cleanup return scope metadata with no side effects |
| path-scoped | ✓ required | ✗ not declared | ✓ effectful | ✓ effectful | Both delete the scoped directory; intent differs (see Seam 1 below) |
| local-port | ✓ required | n/a (endpoint) | ✗ | ✗ | Endpoint provider; derive-only |
| fixed-host-port | ✓ required | n/a (endpoint) | ✗ | ✗ | Endpoint provider; derive-only |
| process-scoped | ✓ required | ✗ not declared | ✓ effectful | ✓ effectful | Reset terminates + re-spawns; cleanup terminates + removes state dir |
| process-port-scoped | ✓ required | ✗ not declared | ✓ effectful | ✓ effectful | Same as process-scoped; adds `{PORT}` placeholder substitution in launch command |

**Summary observations:**

- No first-party resource provider declares or implements `validateResource()`
- The `scopedValidate: true` configuration path is wired in core but exercised by no current provider
- `path-scoped` reset and cleanup both delete the scoped directory; they differ in intent, not implementation
- `name-scoped` reset and cleanup are scope-confirmation only — no state is owned or affected
- `process-scoped` reset is distinctly different from cleanup: reset re-launches; cleanup terminates without re-launch
- `process-port-scoped` adds a `{PORT}` placeholder substitution in the launch command; this feature is implemented but not documented in any spec, ADR, or guide

---

## Stability audit

### Already-proven behavior that needs spec-level alignment

These behaviors are correctly implemented and tested but are expressed only in implementation
comments or `current-state.md`, not in `docs/spec/` or `docs/scenarios/`. A second engineer
or future provider author cannot derive them from the source-of-truth documents.

**1. Scope-confirmation vs effectful lifecycle semantics**

The name-scoped provider declares `reset: true` and `cleanup: true` but performs no side
effects. It returns scope-confirmation metadata to signal that the scope was recognized.
This is correct design: a provider that owns no state has nothing to destroy.

The path-scoped, process-scoped, and process-port-scoped providers perform real state changes
under reset and cleanup.

This distinction — scope-confirmation vs effectful — is a real and meaningful semantic
boundary. It is not documented in `docs/spec/provider-model.md`, `docs/scenarios/provider-model.scenarios.md`,
or `docs/guides/provider-authoring-guide.md`. A provider author following the guide would not
know when scope-confirmation is an appropriate reset/cleanup implementation.

**2. Reset vs cleanup intent distinction for path-scoped**

For path-scoped, both reset and cleanup delete the scoped directory. The difference is intent:
reset means "destroy state so the next run starts fresh" (the scoped path will be recreated
on next use); cleanup means "permanently remove state because this worktree is no longer
needed." The spec currently uses "reinitializes or destroys" for reset and "removes" for
cleanup — language that does not capture the intent distinction for providers where the
operations converge in implementation.

For process-scoped, the distinction is visible: reset terminates then re-spawns the process;
cleanup terminates without re-spawning. This makes intent clear in the implementation. The
spec should express this intent consistently across both provider types.

**3. Process-scoped readiness semantics**

The current `process-scoped` provider's readiness check is a fixed 500ms wait after spawn.
ADR-0015 requires readiness to be "explicit, observable, and provider-defined" and lists
stronger options (port reachability, health check) as examples. The current implementation
uses a fixed-interval wait, which satisfies the "explicit" requirement minimally.

This readiness contract (fixed-interval wait after spawn) is not documented in any spec
or guide. It should be documented explicitly as the current minimal implementation rather
than left as implicit implementation detail.

**4. `{PORT}` placeholder in process-port-scoped**

The `process-port-scoped` provider substitutes a `{PORT}` placeholder in the user-supplied
launch command with the derived port value. This feature is implemented and functional but
is not mentioned in `docs/spec/`, `docs/adr/`, `docs/scenarios/`, or
`docs/guides/provider-authoring-guide.md`. It represents undocumented behavior in a source
that should be derivable from source-of-truth docs.

---

### Genuine spec gaps to close in 0.6.x

These are areas where source-of-truth documents either explicitly mark items as open, are
silent where they should be explicit, or contain statements that conflict with implemented
behavior.

**1. Validate capability (highest priority)**

- `docs/spec/provider-model.md` and `docs/spec/endpoint-model.md` list validate as an
  optional provider capability
- `docs/spec/safety-and-refusal.md` lists validate as an operation subject to refusal
- `docs/spec/resource-isolation.md` lists required resource declaration fields but does NOT
  include `scopedValidate` (it lists `scopedReset` and `scopedCleanup` but omits validate)
- `docs/guides/provider-authoring-guide.md` shows `reset` and `cleanup` in the capabilities
  example but does not show `validate`
- No first-party provider declares or implements `validateResource()`
- The `scopedValidate` field is parsed in repository configuration and the core `validate`
  command is wired to call `validateResource()` if the provider declares `validate: true`
  — but no provider currently does

**Current state**: Validate is defined at the concept level and wired in the implementation
seam, but no first-party provider makes it functional. A user setting `scopedValidate: true`
on a resource declaration will see no provider-side validation occur. This is neither
documented as intentional nor as a known gap.

**The 0.6.x decision**: Either implement `validateResource` for at least one provider
(narrow, bounded), or explicitly classify provider-side validate as deferred for 1.0.
The `scopedValidate` omission from `docs/spec/resource-isolation.md` must be resolved
either way.

**2. Worktree identity scenario inconsistency**

`docs/scenarios/worktree-identity.scenarios.md` states:

> "Given the main checkout / When the tool derives worktree identity / Then the Worktree ID is `main`"

ADR-0021 states that auto-discovery resolves the primary checkout's identity as
`path.basename(entry.path)`, which is the directory name of the checkout — this may or may
not be `"main"` depending on where the repository was cloned. The scenario is only reliably
true when `--worktree-id main` is explicitly supplied.

The scenario needs annotation to clarify that it describes the explicit-flag case, and a
companion scenario should be added for auto-discovery behavior (discovered id = path basename,
not guaranteed to be `"main"`).

**3. Refusal category naming**

`docs/spec/safety-and-refusal.md` and ADR-0008 use human-readable names:
"invalid configuration", "unsupported capability", "unsafe scope", "provider failure."

The `Refusal` type in `@multiverse/provider-contracts` uses machine-readable identifiers:
`invalid_configuration`, `unsupported_capability`, `unsafe_scope`, `provider_failure`.

Both forms are used intentionally at their respective layers (spec is human-facing;
contract type is code-facing). However, this split is not stated anywhere. A reader could
conclude the two layers are inconsistent rather than intentionally different. The spec or
contract should briefly note that the category names correspond to the contract's `category`
field values.

---

### Explicitly deferred — not in scope for 0.6.x

The following items have been reviewed and classified as deferred. They should not be
pulled into 0.6.x:

- Provider packaging and distribution outside the workspace as standalone npm packages
- Globally-linked binary usability for non-workspace repositories
- `appEnv` injection for `derive --format=env` (explicitly excluded in ADR-0018; no
  follow-on ADR has been accepted; remains a post-1.0 candidate)
- Additional endpoint value kinds beyond `url` and `port`
- Multiple `appEnv` aliases for a single declaration (ADR-0018: "Richer shapes are deferred")
- Typed resource `appEnv` mapping (ADR-0019 explicitly deferred; current resource appEnv
  is string-alias only)
- Richer process-scoped readiness (health check, port-reachability): remains deferred
  per ADR-0015; appropriate as a focused future process-scoped extension slice
- Registry-based worktree identity persistence ("recreated worktree gets new lifecycle
  identity" scenario in worktree-identity.scenarios.md; requires a persistent registry,
  explicitly not addressed by ADR-0021)
- New provider packages
- Broad CLI redesign or new command surface
- New endpoint shapes

---

## Proposed 0.6.x follow-on slice sequence

Four narrowly scoped slices follow this planning pass. Each needs its own task document
before implementation begins. Order reflects priority and dependency.

### Slice 45 — Lifecycle semantics spec alignment (docs-only)

**Primary question**: Are the reset vs cleanup intent distinction and the scope-confirmation
vs effectful provider distinction clearly stated in source-of-truth documents?

**Likely file changes**:
- `docs/spec/provider-model.md` — distinguish reset intent (prepare for next use) from
  cleanup intent (permanent removal); add note on scope-confirmation semantics
- `docs/scenarios/provider-model.scenarios.md` — add scenarios for scope-confirmation
  vs effectful distinction; add scenarios for reset vs cleanup intent
- `docs/guides/provider-authoring-guide.md` — document when scope-confirmation is a
  correct reset/cleanup implementation; document process-scoped readiness current contract;
  document `{PORT}` placeholder substitution in process-port-scoped
- No implementation changes

**Out of scope**: New ADRs (only if spec ambiguity cannot be resolved without one),
implementation changes, new provider behaviors.

---

### Slice 46 — Validate capability resolution (spec decision + narrow implementation or deferral)

**Primary question**: Is `scopedValidate` a working capability or deferred? If working,
prove it through at least one first-party provider.

**Decision required before implementation**:
- **Option A (narrow implementation)**: Implement `validateResource` for `path-scoped`
  (checks whether the scoped path exists and is accessible). Update `docs/spec/`,
  `docs/scenarios/`, and `docs/guides/provider-authoring-guide.md`. This provides genuine
  value for the common workflow (verify the database path exists before running the app).
- **Option B (explicit deferral)**: Update `docs/spec/resource-isolation.md` to include
  `scopedValidate` in the resource declaration requirements with explicit notation that
  no first-party provider currently implements validate. Explicitly defer provider-side
  validate implementations to a post-1.0 slice. Remove `scopedValidate: false` from the
  external-demo-guide example if it creates confusion.

Either option must resolve the `docs/spec/resource-isolation.md` omission.

**Recommendation**: Option A (narrow path-scoped validate) is load-bearing for the
composed workflow: it closes a real usability gap for a user who wants to confirm their
database path is ready before starting their application. Option B is safe but leaves a
wired-but-unproven path in the system.

---

### Slice 47 — Refusal boundary alignment (docs + targeted messaging audit)

**Primary question**: Are refusal categories consistent and actionable in CLI output,
and is the spec/contract naming split documented?

**Likely file changes**:
- `docs/spec/safety-and-refusal.md` — add a note that the four category names correspond
  to `category` field values in the provider `Refusal` type
- CLI refusal message audit across all five commands (derive, validate, run, reset, cleanup)
- Fix any messages that conflate categories or are not actionable
- `docs/scenarios/safety-and-refusal.scenarios.md` — add any missing category × command
  combinations

**Implementation scope**: Narrow CLI message fixes only if a genuine messaging gap is found.
No new refusal categories. No CLI redesign.

---

### Slice 48 — Worktree identity scenario alignment (docs-only)

**Primary question**: Are the worktree identity scenarios consistent with ADR-0021
auto-discovery behavior?

**Likely file changes**:
- `docs/scenarios/worktree-identity.scenarios.md` — annotate the main checkout identity
  scenario to clarify it applies to the explicit `--worktree-id main` case; add a scenario
  for auto-discovery behavior (discovered id = path basename, not guaranteed to be `"main"`);
  add a scenario for auto-discovery refusal (git unavailable or no matching worktree path)

**Out of scope**: Implementation changes, new discovery behavior, consumer integration changes.

---

### Slice 49 — Consumer integration alignment (docs-only)

**Primary question**: Is the `appEnv` exclusion from `derive --format=env` explicitly
classified as a deliberate design decision rather than an oversight?

**Likely file changes**:
- ADR-0018 or a brief follow-on note — explicitly classify `appEnv` injection for
  `derive --format=env` as deferred rather than as an oversight; note that the exclusion
  was explicit and intentional in the 0.3.x scope decision
- Review consumer integration model docs for any remaining undocumented assumptions
  after the 0.5.x proving wave

**Out of scope**: Implementation changes, new appEnv semantics, new derive output formats.

---

## Out of scope for this planning slice

- Spec or scenario changes (belong to Slices 45–49)
- ADR authoring (deferred to individual slices)
- Implementation changes of any kind
- New provider packages or provider shapes
- Provider packaging/distribution outside workspace scope
- Broader CLI or command surface work

## Acceptance criteria for this planning slice

- `docs/development/dev-slice-44.md` (this file) is present and internally consistent
- `docs/development/dev-slice-44-scenario-map.md` is present and maps all six seams
- `docs/development/current-state.md` reflects `0.6.0-alpha.1` posture and the Slice 44
  planning findings (updated in this PR)
- `docs/development/roadmap.md` reflects `0.6.0-alpha.1` posture and immediate direction
  pointing to 0.6.x semantic stability (updated in PR #110, already merged to main)
- No implementation, spec, or ADR changes are introduced in this slice
- The proposed slice sequence (Slices 45–49) is narrow, bounded, and ordered by priority
