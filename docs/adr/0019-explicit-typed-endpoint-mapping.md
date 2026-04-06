# ADR 0019: Explicit typed endpoint mapping for app-native environment variables

## Status

Accepted

## Date

2026-04-06

## Context

ADR 0018 introduced optional `appEnv` alias mapping for `multiverse run`.

That improved the consumer workflow by allowing applications to read app-owned environment variable names instead of raw `MULTIVERSE_*` names. However, endpoint mappings remain limited because alias-only behavior injects the full derived endpoint string. That works for names like `APP_HTTP_URL`, but it does not support common application needs such as a numeric `PORT`.

The current `0.3.x` phase is focused on improving the composed application consumer workflow while preserving explicit configuration, refusal-first behavior, and clear core/provider boundaries.

## Decision

Multiverse will support an optional typed endpoint app-env mapping for endpoint declarations.

For endpoints, `appEnv` may now be either:

- a single string alias, preserving ADR 0018 behavior
- an explicit mapping object from app-native env names to supported endpoint value kinds

Supported endpoint value kinds for this slice are:

- `url`
- `port`

This behavior applies only to `multiverse run`.

## Scope

Included:

- typed endpoint mapping for app-native env injection during `multiverse run`
- explicit extraction of `url` and `port` from derived endpoint values
- validation for typed endpoint mapping
- refusal when mapped app-native env injection would collide with an existing parent environment variable

Excluded:

- `derive --format=env`
- resource typed mapping
- provider contract changes
- provider implementation changes
- config-file overlays or mutation
- framework-specific behavior
- additional endpoint value kinds beyond `url` and `port`

## Declaration shape

For resources, ADR 0018 behavior is unchanged:

```json
{
  "appEnv": "DATABASE_PATH"
}
```

For endpoints, `appEnv` may also use this typed shape:

```json
{
  "appEnv": {
    "PORT": "port",
    "APP_HTTP_URL": "url"
  }
}
```

This mapping is explicit. Multiverse does not infer app-native names or value kinds.

## Value semantics

For endpoint declarations:

- `url` injects the full derived endpoint string
- `port` injects the numeric port portion as a string

Example:

- derived endpoint: `http://127.0.0.1:5400`
- `APP_HTTP_URL=url` injects `APP_HTTP_URL=http://127.0.0.1:5400`
- `PORT=port` injects `PORT=5400`

If the derived endpoint value does not contain an extractable port, `multiverse run` must refuse rather than guess.

## Conflict behavior

If `multiverse run` would inject any app-native variable from endpoint `appEnv` and that variable already exists in the parent environment, Multiverse must refuse to run.

Multiverse does not silently override parent environment variables.

Canonical `MULTIVERSE_*` injection behavior is unchanged.

## Validation

Declaration-load validation:

- endpoint `appEnv`, if present, may be either:
  - a non-empty string, or
  - a non-empty object mapping env var names to supported endpoint value kinds
- mapped env var names must be valid environment variable names
- mapped env var names must not duplicate other declared `appEnv` names
- mapped env var names must not use reserved canonical `MULTIVERSE_*` names
- endpoint value kinds must be one of:
  - `url`
  - `port`

Run-time validation:

- `multiverse run` must refuse if a mapped app-native env name already exists in the parent environment
- `multiverse run` must refuse if a requested endpoint value kind cannot be extracted from the derived endpoint value

## Boundary ownership

This is a core-owned concern.

It affects:

- declaration parsing
- declaration validation
- runtime environment injection for `run`
- refusal behavior for env collisions and extraction failure

It does not affect:

- provider contracts
- provider capability semantics
- provider implementations
- canonical derived value production

Providers continue to produce the same endpoint values they already produce. Core is responsible for explicit extraction during process launch.

## Consequences

Positive:

- supports common application needs such as `PORT`
- preserves explicit repository-owned mapping
- keeps canonical `MULTIVERSE_*` transport variables unchanged
- advances the `0.3.x` consumer workflow without broader config magic

Limitations:

- typed mapping applies only to endpoints
- supported endpoint kinds are limited to `url` and `port`
- extraction failure becomes an explicit refusal case

## Example

```json
{
  "endpoints": [
    {
      "name": "http",
      "role": "application-http",
      "provider": "local-port",
      "appEnv": {
        "PORT": "port",
        "APP_HTTP_URL": "url"
      }
    }
  ]
}
```

When launched with `multiverse run`, the child process receives:

```bash
MULTIVERSE_ENDPOINT_HTTP=http://127.0.0.1:5400
PORT=5400
APP_HTTP_URL=http://127.0.0.1:5400
```

## Alternatives considered

### Keep alias-only endpoint mapping

Rejected.

Alias-only improved naming but did not address the common need for numeric port injection.

### Introduce typed mapping for both resources and endpoints now

Rejected for now.

The current friction is specifically around endpoint consumers. Broadening typed mapping further is unnecessary for this slice.

### Support more endpoint value kinds immediately

Rejected for now.

Only `url` and `port` are needed to prove the next step in the consumer workflow.

## Follow-on implications

The next implementation slice may:

- extend endpoint declaration parsing and validation
- extend `multiverse run` to inject typed endpoint app-env values
- add refusal coverage for extraction failure and env collisions
- update sample-compose to consume `PORT` explicitly if that improves the proof

ADR 0018 remains unchanged for resources and for alias-only endpoint mappings.
