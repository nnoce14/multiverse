import { createHash } from "node:crypto";
import type { EndpointProvider, DerivedEndpointMapping, Refusal } from "@multiverse/provider-contracts";

const PORT_RANGE = 1000;

function derivePort(worktreeId: string, basePort: number): number {
  const hash = createHash("sha256").update(worktreeId).digest();
  const offset = hash.readUInt32BE(0) % PORT_RANGE;
  return basePort + offset;
}

export interface LocalPortProviderConfig {
  basePort: number;
}

export function createLocalPortProvider(config: LocalPortProviderConfig): EndpointProvider {
  return {
    deriveEndpoint({ endpoint, worktree }): DerivedEndpointMapping | Refusal {
      if (!worktree.id) {
        return {
          category: "unsafe_scope",
          reason: "Safe worktree scope cannot be determined: worktree ID is absent."
        };
      }

      const port = derivePort(worktree.id, config.basePort);

      return {
        endpointName: endpoint.name,
        provider: endpoint.provider,
        role: endpoint.role,
        worktreeId: worktree.id,
        address: `http://localhost:${port}`
      };
    }
  };
}
