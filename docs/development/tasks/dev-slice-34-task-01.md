# Dev Slice 34 — Task 01

## Title

CLI error surfacing: include underlying cause in provider and config load failures

## Motivation

A second author following the provider authoring guide will write a `providers.ts`
file and invoke the CLI. If their module has a syntax error, a missing import, or
a wrong export shape, the CLI currently returns:

```
Cannot load providers module: providers.ts
```

The underlying Node.js error (missing module, syntax error, import failure) is
swallowed in a bare `catch {}` block and never shown. The author has no actionable
signal to fix the problem.

The same pattern exists for config file loading:

```
Cannot read config file: multiverse.json
```

A JSON parse error or permission failure produces the same opaque message, with
no indication of what went wrong.

Both failures share the same root cause: `catch {}` in two functions in
`apps/cli/src/index.ts` — `loadProviderRegistry` and `readRepositoryConfiguration`.

## In scope

- `apps/cli/src/index.ts`
  - `loadProviderRegistry`: capture the thrown error and append its message to the
    usage string so second authors can see the underlying Node.js error
  - `readRepositoryConfiguration`: same fix
  - No other behavior changes — exit code, stdout shape, stderr shape are unchanged

- `tests/acceptance/` (new or updated)
  - Add focused acceptance assertions confirming that the underlying error message
    appears in stderr when providers module load fails with a bad path
  - Add focused acceptance assertions confirming that the underlying error message
    appears in stderr when config file contains invalid JSON
  - These are the two highest-signal failure modes for a new author

## Out of scope

- Structured error output or JSON error format
- Rethrowing or changing exit codes
- `isProviderRegistry` shape check messages (those are already descriptive)
- Any other CLI command paths
- Config schema validation error messages (separate concern)
- Provider capability check error messages

## Acceptance criteria

- When `loadProviderRegistry` fails to import a module, stderr includes a phrase
  from the underlying Node.js error (not just the file path)
- When `readRepositoryConfiguration` encounters a JSON parse error, stderr includes
  a phrase from the underlying error (not just the file path)
- All existing acceptance, contract, unit, and integration tests continue to pass
- `pnpm typecheck` passes

## Files expected to change

- `apps/cli/src/index.ts`
- `tests/acceptance/` (new focused test file or additions to existing)
- `docs/development/tasks/dev-slice-34-task-01.md` (this file)

## Truth-alignment on completion

- `docs/development/current-state.md` — update the proving result and priority
- `docs/development/repo-map.md` — update slice count (33 → 34)
