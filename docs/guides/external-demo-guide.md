# External Demo Guide

This guide shows how to run a Node.js application under Multiverse isolation using the `multiverse run` command.

By the end of this guide you will be able to:

- start your application with isolated resource paths and ports automatically injected as environment variables
- run two worktrees of the same repository simultaneously without interference
- reset or clean up a worktree's isolated state from the command line

---

## Prerequisites

- Node.js 18+
- A git repository with at least one worktree checked out
- Multiverse installed (accessible as `multiverse` or via `pnpm dlx @multiverse/cli`)

---

## Step 1 — Declare your repository configuration

Create `multiverse.json` at the root of your repository.

This file is **declarative**: it lists the resources (databases, file stores) and endpoints (ports, URLs) your application needs. Multiverse does not infer anything from your project structure.

```json
{
  "resources": [
    {
      "name": "app-db",
      "provider": "path-scoped",
      "isolationStrategy": "path-scoped",
      "scopedValidate": false,
      "scopedReset": true,
      "scopedCleanup": true
    }
  ],
  "endpoints": [
    {
      "name": "http",
      "role": "application-http",
      "provider": "local-port"
    }
  ]
}
```

**Field reference:**

| Field | Meaning |
|---|---|
| `name` | Your name for this resource or endpoint |
| `provider` | Which provider implements the isolation |
| `isolationStrategy` | How the resource is isolated (`path-scoped`, `name-scoped`) |
| `scopedReset` | Whether `multiverse reset` should perform a destructive reset for this resource |
| `scopedCleanup` | Whether `multiverse cleanup` should remove this resource's isolated state |

---

## Step 2 — Set up your providers

Create `providers.ts` at the root of your repository. This file wires provider implementations to the names declared in `multiverse.json`.

```typescript
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createPathScopedProvider } from "@multiverse/provider-path-scoped";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

export const providers = {
  resources: {
    "path-scoped": createPathScopedProvider({
      baseDir: join(tmpdir(), "my-app-multiverse")
    })
  },
  endpoints: {
    "local-port": createLocalPortProvider({ basePort: 5100 })
  }
};
```

The `baseDir` is where isolated resource directories are created. Each worktree gets its own subdirectory under `baseDir`.

---

## Step 3 — Read Multiverse env vars in your application

When `multiverse run` starts your app, it injects isolated values as environment variables. Your application reads these instead of hardcoded configuration.

**Environment variables injected by `multiverse run`:**

| Variable | Content | Example |
|---|---|---|
| `MULTIVERSE_WORKTREE_ID` | The worktree identity | `feature-login` |
| `MULTIVERSE_RESOURCE_<NAME>` | Isolated resource handle | `/tmp/my-app/app-db/feature-login` |
| `MULTIVERSE_ENDPOINT_<NAME>` | Derived endpoint address | `http://localhost:5100` |

The name segment follows a simple rule: the declared name is uppercased and hyphens are replaced with underscores.

**Examples for the configuration above:**

```
MULTIVERSE_WORKTREE_ID=feature-login
MULTIVERSE_RESOURCE_APP_DB=/tmp/my-app-multiverse/app-db/feature-login
MULTIVERSE_ENDPOINT_HTTP=http://localhost:5100
```

**Reading these in your server:**

```javascript
const dbPath = process.env.MULTIVERSE_RESOURCE_APP_DB;
const endpointAddress = process.env.MULTIVERSE_ENDPOINT_HTTP;

if (!dbPath || !endpointAddress) {
  process.stderr.write("Multiverse env vars required. Use: multiverse run -- node server.js\n");
  process.exit(1);
}

const port = parseInt(new URL(endpointAddress).port, 10);
// start your server on `port`, use `dbPath` for your database file
```

---

## Step 4 — Run your application

From the root of your repository (where `multiverse.json` and `providers.ts` live):

```bash
multiverse run --worktree-id <id> -- node server.js
```

`--worktree-id` is the identity of the current worktree. Use the git branch name or worktree path — any stable, unique string that identifies this checkout.

