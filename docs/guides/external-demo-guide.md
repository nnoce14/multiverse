# External Demo Guide

This guide shows how to run a Node.js application under Multiverse isolation using the `pnpm cli run` command.

By the end of this guide you will be able to:

- start your application with isolated resource paths and ports automatically injected as environment variables
- run two worktrees of the same repository simultaneously without interference
- reset or clean up a worktree's isolated state from the command line

---

## How this guide works

This guide uses the **repo-local `pnpm cli` invocation path**.

`pnpm cli` is a workspace script defined in the multiverse `package.json`. It runs the Multiverse CLI using the local TypeScript source via `tsx`. It is **not a globally installed binary** — it only works when invoked from the multiverse repo root.

To follow this guide, you need:

1. A clone of the multiverse repository
2. `pnpm install` run at the multiverse repo root — this makes the workspace packages available
3. All commands run from the **multiverse repo root**

The provider packages used in Step 2 (`@multiverse/provider-path-scoped`, `@multiverse/provider-local-port`) are **workspace packages within the multiverse repo**. They are not published to npm and do not need to be installed separately. They become available automatically once `pnpm install` is run at the repo root.

---

## What this guide proves

This guide proves that Multiverse can:

- derive isolated runtime values for a standalone application repository
- inject those values into a user-supplied child process through `pnpm cli run`
- run multiple worktrees of the same application in parallel without resource or port collisions
- reset or clean up isolated state per worktree without affecting other worktrees

## Prerequisites

- Node.js 18+
- pnpm (the multiverse repo uses pnpm workspaces)
- The multiverse repository cloned and installed:
  ```bash
  git clone https://github.com/nnoce14/multiverse
  cd multiverse
  pnpm install
  ```
- A git repository (or git worktree) for the application you want to isolate, with at least one worktree checked out

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
| `scopedReset` | Whether `pnpm cli reset` should perform a destructive reset for this resource |
| `scopedCleanup` | Whether `pnpm cli cleanup` should remove this resource's isolated state |

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

`@multiverse/provider-path-scoped` and `@multiverse/provider-local-port` are workspace packages within the multiverse repo. They are available once `pnpm install` has been run at the repo root — no separate install step is needed.

The `baseDir` is where isolated resource directories are created. Each worktree gets its own subdirectory under `baseDir`.

---

## Step 3 — Read Multiverse env vars in your application

When `pnpm cli run` starts your app, it injects isolated values as environment variables. Your application reads these instead of hardcoded configuration.

There are two explicit consumer patterns for reading Multiverse-derived values:

- read the canonical `MULTIVERSE_*` transport vars directly
- declare app-native aliases with `appEnv` and read those at one application-owned runtime-config boundary

The second pattern is the preferred proving direction for composed applications because it avoids scattering Multiverse-specific names throughout application code.

**Environment variables injected by `pnpm cli run`:**

| Variable | Content | Example |
|---|---|---|
| `MULTIVERSE_WORKTREE_ID` | The worktree identity | `feature-login` |
| `MULTIVERSE_RESOURCE_<NAME>` | Isolated resource handle | `/tmp/my-app/app-db/feature-login` |
| `MULTIVERSE_ENDPOINT_<NAME>` | Derived endpoint address | `http://localhost:5100` |

The name segment follows a simple rule: the declared name is uppercased and hyphens are replaced with underscores.

For endpoint values, Multiverse currently injects the full derived address. If your application needs a numeric port, parse it from the address in application code.

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
  process.stderr.write("Multiverse env vars required. Use: pnpm cli run -- node server.js\n");
  process.exit(1);
}

const port = parseInt(new URL(endpointAddress).port, 10);
// start your server on `port`, use `dbPath` for your database file
```

If you prefer app-owned names, declare `appEnv` in `multiverse.json`. Then `pnpm cli run` injects both the canonical `MULTIVERSE_*` variable and the explicit app-native values for that declaration.

Example:

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
      "appEnv": {
        "PORT": "port",
        "APP_HTTP_URL": "url"
      }
    }
  ]
}
```

An application-owned runtime-config boundary can then read `DATABASE_PATH`, `APP_HTTP_URL`, and `PORT` instead of the raw canonical names.

---

## Step 4 — Run your application

From the **multiverse repo root** (where `pnpm cli` is available and where `multiverse.json` and `providers.ts` live by default):

```bash
pnpm cli run -- node server.js
```

When invoked from inside a git worktree, Multiverse discovers the worktree identity automatically from the git worktree path. You do not need to pass `--worktree-id` in the common case.

If you need to override the discovered identity, or if Multiverse cannot determine it from git state, pass `--worktree-id` explicitly:

```bash
pnpm cli run --worktree-id feature-login -- node server.js
```

`--worktree-id` always overrides discovery. If automatic discovery is ambiguous or git is unavailable, Multiverse refuses with an actionable message directing you to pass `--worktree-id` explicitly.

**With defaults applied** (when `multiverse.json` and `providers.ts` are in the current directory):

```bash
# Starts server with isolated DB path and port for the current git worktree
pnpm cli run -- node server.js
```

