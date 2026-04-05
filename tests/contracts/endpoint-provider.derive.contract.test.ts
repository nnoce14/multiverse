import { describe, it, expect } from "vitest";
import type { EndpointProvider, DerivedEndpointMapping, Refusal } from "@multiverse/provider-contracts";
import { createLocalPortProvider } from "@multiverse/provider-local-port";

function isRefusal(value: DerivedEndpointMapping | Refusal): value is Refusal {
  return "category" in value && "reason" in value;
}

function isDerivedEndpointMapping(value: DerivedEndpointMapping | Refusal): value is DerivedEndpointMapping {
  return "endpointName" in value && "address" in value;
}

describe("endpoint provider contract: derive", () => {
  const provider: EndpointProvider = createLocalPortProvider({ basePort: 4000 });

  const validInput = {
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
  };

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
    expect(typeof result.address).toBe("string");
    expect(result.address.length).toBeGreaterThan(0);
  });

});
