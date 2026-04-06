import { join } from "node:path";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import type {
  ResourceProvider,
  DerivedResourcePlan,
  ResourceReset,
  ResourceCleanup,
  Refusal
} from "@multiverse/provider-contracts";

export interface ProcessScopedProviderConfig {
  baseDir: string;
  command: string[];
}

function unsafeScope(): Refusal {
  return {
    category: "unsafe_scope",
    reason: "Safe worktree scope cannot be determined: worktree ID is absent."
  };
}

function providerFailure(reason: string): Refusal {
  return {
    category: "provider_failure",
    reason
  };
}

function deriveStateDir(baseDir: string, resourceName: string, worktreeId: string): string {
  return join(baseDir, resourceName, worktreeId) + "/";
}

function pidFilePath(stateDir: string): string {
  return join(stateDir, "pid");
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
    // process may have already exited between the check and the kill
    return;
  }

  // Wait up to 500ms for graceful exit, then force-kill
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

export function createProcessScopedProvider(config: ProcessScopedProviderConfig): ResourceProvider {
  const [cmd, ...cmdArgs] = config.command;

  return {
    capabilities: {
      reset: true,
      cleanup: true
    },

    deriveResource({ resource, worktree }): DerivedResourcePlan | Refusal {
      if (!worktree.id) {
        return unsafeScope();
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        isolationStrategy: "process-scoped",
        worktreeId: worktree.id,
        handle: deriveStateDir(config.baseDir, resource.name, worktree.id)
      };
    },

    async resetResource({ resource, derived, worktree }): Promise<ResourceReset | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      const stateDir = derived.handle;
      await terminateIfRunning(stateDir);
      await mkdir(stateDir, { recursive: true });

      const { spawn } = await import("node:child_process");
      const child = spawn(cmd ?? config.command[0], cmdArgs, {
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

      // Liveness check: wait 100ms and verify the process has not already exited
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      if (!isProcessAlive(pid)) {
        await rm(pidFilePath(stateDir), { force: true });
        return providerFailure(
          `Process for resource "${resource.name}" exited immediately after launch.`
        );
      }

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "reset"
      };
    },

    async cleanupResource({ resource, derived, worktree }): Promise<ResourceCleanup | Refusal> {
      if (!worktree.id) {
        return unsafeScope();
      }

      const stateDir = derived.handle;
      await terminateIfRunning(stateDir);
      await rm(stateDir, { recursive: true, force: true });

      return {
        resourceName: resource.name,
        provider: resource.provider,
        worktreeId: derived.worktreeId,
        capability: "cleanup"
      };
    }
  };
}
