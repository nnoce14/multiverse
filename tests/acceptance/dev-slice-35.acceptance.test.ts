/**
 * Dev Slice 35 acceptance: CLI-level non-first-party provider integration proof.
 *
 * Proves that a provider authored against only @multiverse/provider-contracts —
 * registered in a providers.ts file and declared in multiverse.json — derives
 * correctly when invoked through the CLI derive command.
 *
 * This closes the named scope gap from Slice 32: the core/registry seam was
 * proven there; this proves the full providers.ts → pnpm cli derive path.
 */
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("dev-slice-35: CLI-level non-first-party provider integration proof", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("./fixtures/non-first-party-test-providers.ts", import.meta.url)
  );

  async function writeRepositoryConfig(tempDir: string): Promise<string> {
    const configPath = path.join(tempDir, "multiverse.json");
    await writeFile(
      configPath,
      JSON.stringify({
        resources: [
          {
            name: "cache",
            provider: "my-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app",
            role: "application-http",
            provider: "my-endpoint-provider"
          }
        ]
      })
    );
    return configPath;
  }

  it("derives successfully through the CLI using a non-first-party providers module", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-slice35-"));
    tempDirs.push(tempDir);
    const configPath = await writeRepositoryConfig(tempDir);

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-35-proof",
      "--providers",
      providersModulePath
    ]);

    expect(outcome).toEqual({
      exitCode: 0,
      stdout: [
        JSON.stringify({
          ok: true,
          resourcePlans: [
            {
              resourceName: "cache",
              provider: "my-resource-provider",
              isolationStrategy: "name-scoped",
              worktreeId: "wt-35-proof",
              handle: "cache_wt-35-proof"
            }
          ],
          endpointMappings: [
            {
              endpointName: "app",
              provider: "my-endpoint-provider",
              role: "application-http",
              worktreeId: "wt-35-proof",
              address: "http://localhost:9000"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("produces different handles for different worktree ids", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-slice35-"));
    tempDirs.push(tempDir);
    const configPath = await writeRepositoryConfig(tempDir);

    const outcomeA = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-35-a",
      "--providers",
      providersModulePath
    ]);

    const outcomeB = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-35-b",
      "--providers",
      providersModulePath
    ]);

    expect(outcomeA.exitCode).toBe(0);
    expect(outcomeB.exitCode).toBe(0);

    const resultA = JSON.parse(outcomeA.stdout[0]);
    const resultB = JSON.parse(outcomeB.stdout[0]);

    expect(resultA.resourcePlans[0].handle).not.toBe(resultB.resourcePlans[0].handle);
    expect(resultA.resourcePlans[0].worktreeId).toBe("wt-35-a");
    expect(resultB.resourcePlans[0].worktreeId).toBe("wt-35-b");
  });
});
