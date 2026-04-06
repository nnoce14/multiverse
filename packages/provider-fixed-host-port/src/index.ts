import { createHash } from "node:crypto";
import {
  FIXED_HOST_PORT_PORT_RANGE,
  isValidFixedHostPortBasePort,
  type EndpointProvider,
  type DerivedEndpointMapping,
  type Refusal
} from "@multiverse/provider-contracts";

function derivePort(worktreeId: string, endpointName: string, basePort: number): number {
  const hash = createHash("sha256").update(worktreeId).update(endpointName).digest();
  const offset = hash.readUInt32BE(0) % FIXED_HOST_PORT_PORT_RANGE;
  return basePort + offset;
}

function invalidConfiguration(reason: string): Refusal {
  return {
    category: "invalid_configuration",
    reason
  };
}

function unsafeScope(): Refusal {
  return {
    category: "unsafe_scope",
    reason: "Safe worktree scope cannot be determined: worktree ID is absent."
  };
}

export function createFixedHostPortProvider(): EndpointProvider {
  return {
    deriveEndpoint({ endpoint, worktree }): DerivedEndpointMapping | Refusal {
      const { host, basePort } = endpoint;

      if (!worktree.id) {
        return unsafeScope();
      }

      if (typeof host !== "string" || host.trim().length === 0) {
        return invalidConfiguration(
          `Endpoint "${endpoint.name}" using provider "fixed-host-port" requires a non-empty host.`
        );
      }

      if (!isValidFixedHostPortBasePort(basePort)) {
        return invalidConfiguration(
          `Endpoint "${endpoint.name}" using provider "fixed-host-port" requires an integer basePort in the safe TCP range.`
        );
      }

      const port = derivePort(worktree.id, endpoint.name, basePort);

      return {
        endpointName: endpoint.name,
        provider: endpoint.provider,
        role: endpoint.role,
        worktreeId: worktree.id,
        address: `http://${host}:${port}`
      };
    }
  };
}
