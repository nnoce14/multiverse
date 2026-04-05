import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("Development Slice 12 acceptance", () => {
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

  it("executes one explicit scoped cleanup through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: true
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
      "cleanup",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-cleanup",
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
              provider: "test-resource-provider-with-cleanup",
              isolationStrategy: "name-scoped",
              worktreeId: "wt-cli-cleanup",
              handle: "primary-db--wt-cli-cleanup"
            }
          ],
          resourceCleanups: [
            {
              resourceName: "primary-db",
              provider: "test-resource-provider-with-cleanup",
              worktreeId: "wt-cli-cleanup",
              capability: "cleanup"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("requires an explicit providers module for cleanup", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: true
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
      "cleanup",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-cleanup"
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [],
      stderr: ["Missing required option --providers"]
    });
  });

  it("returns unsupported cleanup capability unchanged through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: true
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
      "cleanup",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-cleanup-unsupported",
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
              'Resource provider "test-resource-provider" does not support cleanup.'
          }
        })
      ],
      stderr: []
    });
  });

  it("returns invalid cleanup intent unchanged through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
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
      "cleanup",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-cleanup-not-intended",
      "--providers",
      providersModulePath
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [
        JSON.stringify({
          ok: false,
          refusal: {
            category: "invalid_configuration",
            reason:
              "No resources declare scoped cleanup intent. Cleanup requires at least one resource with scopedCleanup: true."
          }
        })
      ],
      stderr: []
    });
  });

  it("returns unsafe cleanup scope unchanged through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-with-cleanup",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: true
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
      "cleanup",
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
