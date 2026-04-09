# CLI Output Shapes

## Purpose

This document specifies the stable output contract for the Multiverse CLI primary commands.

It exists so that users and script authors can rely on output field names and structure remaining
stable between minor versions, and so that contributors understand which shapes are public
contracts rather than incidental implementation details.

## Scope

This document covers the five primary CLI commands:

- `derive`
- `validate`
- `reset`
- `cleanup`
- `run`

It does not cover `validate-worktree` or `validate-repository`. Those two commands perform
declaration validation — checking that a worktree identity string or repository configuration
file is well-formed before any isolation operation. They are utility commands, not primary
workflow commands, and their output shapes are not part of the public stability contract
documented here.

---

## General conventions

### Output stream routing

| Situation | stdout | stderr | Exit code |
|---|---|---|---|
| Success (all commands except `run`) | JSON result | empty | 0 |
| Success (`run`) | empty (transparent) | empty (transparent) | child's exit code |
| Refusal (all commands except `run`) | JSON refusal | empty | 1 |
| Refusal (`run`) | empty | JSON refusal | 1 |
| Usage error (bad flag, missing separator) | empty | plain-text message | 1 |

**`run` is the exception for refusal routing.** All other commands write both success and
refusal JSON to stdout. `run` writes refusal JSON to stderr and leaves stdout empty. This
preserves the child process's stdin/stdout/stderr contract: if `run` could not start the
child process, no child output would pollute stdout.

### JSON output format

Each command that produces JSON output writes exactly **one line** to stdout. The line is a
compact JSON object followed by a newline. There is no additional whitespace, newlines within
the object, or trailing content.

### `derive --format=env` exception

When `derive` is invoked with `--format=env`, success output is **not JSON**. Instead, it
writes one `KEY=VALUE` line per declared resource and endpoint. See the `derive` section
below for details.

---

## Shared object shapes

These shapes appear as array elements within command results.

### `DerivedResourcePlan`

Produced by every command that touches a resource.

```json
{
  "resourceName": "<declared resource name>",
  "provider": "<provider name from multiverse.json>",
  "isolationStrategy": "name-scoped | path-scoped | process-scoped | process-port-scoped",
  "worktreeId": "<resolved worktree identity>",
  "handle": "<provider-derived isolation handle>"
}
```

### `DerivedEndpointMapping`

Produced by `derive` and `validate`.

```json
{
  "endpointName": "<declared endpoint name>",
  "provider": "<provider name from multiverse.json>",
  "role": "<declared endpoint role>",
  "worktreeId": "<resolved worktree identity>",
  "address": "<provider-derived address, e.g. http://localhost:5100>"
}
```

### `ResourceValidation`

Produced by `validate` for each resource that declares `scopedValidate: true`.

```json
{
  "resourceName": "<name>",
  "provider": "<provider>",
  "worktreeId": "<id>",
  "capability": "validate"
}
```

### `ResourceReset`

Produced by `reset` for each resource that declares `scopedReset: true`.

```json
{
  "resourceName": "<name>",
  "provider": "<provider>",
  "worktreeId": "<id>",
  "capability": "reset"
}
```

### `ResourceCleanup`

Produced by `cleanup` for each resource that declares `scopedCleanup: true`.

```json
{
  "resourceName": "<name>",
  "provider": "<provider>",
  "worktreeId": "<id>",
  "capability": "cleanup"
}
```

---

## Refusal shape

A refusal is the structured output produced when a command cannot safely proceed. The refusal
shape is shared across all primary commands.

```json
{
  "ok": false,
  "refusal": {
    "category": "<category>",
    "reason": "<human-readable explanation>"
  }
}
```

### Refusal categories

| Category | Meaning |
|---|---|
| `unsafe_scope` | The worktree scope cannot be safely determined |
| `unsupported_capability` | The requested operation is not supported by the declared provider |
| `invalid_configuration` | The repository configuration or provider setup is invalid |
| `provider_failure` | A provider-level failure occurred during the operation |

---

## `derive`

Derives isolated runtime values for the resolved worktree without starting any child process.