Multiverse will:

1. Resolve the worktree identity (from `--worktree-id` if provided, or from git state)
2. Load `./multiverse.json` and `./providers.ts`
3. Derive isolated values for the resolved worktree
4. Inject `MULTIVERSE_RESOURCE_APP_DB`, `MULTIVERSE_ENDPOINT_HTTP`, and `MULTIVERSE_WORKTREE_ID` into the process environment;
   if `appEnv` aliases are declared, inject those aliases too
5. Start `node server.js` with those values
6. Pass the process's stdout and stderr through unchanged
7. Exit with the same exit code as `node server.js`

If derivation fails for any reason (invalid config, unknown provider, unsafe scope), Multiverse writes a JSON refusal to stderr and exits non-zero. The child process is never started.

*Note*: In the common case, no `--config`, `--providers`, or `--worktree-id` arguments are needed. When `multiverse.json` and `providers.ts` live at the repository root and you are inside a git worktree, Multiverse resolves everything automatically.

**Try it with the sample application:** The multiverse repository includes a sample Express application at `apps/sample-express/`. It is already configured with the `multiverse.json` and `providers.ts` from Steps 1 and 2. To run it:

```bash
pnpm cli run \
  --config apps/sample-express/multiverse.json \
  --providers apps/sample-express/providers.ts \
  -- npx tsx apps/sample-express/src/index.ts
```

The sample app reads `MULTIVERSE_RESOURCE_APP_DB` and `MULTIVERSE_ENDPOINT_HTTP` and starts an Express server on the derived port. You should see output like:

```
Sample Express app running at http://localhost:XXXX
Database: /tmp/multiverse-sample-express/app-db/<worktree-id>
```

---

## Step 5 — Run two worktrees simultaneously

This step requires two separate git worktree checkouts of the same repository running in parallel. Each checkout gets its own worktree directory and its own worktree identity.

With real git worktrees, Multiverse discovers the identity for each checkout automatically from the worktree directory name. In the common case, no `--worktree-id` flag is needed.

**Terminal 1 (first worktree or main checkout):**

```bash
pnpm cli run \
  --config apps/sample-express/multiverse.json \
  --providers apps/sample-express/providers.ts \
  -- npx tsx apps/sample-express/src/index.ts
# → MULTIVERSE_WORKTREE_ID=<first-worktree-directory-name>
# → MULTIVERSE_RESOURCE_APP_DB=/tmp/multiverse-sample-express/app-db/<first-worktree-directory-name>
# → MULTIVERSE_ENDPOINT_HTTP=http://localhost:<derived-port-for-first-worktree>
```

**Terminal 2 (second worktree checkout):**

```bash
pnpm cli run \
  --config apps/sample-express/multiverse.json \
  --providers apps/sample-express/providers.ts \
  -- npx tsx apps/sample-express/src/index.ts
# → MULTIVERSE_WORKTREE_ID=<second-worktree-directory-name>
# → MULTIVERSE_RESOURCE_APP_DB=/tmp/multiverse-sample-express/app-db/<second-worktree-directory-name>
# → MULTIVERSE_ENDPOINT_HTTP=http://localhost:<derived-port-for-second-worktree>
```

Each instance uses its own database path and port. The port values are deterministic: each worktree id maps to a stable port derived from `basePort` (5100 in the example providers). State written through one does not appear in the other.

If you need to override the discovered identity, `--worktree-id` remains available:

```bash
pnpm cli run \
  --config apps/sample-express/multiverse.json \
  --providers apps/sample-express/providers.ts \
  --worktree-id feature-login \
  -- npx tsx apps/sample-express/src/index.ts
```

*Note*: Keep the worktree directory name, branch name, and `--worktree-id` aligned when possible. Multiverse only requires a stable non-empty worktree identity, but matching those values makes the workflow easier to reason about and reduces operator mistakes.

---

## Step 6 — Inspect derived values

To see what values Multiverse would derive without starting the app:

```bash
# JSON output (default)
pnpm cli derive --worktree-id feature-login

# Shell-sourceable KEY=VALUE pairs
pnpm cli derive --worktree-id feature-login --format env
```

Both `--format env` (space form) and `--format=env` (equals form) are accepted.

The `--format env` output includes the canonical `MULTIVERSE_RESOURCE_*` and
`MULTIVERSE_ENDPOINT_*` variables. It does not include `appEnv` aliases — those are
injected only by `pnpm cli run` at process-launch time. Use `derive --format=env` for
inspection and scripting against canonical variable names.

---

## Step 7 — Reset and clean up

**Reset** — deletes a worktree's isolated state so the next run starts fresh:

```bash
pnpm cli reset --worktree-id feature-login
```

After reset, `MULTIVERSE_RESOURCE_APP_DB` no longer exists on disk. The next `pnpm cli run` will create a new empty resource at the same path.

Reset only affects resources that declare `scopedReset: true` in `multiverse.json`.

**Cleanup** — permanently removes a worktree's isolated state when the worktree is no longer needed:

