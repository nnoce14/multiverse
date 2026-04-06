# Dev Slice 27 — Explicit App-Native Env Mapping (`appEnv`)

## Status

In progress

## ADR

ADR-0018: Explicit app-native environment variable mapping for `run`

## Intent

Reduce application-code dependence on raw `MULTIVERSE_*` environment variable names by supporting
an optional `appEnv` field on resource and endpoint declarations.

When `appEnv` is declared, `multiverse run` injects both the canonical `MULTIVERSE_*` variable
and an additional alias under the app-native name. The consumer application reads the app-native
name instead of the Multiverse-specific name.

This is the first step in the 0.3.x consumer workflow refinement. It is alias-only and applies
only to `multiverse run`. No provider behavior changes.

## Slice objective

1. Add optional `appEnv?: string` to `ResourceDeclaration` and `EndpointDeclaration` in
   `@multiverse/provider-contracts`
2. Validate `appEnv` during declaration-load validation in `@multiverse/core`:
   - must be a non-empty string (if present)
   - must be a valid environment variable name (`^[A-Za-z_][A-Za-z0-9_]*$`)
   - must not begin with `MULTIVERSE_` (reserved prefix)
   - must not duplicate another `appEnv` value across all declarations in the repository
3. Carry validated `appEnv` through `ValidatedResourceDeclaration` and
   `ValidatedEndpointDeclaration`
4. In `multiverse run` (`apps/cli/src/index.ts`):
   - after derivation succeeds, collect `appEnv` aliases from the raw repository configuration
   - check for conflicts: if any `appEnv` name already exists in the parent environment, refuse
     with `invalid_configuration` (do not silently override)
   - inject both canonical `MULTIVERSE_*` vars and app-native alias vars into the child process
5. Add `appEnv` to `apps/sample-compose/multiverse.json` for all three seams
6. Add `apps/sample-compose/src/index.ts` — CLI entry point that reads only app-native env vars

## In scope

- `packages/provider-contracts/src/index.ts` — `appEnv?: string` on `ResourceDeclaration` and
  `EndpointDeclaration`
- `packages/core/src/declarations.ts` — validation logic and error codes, `appEnv` in
  `ValidatedResourceDeclaration` / `ValidatedEndpointDeclaration`
- `packages/core/src/repository-configuration.ts` — cross-declaration duplicate `appEnv` check
- `apps/cli/src/index.ts` — `handleRun` refactored to collect aliases, check conflicts, inject
- `apps/sample-compose/multiverse.json` — `appEnv` added to all three declarations
- `apps/sample-compose/src/index.ts` — new CLI entry reading app-native env vars
- `tests/acceptance/cli-run-appenv-mapping.acceptance.test.ts` — new acceptance tests
- `tests/unit/declarations-appenv.test.ts` — unit tests for the new validation logic

## Out of scope

- `derive --format=env` output (canonical vars only, no change)
- provider contract or implementation changes
- typed extraction (e.g. numeric port from an endpoint URL)
- multiple aliases per declaration
- config-file overlays or mutation
- framework-specific behavior
- changes to `sample-express` or its tests
- CI changes (existing jobs already cover the new code paths)

## appEnv field shape

```json
{
  "resources": [
    {
      "name": "app-db",
      "provider": "path-scoped",
      "isolationStrategy": "path-scoped",
      "scopedReset": true,
      "scopedCleanup": true,
      "appEnv": "DATABASE_PATH"
    },
    {
      "name": "cache-sidecar",
      "provider": "process-port-scoped",
      "isolationStrategy": "process-port-scoped",
      "scopedReset": true,
      "scopedCleanup": true,
      "appEnv": "CACHE_ADDR"
    }
  ],
  "endpoints": [
    {
      "name": "http",
      "role": "application-http",
      "provider": "local-port",
      "appEnv": "APP_HTTP_URL"
    }
  ]
}
```

## Injection behavior

For a resource with `appEnv: "DATABASE_PATH"`:

```
MULTIVERSE_RESOURCE_APP_DB=/tmp/.../app-db/wt-foo
DATABASE_PATH=/tmp/.../app-db/wt-foo
```

For an endpoint with `appEnv: "APP_HTTP_URL"`:

```
MULTIVERSE_ENDPOINT_HTTP=http://127.0.0.1:5400
APP_HTTP_URL=http://127.0.0.1:5400
```

The alias value is the same derived string as the canonical variable. No typed extraction.

## sample-compose appEnv names

| Declaration | `appEnv` value |
|-------------|----------------|
| resource `app-db` | `DATABASE_PATH` |
| resource `cache-sidecar` | `CACHE_ADDR` |
| endpoint `http` | `APP_HTTP_URL` |

## Validation error codes

New error codes added to `DeclarationValidationError.code`:

| Code | Meaning |
|------|---------|
| `"invalid_env_var_name"` | `appEnv` is present but fails the valid name pattern |
| `"reserved_name"` | `appEnv` begins with `MULTIVERSE_` |
| `"duplicate_appenv"` | same `appEnv` value appears in more than one declaration |

## Acceptance criteria

- `appEnv` on a resource declaration causes `run` to inject both the canonical
  `MULTIVERSE_RESOURCE_<NAME>` var and the alias under the declared name, with the same value
- `appEnv` on an endpoint declaration causes `run` to inject both the canonical
  `MULTIVERSE_ENDPOINT_<NAME>` var and the alias under the declared name, with the same value
- Declarations without `appEnv` continue to inject only the canonical var (no regression)
- `run` refuses and the child is never started when a declared `appEnv` name already exists in
  the parent environment
- Declaration validation refuses: non-string appEnv, empty string, invalid name format, reserved
  `MULTIVERSE_*` prefix, duplicate across declarations
- `derive --format=env` output is unchanged
- `apps/sample-compose/src/index.ts` reads only `DATABASE_PATH`, `CACHE_ADDR`, `APP_HTTP_URL`
  with no `MULTIVERSE_*` names in application code
- All existing tests remain green
- `pnpm typecheck` passes

## Definition of done

All acceptance criteria pass, existing tests are green, typecheck passes, and
`apps/sample-compose/src/index.ts` demonstrates the cleaner consumer integration pattern.
