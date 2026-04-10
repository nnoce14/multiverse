# Consumer Integration Model for 1.0

## Purpose

This document states which consumer integration patterns are officially supported for 1.0,
what is preferred for the common case, and what is explicitly deferred.

"Consumer integration" refers to how an application reads and uses the runtime values that
Multiverse derives and injects — isolated resource handles, endpoint addresses, and the
worktree identity.

## How `run` makes derived values available

`multiverse run` is the boundary between Multiverse isolation and the consuming application.
When `run` starts the child process, it extends the child's environment with derived values.
The child process — and the application it contains — reads those values as ordinary
environment variables.

If derivation or validation fails before the child is started, `run` writes a JSON refusal
to **stderr** and exits 1 without starting the child. This is intentional and stable: `run`
passes the child's stdout through unchanged, so writing refusal to stderr preserves the
stdout contract for downstream consumers. This routing is documented in
`docs/spec/cli-output-shapes.md` and is a stable 1.0 behavior.

---

## Supported integration patterns

Three integration patterns are supported for 1.0. They differ in how the application reads
derived values. All three involve `run`; none require the application to call Multiverse
APIs directly.

### Pattern 1: Canonical transport variables (supported)

`run` always injects:

- `MULTIVERSE_WORKTREE_ID` — the resolved worktree identity
- `MULTIVERSE_RESOURCE_<NAME>` — the derived handle for each declared resource
- `MULTIVERSE_ENDPOINT_<NAME>` — the derived address for each declared endpoint

Where `<NAME>` is the declared name uppercased with hyphens replaced by underscores.

The application reads these variables directly:

```javascript
const dbPath = process.env.MULTIVERSE_RESOURCE_APP_DB;
const httpAddr = process.env.MULTIVERSE_ENDPOINT_HTTP;
```

**When to use this pattern:** For simple applications consuming one or two Multiverse-managed
seams, or when the application code is already organized to read Multiverse-specific names
at one location.

**Limitation:** In composed applications with several managed seams, direct reads of
`MULTIVERSE_*` names scattered through application code create a dependency on
Multiverse-specific naming throughout the codebase. The runtime-config boundary pattern
below is preferred in that case.

No declaration changes are needed beyond the basic `multiverse.json`. The canonical
variables are always present.

---

### Pattern 2: `appEnv` alias mapping (supported, ADR-0018 / ADR-0019)

An optional `appEnv` field on each resource or endpoint declaration causes `run` to inject
an additional app-native environment variable alongside the canonical `MULTIVERSE_*`
variable.

**Resource declarations** use a single string alias:

```json
{
  "name": "app-db",
  "provider": "path-scoped",
  "isolationStrategy": "path-scoped",
  "scopedReset": true,
  "scopedCleanup": true,
  "appEnv": "DATABASE_PATH"
}
```

`run` injects both `MULTIVERSE_RESOURCE_APP_DB` (the canonical variable) and `DATABASE_PATH`
(the app-native alias), both with the same derived handle value.

**Endpoint declarations** support two forms:

*String alias* — injects the full derived address under the alias name:

```json
{
  "name": "http",
  "role": "application-http",
  "provider": "local-port",
  "appEnv": "APP_HTTP_URL"
}
```

*Typed mapping* — explicitly extracts `url` (full address string) and/or `port` (numeric
port as a string) into named variables:

```json
{
  "name": "http",
  "role": "application-http",
  "provider": "local-port",
  "appEnv": {
    "PORT": "port",
    "APP_HTTP_URL": "url"
  }
}
```

`run` injects `MULTIVERSE_ENDPOINT_HTTP` (canonical), `PORT` (the numeric port string), and
`APP_HTTP_URL` (the full URL string). The typed extraction eliminates the need for the
application to parse the URL to extract a port number.

**Conflict detection:** If any mapped app-native name already exists in the parent
environment at the time `run` is invoked, `run` refuses to start the child. Multiverse does
not silently override parent environment variables.

**Scope:** `appEnv` applies only to `run`. `derive --format=env` outputs only canonical
`MULTIVERSE_*` variables and does not include `appEnv` aliases. This exclusion is intentional
and documented in ADR-0018.

---

### Pattern 3: Application-owned runtime-config boundary (recommended for composed apps)

