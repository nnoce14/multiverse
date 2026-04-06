# Dev Slice 26 — Mixed-Provider Composition Proving App

## Status

Done

## Motivation

The current highest-priority proving question (per `current-state.md`) is:

> Can one richer application consume multiple Multiverse-managed resources and endpoints at once,
> using mixed provider types, without the model becoming awkward or inconsistent?

The existing `sample-express` app proves: path-scoped resource + local-port endpoint.
The existing multi-resource integration test proves: path-scoped + name-scoped resources + two local-port endpoints, but no process-backed resources and no running application.
The existing process-scoped integration test proves: process lifecycle in isolation, with no other provider types present.

**What is not yet proven:**

- A running application that consumes a process-port-scoped resource and a path-scoped resource and a local-port endpoint simultaneously
- Mixed reset/cleanup behavior when a composed app has both static and process-backed resources
- A sidecar process (managed by Multiverse) that the application communicates with at runtime via the `localhost:{port}` handle
- Worktree isolation holding correctly across all three seams at once

This slice builds a new proving application (`apps/sample-compose`) to close all of these gaps in one coherent composition story.

## App shape

**`apps/sample-compose`** — a minimal Node.js/Express HTTP service with three Multiverse-managed seams:

| Seam | Provider | Handle | Purpose |
|------|----------|--------|---------|
| `app-db` resource | `path-scoped` | absolute path to a SQLite file | durable per-worktree data store; reset clears it, cleanup removes it |
| `cache-sidecar` resource | `process-port-scoped` | `localhost:{port}` | in-memory key-value sidecar process; reset restarts with empty state, cleanup stops it |
| `http` endpoint | `local-port` | port number | the application's own HTTP listener |

The application reads all three values from environment variables set by Multiverse:

```
MULTIVERSE_RESOURCE_APP_DB=/tmp/.../app-db/wt-foo/
MULTIVERSE_RESOURCE_CACHE_SIDECAR=localhost:6042
MULTIVERSE_ENDPOINT_HTTP=5600
```

The sidecar (`apps/sample-compose/src/sidecar.ts`) is a lightweight Node.js HTTP server that holds an in-memory key-value store. It receives its port via `{PORT}` token substitution from the process-port-scoped provider. The application communicates with it over HTTP.

**Application routes:**

- `GET /health` — returns `{ ok: true, dbPath, cacheAddr, port }`
- `GET /items` — reads from SQLite
- `POST /items` — writes to SQLite
- `GET /cache/:key` — reads from the cache sidecar via HTTP
- `POST /cache/:key` — writes to the cache sidecar via HTTP

## Providers in scope

All four providers used in this slice already exist. No new providers are required.

- `@multiverse/provider-path-scoped` — manages `app-db`
- `@multiverse/provider-process-port-scoped` — manages `cache-sidecar`; command: `tsx apps/sample-compose/src/sidecar.ts --port {PORT}`
- `@multiverse/provider-local-port` — manages the `http` endpoint

The `providers.ts` for the app will configure all three.

## Behavior being proven that is not already proven

1. **Three-seam derivation**: `deriveOne` returns a path handle, a `localhost:{port}` handle, and a port number in one call — all for the same worktree.

2. **Mixed reset**: `resetOneResource` with both `app-db` (path-scoped, `scopedReset: true`) and `cache-sidecar` (process-port-scoped, `scopedReset: true`) resets both seams in one operation — clearing the SQLite file and restarting the sidecar with empty state.

3. **Mixed cleanup**: `cleanupOneResource` stops the sidecar process and removes the `app-db` directory in one operation.

4. **Cross-seam isolation**: Two concurrent worktrees each have their own SQLite path, their own sidecar process on a distinct port, and their own HTTP listener port. None of the three seams overlap.

5. **Runtime consumption**: A running application accepts all three values as environment variables and uses them concurrently. The path-scoped handle is used for SQLite; the process-port-scoped handle is used to make HTTP calls to the sidecar; the local-port endpoint is used to listen.

6. **Sidecar reset semantics**: After a reset, the sidecar process is replaced with a fresh one. Items written to the cache before reset are gone. Items in SQLite (also reset) are also gone. Both seams reset together cleanly.

## Test coverage to add

### Integration test: `tests/integration/sample-compose.integration.test.ts`

This is the primary proving artifact for this slice. It exercises the full composition story:

1. **Derivation produces three distinct values per worktree** — path handle, cache address, HTTP port all non-null and well-formed.
2. **Two worktrees get distinct values on all three seams** — no handle collision across worktrees.
3. **Reset starts the sidecar** — after reset, the cache sidecar is reachable at `localhost:{port}`.
4. **App starts and reads all three env vars** — health endpoint confirms correct dbPath, cacheAddr, and port.
5. **App writes and reads from SQLite** — proves the path-scoped seam is live.
6. **App writes and reads from the cache sidecar** — proves the process-port-scoped seam is live.
7. **Mixed reset clears both seams** — items in SQLite and cache are gone after reset; both seams restart fresh.
8. **Two worktrees remain isolated after concurrent operations** — worktree A's state does not appear in worktree B's seams.
9. **Cleanup stops the sidecar and removes the db path** — both resources are cleaned up by a single `cleanupOneResource` call.
10. **Idempotent cleanup** — a second cleanup call does not throw.

### No new acceptance or contract tests

The provider-level behavior is already covered. This slice adds integration coverage at the application composition layer, not additional provider-level coverage.

## Files in scope

```
apps/sample-compose/
  multiverse.json          — declares app-db, cache-sidecar, http
  providers.ts             — configures path-scoped, process-port-scoped, local-port
  src/
    app.ts                 — Express app; accepts AppConfig { dbPath, cacheAddr, port }
    sidecar.ts             — in-memory HTTP key-value store; reads port from --port arg
    index.ts               — optional CLI entry (not required for proving)

tests/integration/
  sample-compose.integration.test.ts   — the primary proving artifact

docs/development/
  dev-slice-26.md          — this document
```

## Explicitly out of scope

- No new providers
- No new core behavior or changes to `@multiverse/core`
- No CLI surface changes
- No new ADRs (all behavior is already designed)
- No changes to `sample-express` or its tests
- No formal compilation or packaging of the sidecar binary (the proving workflow uses tsx)
- No Docker, redis, postgres, or external dependencies — the sidecar is a self-contained Node.js script
- No new acceptance tests (existing provider acceptance coverage is sufficient)
- No guide or README updates (can follow if the proving test passes cleanly)

## Acceptance criteria

- `tests/integration/sample-compose.integration.test.ts` passes with all 10 tests green
- `pnpm test:integration` remains green (no regressions)
- `pnpm typecheck` passes
- All 210 existing tests continue to pass
- Two concurrent worktrees can be run through the full lifecycle (reset → write → verify → reset → verify empty → cleanup) without interference