```bash
pnpm cli cleanup --worktree-id feature-login
```

Cleanup only affects resources that declare `scopedCleanup: true` in `multiverse.json`.

---

## Reference: CLI options

All Multiverse commands use these options. `--config` and `--providers` default to `./multiverse.json` and `./providers.ts` respectively. `--worktree-id` is optional when invoked from inside a git worktree — Multiverse discovers the identity from the worktree path automatically. Pass `--worktree-id` explicitly to override. All flags accept both space form (`--flag value`) and equals form (`--flag=value`).

```
pnpm cli run       [--config PATH] [--providers MODULE] [--worktree-id VALUE] -- <cmd> [args...]
pnpm cli derive    [--config PATH] [--providers MODULE] [--worktree-id VALUE] [--format json|env]
pnpm cli validate  [--config PATH] [--providers MODULE] [--worktree-id VALUE]
pnpm cli reset     [--config PATH] [--providers MODULE] [--worktree-id VALUE]
pnpm cli cleanup   [--config PATH] [--providers MODULE] [--worktree-id VALUE]
```

---

## Using the formal binary

The `pnpm cli` workspace script is the primary development path. Multiverse also ships a compiled binary at `apps/cli/bin/multiverse.js` that can be invoked directly with `node`.

### Step 1 — Build the binary

From the multiverse repo root:

```bash
pnpm --filter @multiverse/cli build
```

This compiles `apps/cli/src/index.ts` to `apps/cli/dist/index.js`. The `bin/multiverse.js` wrapper is already committed — no additional setup is needed.

### Step 2 — Invoke the compiled binary

Replace `pnpm cli` with `node apps/cli/bin/multiverse.js`:

```bash
node apps/cli/bin/multiverse.js derive --config path/to/multiverse.json --providers path/to/providers.ts
```

The compiled binary and `pnpm cli` invoke the same underlying CLI logic. All commands, flags, auto-discovery, and conventional defaults behave identically.

### TypeScript providers within the workspace

Workspace provider packages (`@multiverse/provider-path-scoped`, etc.) export TypeScript source directly. On the compiled and globally-linked binary paths, Multiverse now auto-loads TypeScript provider modules in workspace scope. Manual `NODE_OPTIONS` is not required.

```bash
node apps/cli/bin/multiverse.js derive \
  --config path/to/multiverse.json \
  --providers path/to/providers.ts
```

This relies on `tsx` being available in the workspace dependency graph (true after `pnpm install` at the multiverse repo root).

### Globally-linked binary (within-workspace proof)

You can link the compiled binary globally so that `multiverse` is available as a
shell command. This is proven within the multiverse workspace — see the structural
limitation below.

**Step 1** — Run `pnpm setup` to configure pnpm's global bin directory:

```bash
pnpm setup
source ~/.bashrc   # or open a new terminal
```

`pnpm setup` appends `PNPM_HOME` to your shell profile and needs to take effect
before the next step.

**Step 2** — Build the binary (if not already built):

```bash
pnpm --filter @multiverse/cli build
```

**Step 3** — Link the CLI package globally:

```bash
cd apps/cli
pnpm link --global
```

This places a `multiverse` executable in `$PNPM_HOME`. Verify with:

```bash
multiverse --help
```

**Step 4** — Invoke:

```bash
multiverse derive \
  --config apps/sample-express/multiverse.json \
  --providers apps/sample-express/providers.ts
```

All commands behave identically to `pnpm cli` and `node apps/cli/bin/multiverse.js`.

**Structural limitation:** This path is proven within the multiverse workspace.
Provider packages (`@multiverse/provider-path-scoped`, etc.) are
workspace-local and not published to npm, so any `providers.ts` must import from
the workspace regardless of where the binary is invoked from.

**To remove the global link:**

```bash
pnpm remove --global @multiverse/cli
```

### What is deferred

- A globally-linked `multiverse` command usable for non-workspace repositories
- Distribution outside the repository

---

## Troubleshooting

**"MULTIVERSE_RESOURCE_APP_DB is required"**

Your server is reading the env var but Multiverse didn't inject it. Make sure you start the server with `pnpm cli run -- ...` rather than `node server.js` directly.

**"Cannot read config file: ./multiverse.json"**

Run from the directory that contains `multiverse.json`, or pass `--config /path/to/multiverse.json` explicitly.

**"Cannot load providers module: ./providers.ts"**

Run from the directory that contains `providers.ts`, or pass `--providers /path/to/providers.ts` explicitly.

**Refusal: "Safe worktree scope cannot be determined"**

`--worktree-id` was empty or blank. Pass a non-empty worktree identity string.

**"Cannot determine worktree identity from git state"**

Auto-discovery could not resolve a worktree identity from the current directory. Either the directory is not inside a git worktree, or git is unavailable. Pass `--worktree-id` explicitly.

**"Cannot load providers module" when using the compiled binary**

Ensure you are using a providers module whose imports resolve in the current workspace (for example `apps/sample-express/providers.ts` from the multiverse repo root). Outside-workspace provider packaging remains deferred.
