# Dev Slice 61 Task 01 — Core/Extension Boundary Consolidation

## Slice

Slice 61 — Core/Extension Boundary Consolidation

## Purpose

Consolidate the distributed core/extension boundary definitions into a single readable
1.0 boundary statement.

The Slice 57 planning audit found that the boundary is stated truthfully but is scattered
across five documents (ADR-0005, ADR-0009, `provider-model.md`, CLAUDE.md,
`provider-authoring-guide.md`). No single source-of-truth document answers:

- What is core and what are its responsibilities?
- What is `@multiverse/provider-contracts` and why is it the extension seam?
- What do first-party providers guarantee vs what can a custom provider do?
- What is explicitly deferred for post-1.0 extensibility?

## Slice scope

**Docs-only.** No production code changes. No test changes.

## Files to change

### New files

- `docs/development/tasks/dev-slice-61-task-01.md` — this document
- `docs/spec/core-extension-boundary.md` — the primary deliverable: a consolidated
  1.0 boundary statement synthesizing existing ADRs/specs into one readable reference

### Modified files

- `docs/development/current-state.md` — add Slice 61 proving result
- `docs/development/roadmap.md` — mark core/extension boundary item complete
- `README.md` — add pointer to `core-extension-boundary.md` in Key docs section
- `docs/spec/provider-model.md` — add cross-reference to new boundary doc

## Acceptance criteria

- `docs/spec/core-extension-boundary.md` exists and:
  - states core responsibilities for 1.0 (what core owns, what it does not)
  - names `@multiverse/provider-contracts` as the stable extension seam
  - states what first-party providers guarantee (6 providers, workspace-local, classified in
    `provider-support-classification.md`)
  - states what custom/extension providers can do (implement any isolation strategy the
    contract supports) and what they cannot do (access core internals, implement business rules)
  - states what is deferred (packaging/distribution, ecosystem, community extensions)
  - includes a relationship table linking to governing ADRs and existing specs
- `current-state.md` records Slice 61 in the proving-results section
- `roadmap.md` marks the core/extension boundary item complete in Immediate direction
- `README.md` Key docs section includes a pointer to the new spec

## Explicit out-of-scope

- No new ADRs
- No changes to provider contracts or provider implementations
- No changes to runtime behavior
- No changes to test files
- No redesign of provider contracts
- Do not reopen Portless or optional integrations
- Do not address packaging/distribution (state it as deferred only)
- Do not invent a richer taxonomy than the existing four-layer ADR-0009 model

## Source-of-truth grounding

The boundary statement must be derived only from:

1. ADR-0005 — providers implement isolation contracts
2. ADR-0007 — repository configuration is explicit
3. ADR-0008 — unsafe operations are refused
4. ADR-0009 — the four explicit responsibility layers
5. `docs/spec/provider-model.md` — provider capabilities and boundary
6. `docs/guides/provider-authoring-guide.md` — extension seam and constraint rules
7. `docs/spec/provider-support-classification.md` — first-party provider tiers
8. Slice 32 / 35 proving results — custom provider seam is proven end-to-end

## Safety/refusal expectations

No refusal behavior changes. This is docs-only.
