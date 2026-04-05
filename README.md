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
* core business logic in `packages/core/`
* explicit provider contracts in `packages/provider-contracts/`
* test support in `packages/providers-testkit/`
* concrete providers for:

  * name-scoped resources
  * path-scoped resources
  * local-port endpoints
* acceptance, contract, unit, and integration tests

## Current behavior being proven

The current implementation proves the core loop for explicit declarations and deterministic derivation.

That includes:

* worktree identity resolution
* explicit repository configuration
* validation and refusal behavior
* derived isolation for:

  * name-scoped resources
  * path-scoped resources
  * local-port endpoints
* multi-resource and multi-endpoint support
* lifecycle support:

  * name-scoped reset/cleanup as scope confirmation only
  * path-scoped reset/cleanup as effectful operations for provider-managed filesystem state
* `derive --format=env` for shell-sourceable KEY=VALUE output
* sample Express application end-to-end integration proof

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

### Packages

* `packages/core/` — business rules, orchestration, validation, refusal
* `packages/provider-contracts/` — shared contracts between core and providers
* `packages/providers-testkit/` — test-oriented providers and fixtures
* `packages/provider-name-scoped/` — name-scoped resource provider
* `packages/provider-path-scoped/` — path-scoped resource provider
* `packages/provider-local-port/` — local-port endpoint provider

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
pnpm cli
```

## CLI usage

```bash
# Derive isolated values as JSON (explicit paths)
multiverse derive --config multiverse.json --providers providers.ts --worktree-id <id>

# Derive as shell-sourceable KEY=VALUE pairs
multiverse derive --config multiverse.json --providers providers.ts --worktree-id <id> --format=env

# Run a command with derived values injected as env vars
multiverse run --worktree-id <id> -- node server.js

# Validate derived values against running resources
multiverse validate --worktree-id <id> -- ...

# Reset or clean up isolated state
multiverse reset --worktree-id <id>
multiverse cleanup --worktree-id <id>
```

`--config` defaults to `./multiverse.json` and `--providers` defaults to `./providers.ts` when not specified. `--worktree-id` is always required.

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
* `docs/development/implementation-strategy.md`
* `docs/development/testing-strategy.md`

Core product and architecture docs:

* `docs/spec/product-spec.md`
* `docs/spec/resource-isolation.md`
* `docs/spec/provider-model.md`
* `docs/spec/endpoint-model.md`
* `docs/spec/safety-and-refusal.md`
* `docs/adr/0001-git-worktrees-only-1.0.md`
* `docs/adr/0004-resource-isolation-strategies.md`
* `docs/adr/0005-providers-implement-isolation-contracts.md`
* `docs/adr/0008-unsafe-operations-are-refused-in-1-0.md`
* `docs/adr/0009-core-provider-repository-and-application-boundaries-are-explicit.md`

## Notes on maturity

This project is still in active implementation.

The architecture and behavioral boundaries are established, but the repository is still proving the model against more realistic development workflows and integration targets.
