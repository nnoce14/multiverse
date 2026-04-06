# ADR 0018: Explicit app-native environment variable mapping for `run`

## Status

Accepted

## Date

2026-04-05

## Context

The current `0.3.x` phase is focused on improving the composed application consumer workflow.

Today, `multiverse run` injects canonical derived environment variables using `MULTIVERSE_*` names. That transport seam is useful, but it forces consumer applications to depend directly on Multiverse-specific variable names.

The roadmap prefers an explicit app-native environment variable overlay at process launch, while preserving explicit configuration, refusal-first behavior, and clear core/provider boundaries.

## Decision

Multiverse supports an optional `appEnv` field on resource and endpoint declarations.

For this slice:

- `appEnv` is a single string
- `appEnv` is alias-only
- `appEnv` applies only to `multiverse run`

When `appEnv` is present, `multiverse run` injects:

- the existing canonical `MULTIVERSE_*` variable
- the additional app-native variable named by `appEnv`

The app-native variable receives the same derived string value as the canonical variable for that declaration.

This is a core-owned declaration and runtime concern. Provider behavior does not change.

## Scope

Included:

- declaration support for optional `appEnv`
- declaration validation for `appEnv`
- app-native env injection during `multiverse run`
- refusal when mapped app-native env injection would collide with an existing parent environment variable

Excluded:

- `derive --format=env`
- provider contract changes
- provider implementation changes
- config-file overlays or mutation
- typed extraction such as endpoint `port`
- multiple aliases for one declaration
- framework-specific behavior

## Field shape

`appEnv` is optional and has this shape:

```json
{
  "appEnv": "DATABASE_PATH"
}
```

Richer shapes are deferred.

## Value semantics

`appEnv` is alias-only.

For resources, the mapped app-native variable receives the same derived resource handle string as the canonical resource variable.

Example:

- `MULTIVERSE_RESOURCE_APP_DB=/tmp/my-repo-main/app-db`
- `DATABASE_PATH=/tmp/my-repo-main/app-db`

For endpoints, the mapped app-native variable receives the same derived endpoint value string as the canonical endpoint variable.

Example:

- `MULTIVERSE_ENDPOINT_HTTP=http://127.0.0.1:5400`
- `APP_HTTP_URL=http://127.0.0.1:5400`

This ADR does not introduce typed endpoint extraction. Mapping an endpoint to `PORT` does not imply numeric port extraction.

## Conflict behavior

If `multiverse run` would inject an app-native variable named by `appEnv` and that variable already exists in the parent environment, Multiverse must refuse to run.

Multiverse does not silently override parent environment variables for `appEnv` mappings.

Canonical `MULTIVERSE_*` injection behavior is unchanged.

## Validation

Declaration-load validation:

- `appEnv`, if present, must be a non-empty string
- `appEnv` must be a valid environment variable name
- `appEnv` must not duplicate another declared `appEnv`
- `appEnv` must not use a reserved canonical `MULTIVERSE_*` name

Run-time validation:

- `multiverse run` must refuse if a mapped `appEnv` name already exists in the parent environment

## Consequences

Positive:

- applications can read app-owned variable names
- repository-owner intent remains explicit in configuration
- canonical `MULTIVERSE_*` transport variables remain available
- scope stays narrow for the current `0.3.x` proving goal

Limitations:

- endpoint consumers may still need parsing logic
- one declaration maps to one app-native variable only
- richer mapping semantics remain deferred

## Example

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

When launched with `multiverse run`, the child process receives:

```bash
MULTIVERSE_RESOURCE_APP_DB=/tmp/my-repo-main/app-db
DATABASE_PATH=/tmp/my-repo-main/app-db
MULTIVERSE_ENDPOINT_HTTP=http://127.0.0.1:5400
APP_HTTP_URL=http://127.0.0.1:5400
```
