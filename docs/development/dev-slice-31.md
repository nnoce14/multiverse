# Dev Slice 31 — First 0.4.x Endpoint Provider Extensibility Proof

## Status

Draft

## ADR

ADR-0020: Explicit fixed-host plus derived-port endpoint provider

## Intent

Start the `0.4.x` line with the narrowest credible extensibility proof:
introduce one additional endpoint provider shape that still emits a URL-shaped
endpoint value through the existing endpoint contract.

This slice is meant to prove that the endpoint provider seam can grow without
changing the consumer workflow established in `0.3.x`.

## In scope

- add one derive-only endpoint provider named `fixed-host-port`
- support explicit repository declaration of that provider with:
  - `host`
  - `basePort`
- keep the derived endpoint value URL-shaped with:
  - fixed `http` scheme
  - configured host
  - worktree-derived port
- validate provider configuration for this declaration shape
- refuse invalid or unsafe provider configuration explicitly
- prove that existing endpoint consumer behavior remains unchanged:
  - canonical `MULTIVERSE_*` endpoint injection still works
  - endpoint `appEnv` string alias mapping still works
  - endpoint `appEnv` typed `url` and `port` mapping still works
- add one narrow acceptance proof for the new provider shape
- add focused contract coverage for deterministic endpoint derivation

## Out of scope

- changes to the endpoint provider contract
- redesign of `run`
- redesign of ADR 0018 or ADR 0019 semantics
- resource-provider changes
- optional endpoint capabilities such as `validate`, `reset`, or `cleanup`
- dynamic port reservation or live port-availability checks
- configurable scheme
- routing or reverse-proxy semantics
- plugin ecosystem behavior
- provider auto-discovery
- broader provider-authoring guidance

## Acceptance criteria

- a repository can declare an endpoint using provider `fixed-host-port`
- valid declarations derive a URL-shaped endpoint value in the form:
  - `http://{configured-host}:{derived-port}`
- derivation is deterministic for the same:
  - endpoint declaration
  - provider configuration
  - worktree identity
- different worktrees derive different endpoint URLs for the same declaration
  under the same provider configuration
- different endpoint names in the same worktree derive different endpoint URLs
  under the same provider configuration
- declaration loading or provider execution refuses when:
  - `host` is missing or empty
  - `basePort` is missing
  - `basePort` is not an integer
  - `basePort` is outside the valid TCP port range
  - worktree identity is absent during derivation
- `multiverse run` continues to support existing endpoint consumer behavior for
  the new provider without redesign:
  - canonical `MULTIVERSE_*` endpoint variable injection
  - alias-style endpoint `appEnv`
  - typed endpoint `appEnv` mapping for `url`
  - typed endpoint `appEnv` mapping for `port`

## Expected files

Likely implementation files:

- `apps/cli/src/...` for minimal provider registration and declaration wiring
- `packages/provider-contracts/src/index.ts` only if clarification is necessary;
  no contract redesign is intended
- `packages/provider-fixed-host-port/src/index.ts`
- `tests/contracts/endpoint-provider.derive.contract.test.ts`
- one new acceptance test under `tests/acceptance/`

Likely doc updates when the slice is implemented:

- `docs/development/roadmap.md`
- `docs/development/current-state.md`
- `README.md`

## Definition of done

- the new provider shape is proven through one narrow acceptance story
- endpoint contract coverage demonstrates deterministic derivation for the new
  shape
- no consumer-side redesign is introduced
- no provider auto-discovery or ecosystem behavior is introduced
- core/provider boundaries remain unchanged and explicit
