import { createHash } from "node:crypto";
import { join } from "node:path";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  ResourceReset,
  ResourceCleanup,
  Refusal
} from "@multiverse/provider-contracts";

export interface ProcessPortScopedProviderConfig {
  baseDir: string;
  basePort: number;
  command: string[];
}

const PORT_RANGE = 1000;

function derivePort(worktreeId: string, resourceName: string, basePort: number): number {
  const hash = createHash("sha256").update(worktreeId).update(resourceName).digest();
  const offset = hash.readUInt32BE(0) % PORT_RANGE;
  return basePort + offset;
}

function deriveHandle(port: number): string {
  return `localhost:${port}`;
}

function deriveStateDir(baseDir: string, resourceName: string, worktreeId: string): string {
  return join(baseDir, resourceName, worktreeId) + "/";
}

function pidFilePath(stateDir: string): string {
  return join(stateDir, "pid");
}

function substitutePort(command: string[], port: number): string[] {
  const portStr = String(port);
  return command.map((arg) => arg.replace(/{PORT}/g, portStr));
}

function unsafeScope(): Refusal {
  return {
    category: "unsafe_scope",
    reason: "Safe worktree scope cannot be determined: worktree ID is absent."
  };
}

function providerFailure(reason: string): Refusal {
  return { category: "provider_failure", reason };
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function readPid(stateDir: string): Promise<number | null> {
  const pidPath = pidFilePath(stateDir);
  if (!existsSync(pidPath)) return null;
  try {
    const raw = await readFile(pidPath, "utf8");
    const pid = parseInt(raw.trim(), 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

async function terminateIfRunning(stateDir: string): Promise<void> {
  const pid = await readPid(stateDir);
  if (pid === null || !isProcessAlive(pid)) return;

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }

  const deadline = Date.now() + 500;
  while (Date.now() < deadline && isProcessAlive(pid)) {
    await new Promise<void>((resolve) => setTimeout(resolve, 25));
  }

  if (isProcessAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // already gone
    }
  }
}

export function createProcessPortScopedProvider(
  config: ProcessPortScopedProviderConfig
): ResourceProvider {
  return {
    capabilities: {
      reset: true,
      cleanup: true
    },

    deriveResource({ resource, worktree }): DerivedResourcePlan | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      const port = derivePort(worktree.id, resource.name, config.basePort);

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: "process-port-scoped",
        worktreeId: worktree.id,
        handle: deriveHandle(port)
      };
    },

    async resetResource({ resource, worktree }): Promise<ResourceReset | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      const port = derivePort(worktree.id, resource.name, config.basePort);
      const stateDir = deriveStateDir(config.baseDir, resource.name, worktree.id);

      await terminateIfRunning(stateDir);
      await mkdir(stateDir, { recursive: true });

      const resolvedCommand = substitutePort(config.command, port);
      const [cmd, ...args] = resolvedCommand as [string, ...string[]];

      const { spawn } = await import("node:child_process");
      const child = spawn(cmd, args, {
        detached: true,
        stdio: "ignore"
      });
      child.unref();

      if (child.pid === undefined) {
        return providerFailure(
          `Failed to launch process for resource "${resource.name}": spawn did not return a PID.`
        );
      }

      const pid = child.pid;
      await writeFile(pidFilePath(stateDir), String(pid), "utf8");

      // Liveness check: poll for up to READINESS_MS; fail fast if process dies early.
      const READINESS_MS = 500;
      const deadline = Date.now() + READINESS_MS;
      while (Date.now() < deadline) {
        if (!isProcessAlive(pid)) {
          await rm(pidFilePath(stateDir), { force: true });
          return providerFailure(
            `Process for resource "${resource.name}" exited immediately after launch.`
          );
        }
        await new Promise<void>((resolve) => setTimeout(resolve, 25));
      }
      if (!isProcessAlive(pid)) {
        await rm(pidFilePath(stateDir), { force: true });
        return providerFailure(
          `Process for resource "${resource.name}" exited immediately after launch.`
        );
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: worktree.id,
        capability: "reset"
      };
    },

    async cleanupResource({ resource, worktree }): Promise<ResourceCleanup | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      const stateDir = deriveStateDir(config.baseDir, resource.name, worktree.id);
      await terminateIfRunning(stateDir);
      await rm(stateDir, { recursive: true, force: true });

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: worktree.id,
        capability: "cleanup"
      };
    }
  };
}
