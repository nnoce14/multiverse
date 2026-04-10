# Dev Slice 57 — 0.8.x Support Boundary Planning Baseline

## Purpose

This document records the planning audit and proposed slice sequence for the `0.8.x` support
boundary definition wave. It is the primary deliverable of Slice 57.

The proving question for `0.8.x` is:

**Can Multiverse's support boundaries be made explicit enough that a user can tell what the
tool officially supports for 1.0, without reading the source code?**

## Audit scope

Four seams were audited against existing source-of-truth documents (ADRs, specs, scenarios,
guides, provider packages):

1. Provider support classification — which providers are first-class vs experimental vs deferred
2. Official workflow — which developer workflow is the officially supported common case for 1.0
3. Consumer integration model — which integration patterns are officially supported for 1.0
4. Core/extension boundary — what belongs in core vs extensions, stated as a 1.0 boundary

## Seam 1: Provider support classification

### Current provider capability matrix

| Provider | Derive | Validate | Reset/Cleanup |
|---|---|---|---|
| `name-scoped` (resource) | ✓ | ✗ no-op | scope-confirm only (no side effects) |
| `path-scoped` (resource) | ✓ | ✓ path access check | effectful (creates/removes directories) |
| `local-port` (endpoint) | ✓ | ✗ no contract | ✗ no contract |
| `fixed-host-port` (endpoint) | ✓ | ✗ no contract | ✗ no contract |
| `process-scoped` (resource) | ✓ | ✗ no contract | effectful (terminates/relaunches process) |
| `process-port-scoped` (resource) | ✓ | ✗ no contract | effectful (terminates/relaunches process) |

### What is explicit in source-of-truth docs

- All six providers exist and are exercised in acceptance, contract, and integration tests.
- Provider authoring guide (`docs/guides/provider-authoring-guide.md`) covers derive, validate,
  reset, and cleanup as capability slots with examples.
- The scope-confirmation pattern for providers that own no mutable state is documented in
  `docs/spec/provider-model.md` (Slice 45).
- The `{PORT}` placeholder substitution in `process-port-scoped` is described in the provider
  authoring guide (added in Slice 45 for the built-in reference section).
- `path-scoped` validate behavior is fully documented: ADR-0015, `docs/spec/resource-isolation.md`,
  and the provider authoring guide (Slice 46).

### What is not explicit

- No source-of-truth document states which providers are **first-class for 1.0** vs
  **experimental** vs **deferred**.
- The six providers are described individually in ADRs and code, but no single document
  answers: "If you are using Multiverse in 1.0, which providers can you depend on?"
- The asymmetry in validate capability (path-scoped is the only resource provider with
  `validateResource` implemented) is not explained in classification terms.
- The asymmetry in endpoint lifecycle capability (endpoint providers have no validate/reset/cleanup
  contract) is not explained as intentional scope.

### Gap for Slice 58

Produce a source-of-truth classification document stating:
- which providers are officially first-class for 1.0
- which are experimental (supported with caveats)
- which are deferred (exist but not part of the 1.0 stability guarantee)
- what the validate/lifecycle capability gaps mean for each classification level

## Seam 2: Official developer workflow

### What is explicit in source-of-truth docs

- `docs/guides/external-demo-guide.md` documents the complete multi-worktree Node workflow
  end-to-end in seven steps:
  1. Declare resources and endpoints in `multiverse.json`
  2. Register providers in `providers.ts`
  3. Derive: `pnpm cli derive`
  4. Run application: `pnpm cli run -- node server.js`
  5. Two-worktree isolation (real `git worktree add` checkout proven in Slice 42)
  6. Inspect output formats (JSON and env)
  7. Reset and cleanup lifecycle
- The guide documents both repo-local (`pnpm cli`) and formal binary (`multiverse`) invocation
  paths explicitly.
- Auto-discovery of `--worktree-id` from git state is documented in the guide and proven in
  acceptance tests (Slice 37, Slice 42).

### What is not explicit

- The guide documents the workflow but does not state "this is the officially supported common
  case for 1.0."
- The guide does not distinguish which parts of the workflow are first-class vs experimental.
- No source-of-truth document explicitly states the "1.0 common-case workflow" as a bounded
  product promise.

### Gap for Slice 59

Produce a source-of-truth statement identifying:
- the officially supported common-case developer workflow for 1.0
- which steps and behaviors are part of the stability guarantee
- what remains experimental or deferred in the workflow (e.g., outside-workspace usage)

## Seam 3: Consumer integration model

### What is explicit in source-of-truth docs