### JSON format (default or `--format=json`)

**Success (exit 0, stdout):**

```json
{
  "ok": true,
  "resourcePlans": [DerivedResourcePlan, ...],
  "endpointMappings": [DerivedEndpointMapping, ...]
}
```

`resourcePlans` contains one entry per declared resource, in declaration order.
`endpointMappings` contains one entry per declared endpoint, in declaration order.

**Failure (exit 1, stdout):**

```json
{
  "ok": false,
  "refusal": { "category": "...", "reason": "..." }
}
```

### Env format (`--format=env`)

**Success (exit 0, stdout):**

One line per declared resource:
```
MULTIVERSE_RESOURCE_<NAME>=<handle>
```

One line per declared endpoint:
```
MULTIVERSE_ENDPOINT_<NAME>=<address>
```

Name transformation: the declared name is uppercased and hyphens are replaced with
underscores. For example, `app-db` becomes `APP_DB`, producing `MULTIVERSE_RESOURCE_APP_DB`.

Lines appear in declaration order: all resource lines first, then all endpoint lines.

`appEnv` aliases are **not** included in `derive --format=env` output. They are injected
only by `run` at process-launch time.

**Failure (exit 1, stdout):**

The refusal JSON is written to stdout (same as the JSON format failure). The output is a
single JSON line, not KEY=VALUE.

---

## `validate`

Derives values and validates resources that declare `scopedValidate: true`.

**Success (exit 0, stdout):**

```json
{
  "ok": true,
  "resourcePlans": [DerivedResourcePlan, ...],
  "endpointMappings": [DerivedEndpointMapping, ...],
  "resourceValidations": [ResourceValidation, ...]
}
```

`resourceValidations` contains one entry per resource that declared `scopedValidate: true`
and whose provider successfully validated the derived scope. It is an empty array if no
resources declare `scopedValidate: true`.

**Failure (exit 1, stdout):**

```json
{
  "ok": false,
  "refusal": { "category": "...", "reason": "..." }
}
```

---

## `reset`

Resets isolated state for resources that declare `scopedReset: true`.

**Success (exit 0, stdout):**

```json
{
  "ok": true,
  "resourcePlans": [DerivedResourcePlan, ...],
  "resourceResets": [ResourceReset, ...]
}
```

`resourcePlans` contains only the resources that declared `scopedReset: true` (not all
declared resources). `resourceResets` contains one entry per reset resource.

**Failure (exit 1, stdout):**

```json
{
  "ok": false,
  "refusal": { "category": "...", "reason": "..." }
}
```

---

## `cleanup`

Permanently removes isolated state for resources that declare `scopedCleanup: true`.

**Success (exit 0, stdout):**

```json
{
  "ok": true,
  "resourcePlans": [DerivedResourcePlan, ...],
  "resourceCleanups": [ResourceCleanup, ...]
}
```

`resourcePlans` contains only the resources that declared `scopedCleanup: true` (not all
declared resources). `resourceCleanups` contains one entry per cleaned-up resource.

**Failure (exit 1, stdout):**

```json
{
  "ok": false,
  "refusal": { "category": "...", "reason": "..." }
}
```

---

## `run`

Starts a user-supplied child process with derived values injected as environment variables.

**Success (exit = child's exit code):**

- stdout: empty (child's stdout passes through unchanged)
- stderr: empty (child's stderr passes through unchanged)
- exit code: the child process's exit code

Multiverse itself produces no stdout or stderr output when the child process launches
successfully.

**Failure — refusal (exit 1):**

Refusal is written to **stderr**, not stdout. This is intentional: `run` launches a child
process and passes its stdout through unchanged. Writing refusal to stderr preserves the
stdout contract for downstream consumers.

```
stderr:
{"ok":false,"refusal":{"category":"...","reason":"..."}}
```

stdout: empty.

The child process is never started when a refusal occurs.

---

## Stability guarantee

The field names and shapes documented here are stable within the 0.7.x version line and
are intended to remain stable through 1.0.

Changes to output shapes will be documented explicitly in release notes and will not be
introduced silently in minor versions.
