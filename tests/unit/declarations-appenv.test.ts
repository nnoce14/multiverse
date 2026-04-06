/**
 * Unit tests for appEnv validation in resource and endpoint declaration boundaries.
 *
 * These cover the new DeclarationValidationError codes introduced in dev-slice-27:
 *   - "invalid_env_var_name" — appEnv is present but fails the valid name pattern
 *   - "reserved_name"        — appEnv begins with MULTIVERSE_
 *   - "duplicate_appenv"     — same appEnv value appears in more than one declaration
 *   - "invalid_appenv_mapping_kind" — endpoint typed mapping uses an unsupported value kind
 */

import { describe, expect, it } from "vitest";

import {
  validateRepositoryConfiguration,
  validateEndpointDeclaration
} from "@multiverse/core";
import { createValidRepositoryConfiguration } from "@multiverse/providers-testkit";

// ---------------------------------------------------------------------------
// Resource declaration — appEnv field
// ---------------------------------------------------------------------------

describe("resource declaration appEnv validation", () => {
  it("passes through a valid appEnv on a resource", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: "DATABASE_URL"
          }
        ]
      })
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.resources[0]?.appEnv).toBe("DATABASE_URL");
  });

  it("passes when appEnv is absent (optional field)", () => {
    const result = validateRepositoryConfiguration(createValidRepositoryConfiguration());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.resources[0]?.appEnv).toBeUndefined();
  });

  it("rejects an empty string appEnv on a resource", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: ""
          }
        ]
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects an appEnv name with hyphens", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: "has-hyphen"
          }
        ]
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects an appEnv name starting with a digit", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: "1_INVALID"
          }
        ]
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects an appEnv name that uses the reserved MULTIVERSE_ prefix", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: "MULTIVERSE_MY_DB"
          }
        ]
      })
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "reserved_name" })
    );
  });

  it("accepts an appEnv starting with an underscore", () => {
    const result = validateRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            isolationStrategy: "name-scoped",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false,
            appEnv: "_INTERNAL_DB"
          }
        ]
      })
    );

    expect(result.ok).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Endpoint declaration — appEnv field
// ---------------------------------------------------------------------------

describe("endpoint declaration appEnv validation", () => {
  it("passes through a valid appEnv on an endpoint", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: "APP_HTTP_URL"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.appEnv).toBe("APP_HTTP_URL");
  });

  it("passes when endpoint appEnv is absent", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port"
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.appEnv).toBeUndefined();
  });

  it("rejects an empty string appEnv on an endpoint", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: ""
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects an appEnv with spaces on an endpoint", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: "has space"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects an endpoint appEnv with the reserved MULTIVERSE_ prefix", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: "MULTIVERSE_HTTP_PORT"
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "reserved_name" })
    );
  });

  it("accepts a typed endpoint appEnv mapping with url and port", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: {
        APP_HTTP_URL: "url",
        PORT: "port"
      }
    });

    expect(result.ok).toBe(true);
  });

  it("rejects an empty typed endpoint appEnv mapping", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: {}
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects a typed endpoint appEnv mapping with an invalid env name", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: {
        "BAD-NAME": "port"
      }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_env_var_name" })
    );
  });

  it("rejects a typed endpoint appEnv mapping with a reserved env name", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: {
        MULTIVERSE_PORT: "port"
      }
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "reserved_name" })
    );
  });

  it("rejects a typed endpoint appEnv mapping with an unsupported value kind", () => {
    const result = validateEndpointDeclaration({
      name: "http",
      role: "application-http",
      provider: "local-port",
      appEnv: {
        PORT: "hostname"
      } as unknown as NonNullable<Parameters<typeof validateEndpointDeclaration>[0]["appEnv"]>
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "invalid_appenv_mapping_kind" })
    );
  });
});

// ---------------------------------------------------------------------------
// Cross-declaration duplicate appEnv check
// ---------------------------------------------------------------------------

describe("cross-declaration duplicate appEnv validation", () => {
  it("rejects a config where two resources share the same appEnv", () => {
    const result = validateRepositoryConfiguration({
      resources: [
        {
          name: "db-a",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DB_HANDLE"
        },
        {
          name: "db-b",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DB_HANDLE"
        }
      ],
      endpoints: []
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "duplicate_appenv" })
    );
  });

  it("rejects a config where a resource and an endpoint share the same appEnv", () => {
    const result = validateRepositoryConfiguration({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "MY_VAR"
        }
      ],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: "MY_VAR"
        }
      ]
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "duplicate_appenv" })
    );
  });

  it("accepts distinct appEnv names across all declarations", () => {
    const result = validateRepositoryConfiguration({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "DATABASE_URL"
        }
      ],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: "PORT"
        }
      ]
    });

    expect(result.ok).toBe(true);
  });

  it("rejects a config where an endpoint typed appEnv name duplicates another declaration", () => {
    const result = validateRepositoryConfiguration({
      resources: [
        {
          name: "primary-db",
          provider: "test-resource-provider",
          isolationStrategy: "name-scoped",
          scopedValidate: false,
          scopedReset: false,
          scopedCleanup: false,
          appEnv: "PORT"
        }
      ],
      endpoints: [
        {
          name: "http",
          role: "application-http",
          provider: "test-endpoint-provider",
          appEnv: {
            PORT: "port",
            APP_HTTP_URL: "url"
          }
        }
      ]
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "duplicate_appenv" })
    );
  });

  it("accepts a config where no declarations have appEnv (no duplicate check needed)", () => {
    const result = validateRepositoryConfiguration(createValidRepositoryConfiguration());
    expect(result.ok).toBe(true);
  });
});
