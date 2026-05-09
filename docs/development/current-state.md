# Current State

The fresh Multiverse repository has completed Phase 0 (Agentic Foundation) and has begun Phase 1 (Product Truth Reconstruction).

## Phase 0: Complete

- OpenClinXR-style workspace and validation scaffolding
- source, decision, scorecard, score-history, and agent-index schemas
- agent swarm charters and memory records for Multiverse-specific roles
- source ledger records for the old Multiverse attempt and OpenClinXR workflow reference
- Docusaurus documentation app with public evidence-gated posture surfaced first
- docs client-bundle smoke gate and frontend runtime verification ownership

## Phase 1: In Progress

The following artifacts have been ported from `src-multiverse-old-reference` and are pending swarm review in iteration-0001:

**Specification Documents** (`docs/spec/`):
- glossary
- product-spec
- worktree-identity
- resource-isolation
- endpoint-model
- provider-model
- repository-configuration
- safety-and-refusal
- cli-output-shapes

**Decision Records** (`decisions/` + `docs/decisions/`):
- decision-0001: agentic foundation first (accepted, iteration 0)
- decision-0002: git worktrees only in v1
- decision-0003: branch name is metadata, not identity
- decision-0004: main checkout uses reserved main identity
- decision-0005: resource isolation strategies for 1.0
- decision-0006: providers implement isolation contracts
- decision-0007: endpoints are declared communication objects
- decision-0008: repository configuration is explicit in 1.0
- decision-0009: unsafe operations are refused in 1.0
- decision-0010: core, provider, repository, and application boundaries are explicit

**First Iteration Brief** (`iterations/iteration-0001/00-brief.md`):
- Scope: accept and review the ported decisions and specs through the swarm workflow
- Status: brief created, swarm review pending

**Agent Tools Added**:
- `agent:compare` — compare two scorecard JSONs dimension by dimension
- `agent:risks` — scan all scorecards for open critical and high risks
- `agent:evidence` — scan all scorecards for open evidence debt

## Not Yet Implemented

- product packages
- CLI behavior
- provider contracts
- acceptance slices
- scenario documents
- release packaging

## Next Step

Run iteration-0001 through the swarm workflow: produce the core plan, adversarial counterplan, revision, and leadership review to formally accept the ported decisions and specs.
