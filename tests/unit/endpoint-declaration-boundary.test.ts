import { describe, expect, it, vi } from "vitest";

import {
  validateEndpointDeclaration,
  withValidatedEndpointDeclaration
} from "@multiverse/core";

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

  it("accepts a valid fixed-host-port endpoint declaration and returns trusted provider config", () => {
    expect(
      validateEndpointDeclaration({
        name: "http",
        role: "application-http",
        provider: "fixed-host-port",
        host: "127.0.0.1",
        basePort: 5400
      })
    ).toEqual({
      ok: true,
      value: {
        name: "http",
        role: "application-http",
        provider: "fixed-host-port",
        host: "127.0.0.1",
        basePort: 5400
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

  it("requires host and basePort for fixed-host-port declarations", () => {
    expect(
      validateEndpointDeclaration({
        name: "http",
        role: "application-http",
        provider: "fixed-host-port"
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "host",
          code: "required"
        },
        {
          path: "basePort",
          code: "required"
        }
      ]
    });
  });

  it("rejects an empty host for fixed-host-port declarations", () => {
    expect(
      validateEndpointDeclaration({
        name: "http",
        role: "application-http",
        provider: "fixed-host-port",
        host: "   ",
        basePort: 5400
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "host",
          code: "invalid_value"
        }
      ]
    });
  });

  it("rejects a non-integer basePort for fixed-host-port declarations", () => {
    expect(
      validateEndpointDeclaration({
        name: "http",
        role: "application-http",
        provider: "fixed-host-port",
        host: "127.0.0.1",
        basePort: 5400.5
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "basePort",
          code: "invalid_value"
        }
      ]
    });
  });

  it("rejects an out-of-range basePort for fixed-host-port declarations", () => {
    expect(
      validateEndpointDeclaration({
        name: "http",
        role: "application-http",
        provider: "fixed-host-port",
        host: "127.0.0.1",
        basePort: 64537
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "basePort",
          code: "invalid_value"
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
