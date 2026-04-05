import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("Development Slice 11 acceptance", () => {
  const tempDirs: string[] = [];

  afterEach(async () => {
    await Promise.all(
      tempDirs.map((dir) => rm(dir, { recursive: true, force: true }))
    );
    tempDirs.length = 0;
  });

  const providersModulePath = fileURLToPath(
    new URL("./fixtures/explicit-test-providers.ts", import.meta.url)
  );

  async function writeRepositoryConfig(config: unknown): Promise<string> {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");

    await writeFile(configPath, JSON.stringify(config));

    return configPath;
  }

  it("executes one explicit scoped reset through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-reset",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    const outcome = await runCli([
      "reset",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-reset",
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
              resourceName: "primary-db",
              provider: "test-resource-provider-with-reset",
              isolationStrategy: "name-scoped",
              worktreeId: "wt-cli-reset",
              handle: "primary-db--wt-cli-reset"
            }
          ],
          resourceResets: [
            {
              resourceName: "primary-db",
              provider: "test-resource-provider-with-reset",
              worktreeId: "wt-cli-reset",
              capability: "reset"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("requires an explicit providers module for reset", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-reset",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    const outcome = await runCli([
      "reset",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-reset"
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [],
      stderr: ["Missing required option --providers"]
    });
  });

  it("returns unsupported reset capability unchanged through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    const outcome = await runCli([
      "reset",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-reset-unsupported",
      "--providers",
      providersModulePath
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [
        JSON.stringify({
          ok: false,
          refusal: {
            category: "unsupported_capability",
            reason:
              'Resource provider "test-resource-provider" does not support reset.'
          }
        })
      ],
      stderr: []
    });
  });

  it("returns unsafe reset scope unchanged through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-reset",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: true,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "app-base-url",
          role: "application-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    const outcome = await runCli([
      "reset",
      "--config",
      configPath,
      "--worktree-id",
      "   ",
      "--providers",
      providersModulePath
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [
        JSON.stringify({
          ok: false,
          refusal: {
            category: "unsafe_scope",
            reason: "Safe worktree scope cannot be determined."
          }
        })
      ],
      stderr: []
    });
  });
});
