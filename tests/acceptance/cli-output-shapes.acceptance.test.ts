import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { afterEach, describe, expect, it } from "vitest";

import { runCli, type ChildProcessRunner } from "../../apps/cli/src/index";

/**
 * Acceptance tests for Slice 51: CLI output-shape specification.
 *
 * These tests make the output contract in docs/spec/cli-output-shapes.md
 * executable. They verify field names, output routing (stdout vs stderr),
 * and the one-JSON-line-per-invocation rule for each primary command.
 */
describe("CLI output shapes (Slice 51)", () => {
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
    const tempDir = await mkdtemp(path.join(tmpdir(), "multiverse-shapes-"));
    tempDirs.push(tempDir);
    const configPath = path.join(tempDir, "repository.json");
    await writeFile(configPath, JSON.stringify(config));
    return configPath;
  }

  const baseConfig = {
    resources: [
      {
        name: "app-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: [
      {
        name: "http",
        role: "application-http",
        provider: "test-endpoint-provider"
      }
    ]
  };

  const validateConfig = {
    resources: [
      {
        name: "app-db",
        provider: "test-resource-provider",
        isolationStrategy: "name-scoped",
        scopedValidate: true,
        scopedReset: false,
        scopedCleanup: false
      }
    ],
    endpoints: [
      {
        name: "http",
        role: "application-http",
        provider: "test-endpoint-provider"
      }
    ]
  };

  const resetConfig = {
    resources: [
      {
        name: "app-db",
        provider: "test-resource-provider-with-reset",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: true,
        scopedCleanup: false
      }
    ],
    endpoints: []
  };

  const cleanupConfig = {
    resources: [
      {
        name: "app-db",
        provider: "test-resource-provider-with-cleanup",
        isolationStrategy: "name-scoped",
        scopedValidate: false,
        scopedReset: false,
        scopedCleanup: true
      }
    ],
    endpoints: []
  };

  // ── derive (JSON format) ──────────────────────────────────────────────────

  describe("derive (JSON format)", () => {
    it("success: one JSON line to stdout, exit 0, stderr empty", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-derive",
        "--providers", providersModulePath
      ]);

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout).toHaveLength(1);
      expect(() => JSON.parse(outcome.stdout[0]!)).not.toThrow();
    });

    it("success: top-level shape has ok, resourcePlans, endpointMappings", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-derive",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      expect(parsed.ok).toBe(true);
      expect(Array.isArray(parsed.resourcePlans)).toBe(true);
      expect(Array.isArray(parsed.endpointMappings)).toBe(true);
    });

    it("success: DerivedResourcePlan has required fields", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-derive",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      const plan = parsed.resourcePlans[0];
      expect(plan).toHaveProperty("resourceName");
      expect(plan).toHaveProperty("provider");
      expect(plan).toHaveProperty("isolationStrategy");
      expect(plan).toHaveProperty("worktreeId");
      expect(plan).toHaveProperty("handle");
    });

    it("success: DerivedEndpointMapping has required fields", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-derive",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      const mapping = parsed.endpointMappings[0];
      expect(mapping).toHaveProperty("endpointName");
      expect(mapping).toHaveProperty("provider");
      expect(mapping).toHaveProperty("role");
      expect(mapping).toHaveProperty("worktreeId");
      expect(mapping).toHaveProperty("address");
    });

    it("failure (refusal): one JSON line to stdout, exit 1, stderr empty", async () => {
      const configPath = await writeRepositoryConfig({
        resources: [
          {
            name: "app-db",
            provider: "nonexistent-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: []
      });

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-derive-fail",
        "--providers", providersModulePath
      ]);

      expect(outcome.exitCode).toBe(1);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout).toHaveLength(1);
      const parsed = JSON.parse(outcome.stdout[0]!);
      expect(parsed.ok).toBe(false);
      expect(parsed.refusal).toHaveProperty("category");
      expect(parsed.refusal).toHaveProperty("reason");
      expect(typeof parsed.refusal.category).toBe("string");
      expect(typeof parsed.refusal.reason).toBe("string");
    });
  });

  // ── derive (env format) ───────────────────────────────────────────────────

  describe("derive (--format=env)", () => {
    it("success: KEY=VALUE lines to stdout, exit 0, stderr empty", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-env",
        "--providers", providersModulePath,
        "--format", "env"
      ]);

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout.length).toBeGreaterThan(0);
    });

    it("success: resource lines use MULTIVERSE_RESOURCE_ prefix", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-env",
        "--providers", providersModulePath,
        "--format", "env"
      ]);

      const resourceLine = outcome.stdout.find((l) => l.startsWith("MULTIVERSE_RESOURCE_"));
      expect(resourceLine).toBeDefined();
      expect(resourceLine).toContain("=");
    });

    it("success: endpoint lines use MULTIVERSE_ENDPOINT_ prefix", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);

      const outcome = await runCli([
        "derive",
        "--config", configPath,
        "--worktree-id", "wt-shape-env",
        "--providers", providersModulePath,
        "--format", "env"
      ]);

      const endpointLine = outcome.stdout.find((l) => l.startsWith("MULTIVERSE_ENDPOINT_"));
      expect(endpointLine).toBeDefined();
      expect(endpointLine).toContain("=");
    });
  });

  // ── validate ─────────────────────────────────────────────────────────────

  describe("validate", () => {
    it("success: one JSON line to stdout, exit 0, stderr empty", async () => {
      const configPath = await writeRepositoryConfig(validateConfig);

      const outcome = await runCli([
        "validate",
        "--config", configPath,
        "--worktree-id", "wt-shape-validate",
        "--providers", providersModulePath
      ]);

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout).toHaveLength(1);
      expect(() => JSON.parse(outcome.stdout[0]!)).not.toThrow();
    });

    it("success: shape has ok, resourcePlans, endpointMappings, resourceValidations", async () => {
      const configPath = await writeRepositoryConfig(validateConfig);

      const outcome = await runCli([
        "validate",
        "--config", configPath,
        "--worktree-id", "wt-shape-validate",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      expect(parsed.ok).toBe(true);
      expect(Array.isArray(parsed.resourcePlans)).toBe(true);
      expect(Array.isArray(parsed.endpointMappings)).toBe(true);
      expect(Array.isArray(parsed.resourceValidations)).toBe(true);
    });

    it("success: ResourceValidation entries have resourceName, provider, worktreeId, capability", async () => {
      const configPath = await writeRepositoryConfig(validateConfig);

      const outcome = await runCli([
        "validate",
        "--config", configPath,
        "--worktree-id", "wt-shape-validate",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      const validation = parsed.resourceValidations[0];
      expect(validation).toHaveProperty("resourceName");
      expect(validation).toHaveProperty("provider");
      expect(validation).toHaveProperty("worktreeId");
      expect(validation.capability).toBe("validate");
    });
  });

  // ── reset ─────────────────────────────────────────────────────────────────

  describe("reset", () => {
    it("success: one JSON line to stdout, exit 0, stderr empty", async () => {
      const configPath = await writeRepositoryConfig(resetConfig);

      const outcome = await runCli([
        "reset",
        "--config", configPath,
        "--worktree-id", "wt-shape-reset",
        "--providers", providersModulePath
      ]);

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout).toHaveLength(1);
      expect(() => JSON.parse(outcome.stdout[0]!)).not.toThrow();
    });

    it("success: shape has ok, resourcePlans, resourceResets", async () => {
      const configPath = await writeRepositoryConfig(resetConfig);

      const outcome = await runCli([
        "reset",
        "--config", configPath,
        "--worktree-id", "wt-shape-reset",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      expect(parsed.ok).toBe(true);
      expect(Array.isArray(parsed.resourcePlans)).toBe(true);
      expect(Array.isArray(parsed.resourceResets)).toBe(true);
    });

    it("success: ResourceReset entries have resourceName, provider, worktreeId, capability", async () => {
      const configPath = await writeRepositoryConfig(resetConfig);

      const outcome = await runCli([
        "reset",
        "--config", configPath,
        "--worktree-id", "wt-shape-reset",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      const resetEntry = parsed.resourceResets[0];
      expect(resetEntry).toHaveProperty("resourceName");
      expect(resetEntry).toHaveProperty("provider");
      expect(resetEntry).toHaveProperty("worktreeId");
      expect(resetEntry.capability).toBe("reset");
    });
  });

  // ── cleanup ───────────────────────────────────────────────────────────────

  describe("cleanup", () => {
    it("success: one JSON line to stdout, exit 0, stderr empty", async () => {
      const configPath = await writeRepositoryConfig(cleanupConfig);

      const outcome = await runCli([
        "cleanup",
        "--config", configPath,
        "--worktree-id", "wt-shape-cleanup",
        "--providers", providersModulePath
      ]);

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stderr).toHaveLength(0);
      expect(outcome.stdout).toHaveLength(1);
      expect(() => JSON.parse(outcome.stdout[0]!)).not.toThrow();
    });

    it("success: shape has ok, resourcePlans, resourceCleanups", async () => {
      const configPath = await writeRepositoryConfig(cleanupConfig);

      const outcome = await runCli([
        "cleanup",
        "--config", configPath,
        "--worktree-id", "wt-shape-cleanup",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      expect(parsed.ok).toBe(true);
      expect(Array.isArray(parsed.resourcePlans)).toBe(true);
      expect(Array.isArray(parsed.resourceCleanups)).toBe(true);
    });

    it("success: ResourceCleanup entries have resourceName, provider, worktreeId, capability", async () => {
      const configPath = await writeRepositoryConfig(cleanupConfig);

      const outcome = await runCli([
        "cleanup",
        "--config", configPath,
        "--worktree-id", "wt-shape-cleanup",
        "--providers", providersModulePath
      ]);

      const parsed = JSON.parse(outcome.stdout[0]!);
      const cleanupEntry = parsed.resourceCleanups[0];
      expect(cleanupEntry).toHaveProperty("resourceName");
      expect(cleanupEntry).toHaveProperty("provider");
      expect(cleanupEntry).toHaveProperty("worktreeId");
      expect(cleanupEntry.capability).toBe("cleanup");
    });
  });

  // ── run ───────────────────────────────────────────────────────────────────

  describe("run", () => {
    it("success: stdout and stderr empty (transparent pass-through)", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);
      const runner: ChildProcessRunner = async () => ({ exitCode: 0 });

      const outcome = await runCli(
        [
          "run",
          "--config", configPath,
          "--worktree-id", "wt-shape-run",
          "--providers", providersModulePath,
          "--",
          "node",
          "-e",
          ""
        ],
        { runner }
      );

      expect(outcome.exitCode).toBe(0);
      expect(outcome.stdout).toHaveLength(0);
      expect(outcome.stderr).toHaveLength(0);
    });

    it("success: exit code reflects child process exit code", async () => {
      const configPath = await writeRepositoryConfig(baseConfig);
      const runner: ChildProcessRunner = async () => ({ exitCode: 42 });

      const outcome = await runCli(
        [
          "run",
          "--config", configPath,
          "--worktree-id", "wt-shape-run-exit",
          "--providers", providersModulePath,
          "--",
          "node",
          "-e",
          "process.exit(42)"
        ],
        { runner }
      );

      expect(outcome.exitCode).toBe(42);
      expect(outcome.stdout).toHaveLength(0);
      expect(outcome.stderr).toHaveLength(0);
    });

    it("refusal: JSON written to stderr, stdout empty, exit 1", async () => {
      // Refusal is triggered by an invalid provider reference
      const configPath = await writeRepositoryConfig({
        resources: [
          {
            name: "app-db",
            provider: "nonexistent-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ],
        endpoints: []
      });

      const outcome = await runCli([
        "run",
        "--config", configPath,
        "--worktree-id", "wt-shape-run-refusal",
        "--providers", providersModulePath,
        "--",
        "node",
        "-e",
        ""
      ]);

      expect(outcome.exitCode).toBe(1);
      expect(outcome.stdout).toHaveLength(0);
      expect(outcome.stderr).toHaveLength(1);
      const parsed = JSON.parse(outcome.stderr[0]!);
      expect(parsed.ok).toBe(false);
      expect(parsed.refusal).toHaveProperty("category");
      expect(parsed.refusal).toHaveProperty("reason");
    });
  });
});