When `appEnv` mapping is declared for all managed seams, the application can read all
Multiverse-derived values at one explicit location — a dedicated runtime-config function or
module — using only app-owned variable names:

```typescript
// runtime-config.ts — application-owned boundary
export function readRuntimeConfigFromEnv(env = process.env): AppConfig {
  const dbPath = env["DATABASE_PATH"];
  if (!dbPath) throw new Error("DATABASE_PATH is required");

  const cacheAddr = env["CACHE_ADDR"];
  if (!cacheAddr) throw new Error("CACHE_ADDR is required");

  const port = env["PORT"];
  if (!port) throw new Error("PORT is required");

  return { dbPath, cacheAddr, port: parseInt(port, 10) };
}
```

The rest of the application reads `AppConfig` fields (`dbPath`, `cacheAddr`, `port`) and
never reads `MULTIVERSE_*` names directly. The `apps/sample-compose/` proving application
demonstrates this pattern across three managed seams: a path-scoped resource (`DATABASE_PATH`),
a process-port-scoped resource (`CACHE_ADDR`), and a local-port endpoint (`PORT`).

**When to use this pattern:** For applications consuming multiple Multiverse-managed seams,
or any application that should remain free of Multiverse-specific names in its business
logic. This is the recommended pattern for 1.0 composed application workflows.

**Prerequisite:** `appEnv` must be declared in `multiverse.json` for each seam the
application needs to access by app-owned name.

---

## Classification summary

| Pattern | Support level | When to use |
|---|---|---|
| Canonical `MULTIVERSE_*` reads | Supported | Simple apps; single seam; already using Multiverse names at one location |
| `appEnv` alias mapping (resources) | Supported | When a single app-native name is needed for a resource handle |
| `appEnv` typed endpoint mapping (`url`, `port`) | Supported | When the app needs a URL string or numeric port without parsing |
| Application-owned runtime-config boundary | Recommended for composed apps | Multiple seams; keeping Multiverse names out of application business logic |

---

## What is deferred for 1.0

The following are not part of the 1.0 consumer integration support statement:

**`appEnv` in `derive --format=env`**
`derive --format=env` outputs only canonical `MULTIVERSE_RESOURCE_*` and
`MULTIVERSE_ENDPOINT_*` variables. `appEnv` aliases are not included. This is an intentional
scope boundary documented in ADR-0018. Adding `appEnv` to `derive --format=env` output is
deferred; no accepted ADR addresses it.

**Resource typed extraction**
Typed extraction (`url`, `port`) applies to endpoints only. Resources produce a single
string handle through their canonical variable and, if declared, a single string alias via
`appEnv`. Typed resource mapping is deferred.

**Multiple aliases per declaration**
Each resource or endpoint declaration supports one `appEnv` entry. Multiple aliases for a
single declaration are deferred (ADR-0018).

**Additional endpoint value kinds**
Only `url` and `port` are supported for typed endpoint extraction. Additional kinds are
deferred (ADR-0019).

**Configuration overlays and environment-specific files**
There is no mechanism for environment-specific `multiverse.json` profiles, `.env` overlay
files, or conditional configuration. Configuration is explicit and single-file. Overlays are
not planned for 1.0.

**Framework-specific or convention-based integration**
Multiverse does not generate application configuration files, infer variable names from
project structure, or integrate with application frameworks. Integration is always explicit
through declared `appEnv` fields.

---

## Relationship to existing docs

| Document | Relationship |
|---|---|
| `docs/spec/supported-workflow.md` | The workflow within which these patterns operate (`run` is the integration point) |
| `docs/adr/0012-explicit-process-wrapper-run.md` | Governs `run` semantics and canonical variable injection |
| `docs/adr/0018-explicit-app-native-env-mapping-for-run.md` | Governs `appEnv` alias mapping |
| `docs/adr/0019-explicit-typed-endpoint-mapping.md` | Governs typed endpoint extraction |
| `docs/spec/cli-output-shapes.md` | Documents the stable `run` output contract including stderr refusal routing |
| `docs/guides/external-demo-guide.md` | Practical tutorial showing both canonical and `appEnv` patterns |
| `apps/sample-compose/` | Proving application demonstrating the runtime-config boundary pattern |
