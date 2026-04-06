import { describe, it, expect } from "vitest";
import type { EndpointProvider, DerivedEndpointMapping, Refusal } from "@multiverse/provider-contracts";
import { createLocalPortProvider } from "@multiverse/provider-local-port";
import { createFixedHostPortProvider } from "@multiverse/provider-fixed-host-port";

function isRefusal(value: DerivedEndpointMapping | Refusal): value is Refusal {
  return "category" in value && "reason" in value;
}

function isDerivedEndpointMapping(value: DerivedEndpointMapping | Refusal): value is DerivedEndpointMapping {
  return "endpointName" in value && "address" in value;
}

const providerCases: Array<{
  name: string;
  provider: EndpointProvider;
  validInput: {
    endpoint: {
      name: string;
      role: string;
      provider: string;
      host?: string;
      basePort?: number;
    };
    worktree: {
      id: string;
      label: string;
      branch: string;
    };
  };
  addressPattern: RegExp;
}> = [
  {
    name: "local-port",
    provider: createLocalPortProvider({ basePort: 4000 }),
    validInput: {
      endpoint: {
        name: "app-base-url",
        role: "application-base-url",
        provider: "local-port"
      },
      worktree: {
        id: "feature-login",
        label: "feature/login",
        branch: "feature/login"
      }
    },
    addressPattern: /^http:\/\/localhost:\d+$/
  },
  {
    name: "fixed-host-port",
    provider: createFixedHostPortProvider(),
    validInput: {
      endpoint: {
        name: "app-base-url",
        role: "application-base-url",
        provider: "fixed-host-port",
        host: "127.0.0.1",
        basePort: 5400
      },
      worktree: {
        id: "feature-login",
        label: "feature/login",
        branch: "feature/login"
      }
    },
    addressPattern: /^http:\/\/127\.0\.0\.1:\d+$/
  }
];

describe.each(providerCases)("endpoint provider contract: derive (%s)", ({ provider, validInput, addressPattern }) => {
  it("returns a DerivedEndpointMapping for valid input", () => {
    const result = provider.deriveEndpoint(validInput);

    expect(isDerivedEndpointMapping(result)).toBe(true);
  });

  it("returns a result with the expected shape", () => {
    const result = provider.deriveEndpoint(validInput);

    expect(isDerivedEndpointMapping(result)).toBe(true);
    if (!isDerivedEndpointMapping(result)) return;

    expect(result.endpointName).toBe(validInput.endpoint.name);
    expect(result.provider).toBe(validInput.endpoint.provider);
    expect(result.role).toBe(validInput.endpoint.role);
    expect(result.worktreeId).toBe(validInput.worktree.id);
    expect(result.address).toMatch(addressPattern);
  });

  it("derives different addresses for different endpoint names in the same worktree", () => {
    const resultApp = provider.deriveEndpoint(validInput);
    const resultAdmin = provider.deriveEndpoint({
      ...validInput,
      endpoint: { ...validInput.endpoint, name: "admin-url", role: "admin-base-url" }
    });

    expect(isDerivedEndpointMapping(resultApp)).toBe(true);
    expect(isDerivedEndpointMapping(resultAdmin)).toBe(true);
    if (!isDerivedEndpointMapping(resultApp) || !isDerivedEndpointMapping(resultAdmin)) return;

    expect(resultApp.address).not.toBe(resultAdmin.address);
  });

  it("derives the same address for the same endpoint name and worktree (deterministic)", () => {
    const result1 = provider.deriveEndpoint(validInput);
    const result2 = provider.deriveEndpoint(validInput);

    expect(isDerivedEndpointMapping(result1)).toBe(true);
    expect(isDerivedEndpointMapping(result2)).toBe(true);
    if (!isDerivedEndpointMapping(result1) || !isDerivedEndpointMapping(result2)) return;

    expect(result1.address).toBe(result2.address);
  });

  it("returns unsafe_scope when worktree identity is absent during derive", () => {
    const result = provider.deriveEndpoint({
      ...validInput,
      worktree: {} as typeof validInput.worktree
    });

    expect(isRefusal(result)).toBe(true);
    if (!isRefusal(result)) return;

    expect(result.category).toBe("unsafe_scope");
  });
});
