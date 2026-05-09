# Multiverse Agent Swarm

This directory is the operating manual for the Multiverse agent swarm: a repo-native planning and review system that keeps local runtime isolation work grounded in explicit business truth.

The swarm has four layers:

1. **Coordinator Layer**: manages iterations, memory, source records, and score discipline.
2. **Core Design Team**: turns source-backed product truth into implementation-ready slices.
3. **Adversarial Challenge Team**: attacks ambiguity, provider boundary leaks, unsafe inference, and sequencing gaps.
4. **Leadership Layer**: approves, blocks, or sends plans back when release surface, scope, or validation is weak.

## Operating Rule

The swarm governs implementation. It does not replace executable acceptance tests or provider contracts, and it must not invent product truth that is absent from source records, decisions, specs, scenarios, or task briefs.

## Standard Workflow

1. Create an iteration brief in `iterations/iteration-XXXX/00-brief.md`.
2. Retrieve relevant memory from `agents/**/index.json` and `.agent-factory/memory-index.json`.
3. Produce `01-core-plan.md`.
4. Score the core plan in `02-core-scorecard.json`.
5. Produce `03-adversarial-counterplan.md` when the change affects behavior, boundaries, or release surface.
6. Score the counterplan in `04-adversarial-scorecard.json`.
7. Produce `05-core-revision.md`.
8. Run leadership review in `06-leadership-review.md`.
9. Produce `07-final-synthesis.md`.
10. Record durable memory changes in `08-memory-update-log.md`.

## Key Commands

```bash
pnpm agent:validate
pnpm agent:index
pnpm agent:sources
pnpm agent:score -- iterations/iteration-0001
pnpm agent:verify
```

## Quality Bar

A plan is not ready for implementation until it has:

- a weighted score of at least 4.4 out of 5
- no critical unresolved risks
- business truth alignment of at least 4.7
- architecture boundary integrity of at least 4.6
- refusal safety of at least 4.7
- provider contract stability of at least 4.5 when providers are touched
- leadership approval with no block from release governance

## Initial Swarm

Coordinator:

- Chief Coordinator
- Memory Archivist
- Source Librarian

Core:

- Product Truth Steward
- Architecture Boundary Lead
- Provider Contract Lead
- CLI Workflow Lead
- TDD Acceptance Lead
- Frontend Runtime Verification Lead

Adversarial:

- Ambiguity And Refusal Attacker
- Provider Boundary Attacker
- Implementation Plan Gap Attacker

Leadership:

- Release Governance Lead
