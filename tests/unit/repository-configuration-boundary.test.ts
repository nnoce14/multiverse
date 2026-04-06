import { describe, expect, it, vi } from "vitest";

import {
  validateRepositoryConfiguration,
  withValidatedRepositoryConfiguration
} from "@multiverse/core";
import { createValidRepositoryConfiguration } from "@multiverse/providers-testkit";

describe("repository configuration boundary validation", () => {
  it("accepts a valid repository configuration and returns a trusted representation", () => {
    expect(validateRepositoryConfiguration(createValidRepositoryConfiguration())).toEqual({
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
    });
  });

  it("returns structured errors for missing required resource and endpoint fields", () => {
    expect(
      validateRepositoryConfiguration(
        createValidRepositoryConfiguration({
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
      )
    ).toEqual({
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
    });
  });

  it("does not invoke downstream logic when repository validation fails", () => {
    const downstream = vi.fn();

    const outcome = withValidatedRepositoryConfiguration(
      createValidRepositoryConfiguration({
        resources: [
          {
            name: "primary-db",
            provider: "test-resource-provider",
            scopedValidate: false,
            scopedReset: false,
            scopedCleanup: false
          }
        ]
      }),
      downstream
    );

    expect(outcome).toEqual({
      ok: false,
      errors: [
        {
          path: "resources[0].isolationStrategy",
          code: "required"
        }
      ]
    });
    expect(downstream).not.toHaveBeenCalled();
  });

  it("prefixes fixed-host-port declaration errors with the endpoint index path", () => {
    expect(
      validateRepositoryConfiguration(
        createValidRepositoryConfiguration({
          endpoints: [
            {
              name: "http",
              role: "application-http",
              provider: "fixed-host-port",
              host: "",
              basePort: 70000
            }
          ]
        })
      )
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "endpoints[0].host",
          code: "invalid_value"
        },
        {
          path: "endpoints[0].basePort",
          code: "invalid_value"
        }
      ]
    });
  });
});
