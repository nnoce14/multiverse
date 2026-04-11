# Multiverse

**Multiverse** is a local runtime isolation tool for parallel development across multiple git worktrees of the same repository on one machine.

It is being developed behavior-first: the repository defines business rules, scenarios, and architecture explicitly, then implements them through small acceptance-driven slices.

## What problem this solves

When multiple worktrees of the same repository run locally at the same time, they can collide through shared mutable resources or misrouted local endpoints.

Multiverse aims to prevent that by making local isolation:

* deterministic
* explicit
* inspectable
* safe by default

The tool is intended to support both human developers and coding agents.

## Current scope

Multiverse currently focuses on one repository on one machine with multiple git worktrees.

Its core responsibility is **local isolation**. It is not intended to be:

* a package manager
* a deployment tool
* a generic process orchestrator
* an agent-specific framework

## Current implementation status

The repository has moved from design into implementation.

Today’s repo includes:

* a thin CLI application in `apps/cli/`
* a sample Express application in `apps/sample-express/`
* a composed proving application in `apps/sample-compose/`
* core business logic in `packages/core/`
* explicit provider contracts in `packages/provider-contracts/`
* test support in `packages/providers-testkit/`
* concrete providers for:

  * name-scoped resources
  * path-scoped resources
  * local-port endpoints
  * fixed-host-port endpoints
  * process-scoped resources
  * process-port-scoped resources
* acceptance, contract, unit, and integration tests

## Current behavior being proven

The current implementation proves the core loop for explicit declarations and deterministic derivation, the composed application consumer workflow, and a complete provider extensibility story. The `0.6.x` semantic stability wave (Slices 44–49) is complete. The `0.7.x` public-surface stability wave (Slices 50–56) is complete: CLI surface, help text, output shapes, and guide consistency. The `0.8.x` support boundary definition wave (Slices 57–61) is complete: provider support tiers, the official common-case workflow, the consumer integration model, and the core/extension boundary are all now explicit in source-of-truth specs. `0.9.0-alpha.1` enters the release-candidate hardening phase.

1.0 remains intentionally narrow; outside-workspace packaging and distribution remain deferred.

That includes:

* worktree identity resolution
* explicit repository configuration
* validation and refusal behavior
* derived isolation for:

  * name-scoped resources
  * path-scoped resources
  * local-port endpoints
  * fixed-host-port endpoints
  * process-scoped resources
  * process-port-scoped resources
* multi-resource and multi-endpoint support
* lifecycle support:

  * name-scoped reset/cleanup as scope confirmation only
  * path-scoped reset/cleanup as effectful operations for provider-managed filesystem state
  * process-scoped and process-port-scoped reset/cleanup for declared child-process lifecycle
* `derive --format=env` for shell-sourceable KEY=VALUE output
* sample Express application end-to-end integration proof
* app-native env alias injection during `run`
* typed endpoint app-native env injection for `url` and `port`
* a composed `sample-compose` proof for mixed-provider consumption in one app
* an application-owned runtime-config boundary for the composed sample app

## Design principles

Multiverse is intentionally strict about boundaries.

* repository configuration is explicit
* providers are explicit
* refusal is a first-class behavior
* core coordinates behavior and safety
* providers implement technology-specific isolation through contracts
* ambiguity is refused rather than guessed

This keeps the tool predictable and avoids hidden behavior around consequential operations.

## Repository layout

### Applications

* `apps/cli/` — thin command-line entrypoint
* `apps/sample-express/` — sample application used for end-to-end integration proof
* `apps/sample-compose/` — composed proving app for the common-case consumer workflow

### Packages

* `packages/core/` — business rules, orchestration, validation, refusal
* `packages/provider-contracts/` — shared contracts between core and providers
* `packages/providers-testkit/` — test-oriented providers and fixtures
* `packages/provider-name-scoped/` — name-scoped resource provider
* `packages/provider-path-scoped/` — path-scoped resource provider
* `packages/provider-local-port/` — local-port endpoint provider
* `packages/provider-fixed-host-port/` — fixed-host plus derived-port endpoint provider
* `packages/provider-process-scoped/` — process-backed resource provider
* `packages/provider-process-port-scoped/` — process-backed resource-with-address provider

