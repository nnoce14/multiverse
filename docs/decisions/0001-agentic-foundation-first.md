---
sidebar_position: 2
---

# decision-0001: Establish agentic workflow before implementation slices

**Status:** Accepted  
**Iteration:** 0  
**Source:** swarm

## Context

The fresh Multiverse implementation needs to reuse lessons from OpenClinXR's agentic workflow while staying relevant to Multiverse's local runtime isolation domain.

## Decision

Build the agent swarm, source ledger, decision records, scorecards, memory index, and validation scripts before starting product implementation slices.

## Alternatives Considered

- Start by copying packages and tests from the old Multiverse attempt.
- Start by implementing the first CLI/core slice without agent workflow artifacts.
- Copy OpenClinXR's full agent roster unchanged.

## Rationale

The foundation makes business truth explicit before code and gives future agents persistent, domain-specific responsibilities for boundaries, refusal behavior, provider contracts, and release governance.

## Consequences

- Initial work produces governed planning artifacts instead of product behavior.
- Future implementation slices must be selected and reviewed through the swarm workflow.
- Historical Multiverse code can inform the fresh implementation only through explicit source-backed decisions and tasks.

## Reversal Trigger

If the validation workflow becomes busywork that fails to improve implementation quality, reduce the artifact set while preserving source-backed decisions and acceptance-driven implementation.