**With defaults applied** (when `multiverse.json` and `providers.ts` are in the current directory):

```bash
# Starts server with isolated DB path and port for this worktree
multiverse run --worktree-id feature-login -- node server.js
```

Multiverse will:
1. Load `./multiverse.json` and `./providers.ts`
2. Derive isolated values for `feature-login`
3. Inject `MULTIVERSE_RESOURCE_APP_DB`, `MULTIVERSE_ENDPOINT_HTTP`, and `MULTIVERSE_WORKTREE_ID` into the process environment
4. Start `node server.js` with those values
5. Pass the process's stdout and stderr through unchanged
6. Exit with the same exit code as `node server.js`

If derivation fails for any reason (invalid config, unknown provider, unsafe scope), Multiverse writes a JSON refusal to stderr and exits non-zero. The child process is never started.

---

## Step 5 — Run two worktrees simultaneously

Open two terminals. Each runs the same application but at different isolated paths and ports.

**Terminal 1 (main branch):**
```bash
multiverse run --worktree-id main -- node server.js
# → MULTIVERSE_RESOURCE_APP_DB=/tmp/my-app-multiverse/app-db/main
# → MULTIVERSE_ENDPOINT_HTTP=http://localhost:5100
```

**Terminal 2 (feature-login branch):**
```bash
multiverse run --worktree-id feature-login -- node server.js
# → MULTIVERSE_RESOURCE_APP_DB=/tmp/my-app-multiverse/app-db/feature-login
# → MULTIVERSE_ENDPOINT_HTTP=http://localhost:5101
```

Each instance uses its own database path and port. State written through one does not appear in the other.

---

## Step 6 — Inspect derived values

To see what values Multiverse would derive without starting the app:

```bash
# JSON output (default)
multiverse derive --worktree-id feature-login

# Shell-sourceable KEY=VALUE pairs
multiverse derive --worktree-id feature-login --format=env
```

The `--format=env` output uses the same variable names that `multiverse run` injects.

---

## Step 7 — Reset and clean up

**Reset** — deletes a worktree's isolated state so the next run starts fresh:

```bash
multiverse reset --worktree-id feature-login
```

After reset, `MULTIVERSE_RESOURCE_APP_DB` no longer exists on disk. The next `multiverse run` will create a new empty resource at the same path.

Reset only affects resources that declare `scopedReset: true` in `multiverse.json`.

**Cleanup** — permanently removes a worktree's isolated state when the worktree is no longer needed:

```bash
multiverse cleanup --worktree-id feature-login
```

Cleanup only affects resources that declare `scopedCleanup: true` in `multiverse.json`.

---

## Reference: CLI options

All Multiverse commands use these options. `--config` and `--providers` default to `./multiverse.json` and `./providers.ts` respectively. `--worktree-id` is always required.

```
multiverse run       [--config PATH] [--providers MODULE] --worktree-id VALUE -- <cmd> [args...]
multiverse derive    [--config PATH] [--providers MODULE] --worktree-id VALUE [--format json|env]
multiverse validate  [--config PATH] [--providers MODULE] --worktree-id VALUE
multiverse reset     [--config PATH] [--providers MODULE] --worktree-id VALUE
multiverse cleanup   [--config PATH] [--providers MODULE] --worktree-id VALUE
```

---

## Troubleshooting

**"MULTIVERSE_RESOURCE_APP_DB is required"**

Your server is reading the env var but Multiverse didn't inject it. Make sure you start the server with `multiverse run -- ...` rather than `node server.js` directly.

**"Cannot read config file: ./multiverse.json"**

Run from the directory that contains `multiverse.json`, or pass `--config /path/to/multiverse.json` explicitly.

**"Cannot load providers module: ./providers.ts"**

Run from the directory that contains `providers.ts`, or pass `--providers /path/to/providers.ts` explicitly.

**Refusal: "Safe worktree scope cannot be determined"**

`--worktree-id` was empty or blank. Pass a non-empty worktree identity string.
