/**
 * Non-first-party provider fixture.
 *
 * Authored using only @multiverse/provider-contracts — no concrete provider
 * package imports, no core internals. This is the same pattern a second author
 * would follow using the provider authoring guide.
 *
 * Exported as named "providers" per the guide's registration convention.
 */
import type {
  ResourceProvider,
  EndpointProvider,
  DerivedResourcePlan,
  DerivedEndpointMapping,
  Refusal
} from "@multiverse/provider-contracts";

const myResourceProvider: ResourceProvider = {
  deriveResource({ resource, worktree }) {
    if (!worktree.id) {
      return {
        category: "unsafe_scope",
        reason: "Worktree identity is required."
      } satisfies Refusal;
    }
    return {
      resourceName: resource.name,
      provider: resource.provider,
      isolationStrategy: resource.isolationStrategy,
      worktreeId: worktree.id,
      handle: `${resource.name}_${worktree.id}`
    } satisfies DerivedResourcePlan;
  }
};

const myEndpointProvider: EndpointProvider = {
  deriveEndpoint({ endpoint, worktree }) {
    if (!worktree.id) {
      return {
        category: "unsafe_scope",
        reason: "Worktree identity is required."
      } satisfies Refusal;
    }
    return {
      endpointName: endpoint.name,
      provider: endpoint.provider,
      role: endpoint.role,
      worktreeId: worktree.id,
      address: `http://localhost:9000`
    } satisfies DerivedEndpointMapping;
  }
};

export const providers = {
  resources: {
    "my-resource-provider": myResourceProvider
  },
  endpoints: {
    "my-endpoint-provider": myEndpointProvider
  }
};