- ADR-0018 (`explicit-app-native-env-mapping-for-run`) documents the `appEnv` mapping pattern:
  resources and endpoints can declare app-native env var names that `run` injects alongside
  canonical `MULTIVERSE_*` vars.
- ADR-0019 (`explicit-typed-endpoint-mapping`) documents typed endpoint mapping supporting
  both `url` and extracted `port` values.
- The composed sample application (`apps/sample-compose`) demonstrates an application-owned
  runtime-config boundary consuming `appEnv`-mapped values at one explicit boundary.
- The `derive --format=env` exclusion of `appEnv` values is explicitly classified as deferred
  in ADR-0018 and ADR-0019 (Slice 49).
- `docs/spec/provider-model.md` defines the lifecycle semantics side of the integration model.

### What is not explicit

- Neither ADR-0018 nor ADR-0019 states that the `appEnv` / runtime-config boundary pattern is
  **officially supported for 1.0** vs still experimental.
- No single source-of-truth document answers: "Is the application-owned runtime-config boundary
  pattern the officially supported 1.0 consumer model, or is it still exploratory?"
- The `run` stdout/stderr asymmetry for refusal output is documented in `docs/spec/cli-output-shapes.md`
  as intentional but classified as an open area in the spec's own terms.

### Gap for Slice 60

Produce a source-of-truth statement classifying:
- which consumer integration models are officially supported for 1.0 (`appEnv`, runtime-config
  boundary, canonical `MULTIVERSE_*` reads, or some subset)
- which patterns remain experimental or explicitly deferred
- whether the `run` refusal routing asymmetry is a 1.0 stability guarantee or an open area

## Seam 4: Core/extension boundary

### What is explicit in source-of-truth docs

- ADR-0005 (`providers-implement-isolation-contracts`) defines that providers implement
  isolation contracts; core enforces business rules.
- ADR-0009 (`core-provider-repository-and-application-boundaries`) defines the four explicit
  boundaries: core, provider, repository configuration, and application.
- ADR-0015 and ADR-0016 define specific provider capability contracts.
- `docs/spec/provider-model.md` defines the provider contract surface for 1.0.
- CLAUDE.md hard constraints list the enforcement rules.

### What is not explicit

- The boundary is distributed across five documents; no single doc gives a unified 1.0
  boundary statement that a user or potential contributor can read.
- There is no explicit statement of what a first-party provider contract guarantees vs what
  a third-party extension author can rely on.
- The stability of the `@multiverse/provider-contracts` package as the sole extension seam
  for 1.0 is not stated as a 1.0 support guarantee.

### Gap for Slice 61

Produce a source-of-truth boundary statement for 1.0 that:
- synthesizes the distributed boundary definitions into one readable location
- states what `@multiverse/provider-contracts` guarantees for extension authors
- identifies what is core-internal and not extension-stable
- states what is explicitly deferred for post-1.0 extensibility

## Summary of findings

| Seam | Evidence in source-of-truth | Gap |
|---|---|---|
| Provider classification | Capabilities proven; no classification by tier | Need: explicit first-class / experimental / deferred classification |
| Official workflow | Full workflow documented in guide | Need: explicit "1.0 officially supported" statement with scope bounds |
| Consumer integration model | `appEnv` and runtime-config boundary proven in code and ADRs | Need: explicit "officially supported for 1.0" vs "experimental" classification |
| Core/extension boundary | Boundary distributed across 5 docs | Need: single consolidated 1.0 boundary statement |

None of these gaps require new providers, new commands, or new implementation.
They require classification and consolidation of what is already proven.

## Proposed slice sequence

| Slice | Focus | Deliverable |
|---|---|---|
| 58 | Provider support classification | `docs/spec/provider-support-classification.md` — tier table, rationale, lifecycle-gap notes |
| 59 | Official workflow statement | Update to guide and/or new doc — bounded 1.0 workflow scope statement |
| 60 | Consumer integration model classification | Source-of-truth classification of `appEnv`, runtime-config boundary, and deferred patterns |
| 61 | Core/extension boundary consolidation | Single boundary statement synthesizing existing ADRs into a readable 1.0 reference |

Each slice should begin with a targeted pre-work audit and task doc before writing.
No slice in this sequence requires new implementation, new providers, or new commands.

## Explicit out-of-scope for this planning slice

The following are not part of Slice 57 and are not proposed for 0.8.x:

- new provider implementations
- new CLI commands or flags
- outside-workspace packaging and distribution
- provider ecosystem formalization
- any change to existing behavior
- any new spec or ADR that invents behavior not already proven

Slice 57 produces only planning artifacts. No production code changes. No test changes.