### Tests

* `tests/acceptance/`
* `tests/contracts/`
* `tests/unit/`
* `tests/integration/`

### Documentation

* `docs/spec/` — specifications
* `docs/scenarios/` — behavior-oriented source material for acceptance tests
* `docs/adr/` — accepted architectural decisions
* `docs/development/` — implementation guidance and slice/task planning

## Common commands

From the repository root:

```bash
pnpm test
pnpm test:acceptance
pnpm test:contracts
pnpm test:unit
pnpm typecheck
pnpm cli --help
```

## CLI usage

At the current stage, the CLI is typically invoked from the repository root through the workspace script:

```bash
pnpm cli --help
```

Examples:

```bash
# Derive isolated values as JSON
pnpm cli derive --worktree-id <id>

# Derive as shell-sourceable KEY=VALUE pairs
pnpm cli derive --worktree-id <id> --format env

# Run a command with derived values injected as env vars
pnpm cli run --worktree-id <id> -- node server.js

# Validate derived values against declared configuration
pnpm cli validate --worktree-id <id>

# Reset or clean up isolated state
pnpm cli reset --worktree-id <id>
pnpm cli cleanup --worktree-id <id>
```

`--config` defaults to `./multiverse.json` and `--providers` defaults to `./providers.ts` when not specified. `--worktree-id` is optional when invoked from inside a git worktree — Multiverse discovers the identity from the worktree path automatically. Pass `--worktree-id` explicitly to override or when git state is unavailable.

`run` injects both canonical `MULTIVERSE_*` transport vars and explicit app-native values declared with `appEnv`. For endpoints, that includes typed mapping for `url` and `port`. The preferred application pattern is to read those app-owned names at one runtime-config boundary rather than scatter direct `MULTIVERSE_*` reads through the app.

## Source-of-truth order

When implementation questions arise, precedence is:

1. `docs/adr/`
2. `docs/spec/`
3. `docs/scenarios/`
4. `docs/development/`

Business truth should come from those documents, not be invented in code.

## Key docs

Start here:

* `AGENTS.md`
* `docs/guides/external-demo-guide.md` — practical usage guide: multiverse run, parallel worktrees, reset/cleanup
* `docs/development/repo-map.md`
* `docs/development/current-state.md`
* `docs/development/roadmap.md`
* `docs/development/implementation-strategy.md`
* `docs/development/testing-strategy.md`

Core product and architecture docs:

* `docs/spec/product-spec.md`
* `docs/spec/resource-isolation.md`
* `docs/spec/provider-model.md`
* `docs/spec/endpoint-model.md`
* `docs/spec/safety-and-refusal.md`
* `docs/spec/cli-output-shapes.md` — stable output contract for all primary commands (JSON shapes, field names, output routing)
* `docs/spec/provider-support-classification.md` — which first-party providers are first-class vs supported-with-constraints for 1.0
* `docs/spec/supported-workflow.md` — the officially supported 1.0 common-case developer workflow and what is deferred
* `docs/spec/consumer-integration-model.md` — which consumer integration patterns are officially supported for 1.0 and what is deferred
* `docs/spec/core-extension-boundary.md` — the 1.0 core/extension boundary: what core owns, the stable `@multiverse/provider-contracts` extension seam, first-party vs custom provider distinction, and what is deferred
* `docs/adr/0001-git-worktrees-only-1.0.md`
* `docs/adr/0004-resource-isolation-strategies.md`
* `docs/adr/0005-providers-implement-isolation-contracts.md`
* `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
* `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`

## Notes on maturity

This project is still in active implementation.

The architecture and behavioral boundaries are established, but the repository is still proving the model against more realistic development workflows and integration targets.
