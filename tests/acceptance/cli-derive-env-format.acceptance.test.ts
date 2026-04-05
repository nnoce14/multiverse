import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli } from "../../apps/cli/src/index";

describe("CLI derive --format=env", () => {
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
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-cli-env-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  const baseConfig = {
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
  };

  it("emits KEY=VALUE pairs when --format=env is specified", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-env-test",
      "--providers",
      providersModulePath,
      "--format",
      "env"
    ]);

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toEqual([]);
    expect(outcome.stdout).toContain("MULTIVERSE_RESOURCE_PRIMARY_DB=primary-db--wt-env-test");
    expect(outcome.stdout).toContain("MULTIVERSE_ENDPOINT_APP_BASE_URL=http://wt-env-test.local/app-base-url");
  });

  it("emits JSON when --format=json is specified (no regression)", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-json-test",
      "--providers",
      providersModulePath,
      "--format",
      "json"
    ]);

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toEqual([]);
    expect(outcome.stdout).toHaveLength(1);
    const parsed = JSON.parse(outcome.stdout[0]!);
    expect(parsed.ok).toBe(true);
    expect(parsed.resourcePlans).toBeDefined();
    expect(parsed.endpointMappings).toBeDefined();
  });

  it("emits JSON when no --format is specified (default behavior unchanged)", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-default-test",
      "--providers",
      providersModulePath
    ]);

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toEqual([]);
    expect(outcome.stdout).toHaveLength(1);
    const parsed = JSON.parse(outcome.stdout[0]!);
    expect(parsed.ok).toBe(true);
  });

  it("exits non-zero with usage error when --format is an unknown value", async () => {
    const configPath = await writeRepositoryConfig(baseConfig);

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-bad-format",
      "--providers",
      providersModulePath,
      "--format",
      "xml"
    ]);

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toEqual([]);
    expect(outcome.stderr[0]).toMatch(/unknown.*format/i);
  });

  it("emits refusal as JSON to stdout and exits non-zero when derive fails with --format=env", async () => {
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
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "",
      "--providers",
      providersModulePath,
      "--format",
      "env"
    ]);

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stderr).toEqual([]);
    const parsed = JSON.parse(outcome.stdout[0]!);
    expect(parsed.ok).toBe(false);
    expect(parsed.refusal).toBeDefined();
  });

  it("uses deterministic uppercase key names with underscores for hyphenated resource names", async () => {
    const configPath = await writeRepositoryConfig({
      resources: [
        {
          name: "my-primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false
        }
      ],
      endpoints: [
        {
          name: "admin-api-url",
          role: "admin-base-url",
          provider: "test-endpoint-provider"
        }
      ]
    });

    const outcome = await runCli([
      "derive",
      "--config",
      configPath,
      "--worktree-id",
      "wt-naming",
      "--providers",
      providersModulePath,
      "--format",
      "env"
    ]);

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stdout).toContain("MULTIVERSE_RESOURCE_MY_PRIMARY_DB=my-primary-db--wt-naming");
    expect(outcome.stdout).toContain("MULTIVERSE_ENDPOINT_ADMIN_API_URL=http://wt-naming.local/admin-api-url");
  });
});
