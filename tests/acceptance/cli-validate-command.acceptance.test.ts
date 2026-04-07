import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("CLI validate command", () => {
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
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-validate-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  it("derives and validates a resource that declares scopedValidate through the CLI", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: true,
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
      "validate",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-validate",
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
              provider: "test-resource-provider",
              isolationStrategy: "name-scoped",
              worktreeId: "wt-cli-validate",
              handle: "primary-db--wt-cli-validate"
            }
          ],
          endpointMappings: [
            {
              endpointName: "app-base-url",
              provider: "test-endpoint-provider",
              role: "application-base-url",
              worktreeId: "wt-cli-validate",
              address: "http://wt-cli-validate.local/app-base-url"
            }
          ],
          resourceValidations: [
            {
              resourceName: "primary-db",
              provider: "test-resource-provider",
              worktreeId: "wt-cli-validate",
              capability: "validate"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("succeeds with empty resourceValidations when no resources declare scopedValidate", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
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
      "validate",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-validate-none",
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
              provider: "test-resource-provider",
              isolationStrategy: "name-scoped",
              worktreeId: "wt-cli-validate-none",
              handle: "primary-db--wt-cli-validate-none"
            }
          ],
          endpointMappings: [
            {
              endpointName: "app-base-url",
              provider: "test-endpoint-provider",
              role: "application-base-url",
              worktreeId: "wt-cli-validate-none",
              address: "http://wt-cli-validate-none.local/app-base-url"
            }
          ],
          resourceValidations: []
        })
      ],
      stderr: []
    });
  });

  it("returns unsupported_capability refusal when provider does not support validate", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider-no-validate",
          isolationStrategy: "name-scoped",
          scopedValidate: true,
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
      "validate",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-validate-unsupported",
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
            reason: 'Resource provider "test-resource-provider-no-validate" does not support validate.'
          }
        })
      ],
      stderr: []
    });
  });

  it("returns unsafe_scope refusal when worktree identity cannot be established", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: true,
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
      "validate",
      "--config",
      configPath,
      "--worktree-id",
      "",
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

  it("returns usage error directing user to pass --worktree-id when cwd is not inside a git worktree", async () => {
    // Run from a temp directory that is not inside a git repository.
    // Discovery cannot resolve and must refuse with actionable guidance (ADR-0021).
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-validate-test-"));
    tempDirs.push(tempDir);
    // Write a minimal config so the failure is from discovery, not missing config.
    await writeFile(path.join(tempDir, "multiverse.json"), JSON.stringify({ resources: [], endpoints: [] }));

    const outcome = await runCli(
      ["validate", "--providers", providersModulePath],
      { cwd: tempDir }
    );

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr[0]).toMatch(/--worktree-id/);
  });

  it("fails with config file error when --config is omitted and ./multiverse.json does not exist", async () => {
    const outcome = await runCli(["validate", "--worktree-id", "wt-cli-validate", "--providers", providersModulePath]);

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr[0]).toMatch(/multiverse\.json/);
  });
});
