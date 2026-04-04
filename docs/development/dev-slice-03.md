# Dev Slice 03 — Validated Core Model at the Application Boundary

## Status

Proposed

## Intent

Establish the first implementation-grade validation seam between untrusted application input and trusted core model construction.

This slice introduces a narrow, explicit mechanism for converting raw external input into validated domain values before core behavior executes.

The goal is not to implement all domain rules at once.

The goal is to prove the architectural seam and use it on the first load-bearing concept so that future slices can extend it safely and consistently.

---

## Why this slice now

Slices 01 and 02 established the repo’s implementation posture, tooling workflow, and behavior-first TDD path.

The next bottleneck is not provider execution.

The next bottleneck is trust.

Before provider orchestration, isolation planning, or CLI/application flows can be implemented safely, the system needs a reliable way to distinguish:

- raw input crossing a system boundary
- validated values the core is allowed to trust
- structured refusal/validation errors when input is not acceptable

Without this seam, later slices risk smearing parsing, validation, and domain behavior across layers.

---

## Problem statement

Multiverse has explicit domain and architectural boundaries, and its core responsibility is deterministic local isolation. The implementation now needs a concrete rule for how raw inputs are admitted into the trusted model. :contentReference[oaicite:1]{index=1}

At present, there is no implementation-grade contract for:

- accepting raw inputs from the application boundary
- validating them into trusted domain values
- returning stable, structured validation failures
- preventing invalid values from entering core behavior

This slice closes that gap.

---

## Slice objective

Implement the first validated-core seam such that:

1. application-layer code may submit raw input objects
2. validation occurs before trusted core model construction
3. successful validation yields strongly trusted core values
4. failed validation yields structured, testable error output
5. core behavior does not need to reason about malformed raw input

---

## Scope

This slice includes:

- a small validation result contract
- a first-pass validation error shape suitable for acceptance and unit tests
- one first-class validated domain object implemented through the seam
- tests that prove invalid raw input is rejected before trusted core use
- tests that prove valid raw input becomes a trusted core value
- cross-package imports must use declared package entry points rather than internal source file paths
- Slice 03 must not introduce any new imports that bypass package public entry paths
- when touching code involved in the Slice 03 path, existing bad cross-package imports in that path should be corrected

This slice should use the smallest domain object that is both:

- already central to the design
- likely to be reused by future slices

Recommended first validated object:

- `WorktreeIdentity`

If inspection of the current codebase shows another concept is already partially implemented and more load-bearing, that may be used instead, but only if it better preserves slice size and keeps the seam narrow.

---

## Out of scope

This slice does not include:

- provider execution
- endpoint allocation
- filesystem mutation
- process orchestration
- repository discovery side effects
- broad parsing/validation of every domain concept
- a full error taxonomy for all future failures
- CLI UX polish

---

## Architectural stance

This slice should reinforce the following rule:

> raw boundary input is not domain input

Application-facing entry points may accept permissive raw shapes.
Core domain behavior may only accept validated values or trusted domain objects.

Validation belongs at the seam between those two worlds.

This slice should keep that seam explicit in code structure, naming, and tests.

---

## Candidate target for first proof

### Preferred target: Worktree identity

Reasoning:

- it is foundational to isolation behavior
- it is likely referenced by repository, endpoint, and provider flows
- it is conceptually compact enough for a focused first slice
- invalid identity values are easy to express in behavior tests

Likely concerns to capture:

- required value
- non-empty / non-whitespace
- reserved identity handling
- normalization policy only if already specified by repo documents
- refusal of malformed or ambiguous input

Do not invent normalization behavior unless the existing spec already commits to it.

---

## Acceptance criteria

- A clear validation seam exists between application input and trusted core values.
- At least one domain value is only constructible through validation in normal application flow.
- Invalid raw input cannot silently cross into trusted core behavior.
- Validation failures return structured, stable results suitable for behavior tests.
- Successful validation returns a trusted value object or equivalent trusted representation.
- Tests demonstrate both valid and invalid examples for the chosen first object.
- No provider logic or side-effecting runtime isolation behavior is added in this slice.
- Code touched by this slice does not rely on cross-package imports through internal source paths.
- Cross-package dependencies in the implemented path use package public entry points only.

---

## Expected artifacts

- validation contract and result primitives
- first validated value implementation
- behavior/acceptance tests for boundary validation
- focused unit tests for domain validation rules
- minimal documentation updates where needed

---

## Sequencing note

This slice is intended to unlock later slices such as:

- validated repository configuration input
- validated endpoint declarations
- validated provider requests
- refusal behavior for unsafe or incomplete operations

If this slice is implemented cleanly, later slices should mostly add new validators and domain mappings rather than redesign the seam.

---

## Definition of done

This slice is done when the repo contains a narrow, test-proven validation seam and one production-grade example of raw input being admitted into the trusted core model only through structured validation.
