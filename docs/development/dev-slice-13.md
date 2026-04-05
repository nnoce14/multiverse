# Dev Slice 13 — First Concrete Endpoint Provider: Local Port Derivation

## Status

Implemented on `main`

## Intent

Introduce the first concrete production endpoint provider as an explicit workspace package.

This slice proves the provider model is real beyond the testkit by delivering a local port endpoint provider that derives a stable, unique `http://localhost:{port}` address for each worktree instance.

The provider is purely computational — no external dependencies, no infrastructure required for derivation.

## Why this slice after the CLI slices

The core model, provider contracts, and CLI surface are all proven and implemented.

The critical gap is that no concrete production providers exist. The tool cannot be used until at least one real provider is available.

A local port endpoint provider is the right first concrete provider because:

- port conflicts are the most immediately visible pain point when running parallel worktrees
- it requires only the `EndpointProvider` contract (derive only, no lifecycle capabilities)
- it has no external dependencies — it is pure deterministic computation
- it sets the package and contract pattern for all subsequent providers

## Slice objective

Implement the local port endpoint provider such that:

1. a concrete `@multiverse/provider-local-port` workspace package exists
2. the provider derives a stable, unique local HTTP address for each worktree instance
3. the derived address uses `http://localhost:{port}` format
4. port derivation is deterministic for a given worktree ID and base port configuration
5. the provider refuses with `unsafe_scope` when worktree identity cannot be determined
6. endpoint provider contract tests exist and the new provider satisfies them
7. acceptance coverage proves end-to-end derive behavior with real port addresses

## Scope

This slice includes:

- a new `packages/provider-local-port` workspace package
- a `createLocalPortProvider(config: { basePort: number })` factory export
- deterministic port derivation from worktree ID and base port
- refusal with `unsafe_scope` when worktree ID is absent
- endpoint provider contract tests in `tests/contracts/`
- acceptance tests for the happy path and refusal path using the new provider
- workspace registration for the new package

## Out of scope

- resource providers of any kind
- endpoint provider `validate` capability
- port conflict detection or runtime port availability checks
- provider discovery or registry inference
- CLI changes beyond preserving existing behavior
- changes to core business rules
- speculative configuration beyond `basePort`

## Architectural stance

The local port provider is a concrete provider package.

It depends on `@multiverse/provider-contracts` only.

Core and CLI are not changed.

Deterministic port derivation must not depend on runtime state, process environment, or external configuration beyond the declared `basePort`.

## Port derivation rule

A port is derived from the worktree ID by:

1. hashing the worktree ID with a stable, deterministic algorithm
2. mapping the hash to an offset in the range `[0, 999]`
3. computing the final port as `basePort + offset`

The result must be the same for the same worktree ID and base port across any number of invocations.

## Acceptance criteria

- a valid worktree instance and a configured base port derive a stable `http://localhost:{port}` address
- two distinct worktree IDs derive two distinct port addresses for the same base port configuration
- the same worktree ID and base port always derive the same port address
- missing worktree ID is refused as `unsafe_scope`
- the provider satisfies all endpoint provider contract tests
- existing tests remain green

## Expected artifacts

- `packages/provider-local-port/package.json`
- `packages/provider-local-port/index.ts`
- `packages/provider-local-port/src/index.ts`
- `tests/contracts/endpoint-provider.derive.contract.test.ts`
- `tests/acceptance/dev-slice-13.acceptance.test.ts`

## Definition of done

This slice is done when `@multiverse/provider-local-port` exists as an explicit workspace package, satisfies the endpoint provider contract tests, and the acceptance tests prove deterministic port-based address derivation and correct refusal behavior.
