# Dev Slice 13 — Task 01

## Title

Implement the local port endpoint provider package

## Objective

Introduce `@multiverse/provider-local-port` as the first concrete production endpoint provider, prove it satisfies the endpoint provider contract, and add acceptance coverage for deterministic port-based address derivation.

## Sources of truth

Ground this task in:

- `docs/adr/0005-providers-implement-isolation-contracts.md`
- `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`
- `docs/spec/provider-model.md`
- `docs/spec/endpoint-model.md`
- `docs/spec/safety-and-refusal.md`
- `docs/development/dev-slice-13.md`
- `docs/development/dev-slice-13-scenario-map.md`

## Required outcome

Implement the minimum production change such that:

- `@multiverse/provider-local-port` exists as an explicit workspace package
- the provider exports `createLocalPortProvider(config: { basePort: number })`
- the provider derives a stable `http://localhost:{port}` address for a given worktree ID and base port
- port derivation is deterministic and requires no external state
- the provider refuses with `unsafe_scope` when worktree ID is absent
- endpoint provider contract tests exist and the provider satisfies them
- acceptance tests prove the above behaviors end-to-end

## In scope

- `packages/provider-local-port/` workspace package
- `createLocalPortProvider` factory function
- deterministic hash-based port derivation within `[basePort, basePort + 999]`
- `tests/contracts/endpoint-provider.derive.contract.test.ts`
- `tests/acceptance/dev-slice-13.acceptance.test.ts`
- workspace registration for the new package (root `package.json` devDependencies if needed)

## Out of scope

- resource providers
- endpoint provider `validate` capability
- port availability checks or conflict detection
- CLI changes
- core changes
- changes to existing tests

## Acceptance criteria

- the provider derives `http://localhost:{port}` for a valid worktree ID
- two distinct worktree IDs produce two distinct port addresses for the same base port
- the same worktree ID and base port always produce the same port
- missing worktree ID produces a refusal with category `unsafe_scope`
- all endpoint provider contract tests pass
- all existing 78 tests remain green

## Safety and boundary expectations

- the new package depends only on `@multiverse/provider-contracts` and Node.js built-ins
- core and CLI are not changed
- port derivation must not depend on runtime state, environment variables, or external systems
- refusal ownership stays in the provider; core is not modified
