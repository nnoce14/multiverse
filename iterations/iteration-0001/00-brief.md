# Iteration Brief: iteration-0001

**Coordinator:** Chief Coordinator  
**Date:** 2026-05-09  
**Phase:** Phase 1 — Product Truth Reconstruction

## Objective

Reconstruct the core product decisions, specifications, and scenarios from the original Multiverse attempt as governed artifacts in the fresh repository.

This iteration covers the first pass of Phase 1 work: establishing the business truth foundation that implementation slices will depend on before any product packages or CLI behavior is written.

## Scope

### In Scope

1. Accept the nine core product decisions (decision-0002 through decision-0010) sourced from `src-multiverse-old-reference`.
2. Review and accept the ported specification documents under `docs/spec/`:
   - glossary
   - product-spec
   - worktree-identity
   - resource-isolation
   - endpoint-model
   - provider-model
   - repository-configuration
   - safety-and-refusal
   - cli-output-shapes
3. Confirm that the ported specs are still business truth for the fresh implementation (nothing from the old attempt that contradicts the hard constraints in AGENTS.md).
4. Identify any spec gaps where the old documents refer to content not yet ported (open areas, cross-references).

### Out of Scope

- Implementation of any product package or CLI behavior.
- Scenario documents (these come in a subsequent iteration).
- Provider support classification (requires provider contract decisions to be accepted first).
- Configuration file syntax and serialization format (these are implementation concerns addressed after specs are accepted).

## Source Records

- `src-multiverse-old-reference` — the original Multiverse attempt at `../multiverse-old`

## Hard Constraints (from AGENTS.md)

All accepted decisions must comply with the 1.0 hard constraints:

- no provider inference
- no managed object inference
- repository configuration is declarative only
- refusal is a first-class behavior
- refuse rather than guess when safe scope is ambiguous
- core and provider responsibilities must remain separate

## Acceptance Criteria

1. All nine product decisions have accepted JSON records in `decisions/`.
2. All spec documents in `docs/spec/` are accepted as current business truth with any needed modifications noted.
3. Spec cross-references to "open areas" are cataloged as decision debt or deferred scope items.
4. The swarm has reviewed and scored the plan with weighted score >= 4.4.
5. No critical unresolved risks from the adversarial review remain open.

## Prior Art

This iteration is sourcing from `src-multiverse-old-reference` which represents a mature implementation (0.8.0-alpha.1) with 21 accepted ADRs, 13 spec documents, and 7 scenario documents. The swarm should evaluate each artifact on its own merits rather than accepting it wholesale because it existed in the old attempt.

Pay particular attention to:
- Any old ADR that references features planned but not yet needed (e.g., endpoint model typing, provider support classification)
- Any spec that references implementation-specific details that should stay out of the business layer
- Any decision that may conflict with the fresh repo's hard constraints or boundary rules

## Deliverables

1. `01-core-plan.md` — core team evaluation of which decisions and specs to accept, modify, or defer
2. `02-core-scorecard.json` — rubric score for the core plan
3. `03-adversarial-counterplan.md` — adversarial challenges to the acceptance decisions
4. `04-adversarial-scorecard.json` — rubric score for the adversarial counterplan
5. `05-core-revision.md` — core team revision responding to adversarial challenges
6. `06-leadership-review.md` — release governance review
7. `07-final-synthesis.md` — accepted decisions, modified specs, deferred items
8. `08-memory-update-log.md` — durable memory changes for agent indexes
