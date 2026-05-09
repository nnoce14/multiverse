# Roadmap

## Phase 0: Agentic Foundation — Complete

- Establish the Multiverse-specific agent swarm (charters, memory, schemas, validation scripts)
- Validate source, decision, scorecard, and memory artifacts
- Capture historical Multiverse and OpenClinXR workflow references as source records
- Deploy the Docusaurus documentation site with bundle smoke gate

## Phase 1: Product Truth Reconstruction — In Progress

**Iteration 0001: Decision and Spec Acceptance**

- Port the core product decisions from `src-multiverse-old-reference` as accepted JSON records
- Port the specification documents (glossary, product-spec, worktree-identity, resource-isolation, endpoint-model, provider-model, repository-configuration, safety-and-refusal, cli-output-shapes)
- Run the swarm review workflow (core plan → adversarial → revision → leadership)
- Resolve any conflicts between ported specs and the hard constraints in AGENTS.md

**Iteration 0002: Scenario Reconstruction**

- Port and validate scenario documents from `src-multiverse-old-reference`
- Confirm scenarios are still consistent with accepted decisions
- Identify any scenario gaps that indicate missing spec coverage

**Iteration 0003: First Implementation Slice Selection**

- Select the first governed implementation slice through the swarm
- Define acceptance criteria before any product code is written
- Produce acceptance test stubs for the selected slice

## Phase 2: Fresh Implementation Slices

- Add packages and apps only when a slice requires them
- Drive behavior from acceptance and contract tests
- Preserve explicit provider boundaries and refusal-first safety
- Start with the core worktree identity model, then add the first provider contract

## Phase 3: Public Surface Stabilization

- Govern CLI output, command names, provider extension seams, and docs as release surface
- Require leadership review for public API or CLI compatibility changes
- Publish the first alpha release when the primary commands are acceptance-covered
