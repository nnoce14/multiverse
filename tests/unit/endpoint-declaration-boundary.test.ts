import { describe, expect, it, vi } from "vitest";

import {
  validateEndpointDeclaration,
  withValidatedEndpointDeclaration
} from "../../packages/core/index";

describe("endpoint declaration boundary validation", () => {
  it("accepts a valid endpoint declaration and returns a trusted representation", () => {
    expect(
      validateEndpointDeclaration({
        name: "app-base-url",
        role: "application-base-url",
        provider: "test-endpoint-provider"
      })
    ).toEqual({
      ok: true,
      value: {
        name: "app-base-url",
        role: "application-base-url",
        provider: "test-endpoint-provider"
      }
    });
  });

  it("returns structured errors for missing required endpoint fields", () => {
    expect(
      validateEndpointDeclaration({
        role: "application-base-url"
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "name",
          code: "required"
        },
        {
          path: "provider",
          code: "required"
        }
      ]
    });
  });

  it("does not invoke downstream logic when endpoint declaration validation fails", () => {
    const downstream = vi.fn();

    const outcome = withValidatedEndpointDeclaration(
      {
        name: "app-base-url",
        provider: "test-endpoint-provider"
      },
      downstream
    );

    expect(outcome).toEqual({
      ok: false,
      errors: [
        {
          path: "role",
          code: "required"
        }
      ]
    });
    expect(downstream).not.toHaveBeenCalled();
  });
});
