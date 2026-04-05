import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("Development Slice 10 acceptance", () => {
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

  it("accepts valid raw worktree identity input through the CLI", async () => {
    const outcome = await runCli([
      "validate-worktree",
      "--worktree-id",
      "wt-cli-valid"
    ]);

    expect(outcome).toEqual({
      exitCode: 0,
      stdout: [
        JSON.stringify({
          ok: true,
          value: {
            kind: "worktree_identity",
            value: "wt-cli-valid"
          }
        })
      ],
      stderr: []
    });
  });

  it("rejects invalid raw worktree identity input through the CLI", async () => {
    const outcome = await runCli([
      "validate-worktree",
      "--worktree-id",
      "   "
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [
        JSON.stringify({
          ok: false,
          errors: [
            {
              path: "worktreeId",
              code: "invalid_value"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("accepts valid raw repository configuration input through the CLI", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");

    await writeFile(
      configPath,
      JSON.stringify({
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
      })
    );

    const outcome = await runCli([
      "validate-repository",
      "--config",
      configPath
    ]);

    expect(outcome).toEqual({
      exitCode: 0,
      stdout: [
        JSON.stringify({
          ok: true,
          value: {
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
          }
        })
      ],
      stderr: []
    });
  });

  it("rejects invalid raw repository configuration input through the CLI", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");

    await writeFile(
      configPath,
      JSON.stringify({
        resources: [
          {
            name: "primary-db",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: [
          {
            name: "app-base-url",
            provider: "test-endpoint-provider"
          }
        ]
      })
    );

    const outcome = await runCli([
      "validate-repository",
      "--config",
      configPath
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [
        JSON.stringify({
          ok: false,
          errors: [
            {
              path: "resources[0].provider",
              code: "required"
            },
            {
              path: "endpoints[0].role",
              code: "required"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("derives one explicit scoped resource plan and endpoint mapping through the CLI", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");

    await writeFile(
      configPath,
      JSON.stringify({
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
      })
    );

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-derive",
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
              worktreeId: "wt-cli-derive",
              handle: "primary-db--wt-cli-derive"
            }
          ],
          endpointMappings: [
            {
              endpointName: "app-base-url",
              provider: "test-endpoint-provider",
              role: "application-base-url",
              worktreeId: "wt-cli-derive",
              address: "http://wt-cli-derive.local/app-base-url"
            }
          ]
        })
      ],
      stderr: []
    });
  });

  it("requires an explicit providers module for derive instead of falling back implicitly", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");

    await writeFile(
      configPath,
      JSON.stringify({
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
      })
    );

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-cli-derive"
    ]);

    expect(outcome).toEqual({
      exitCode: 1,
      stdout: [],
      stderr: ["Missing required option --providers"]
    });
  });
});
