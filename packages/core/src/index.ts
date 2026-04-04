import type {
  DerivedEndpointMapping,
  DerivedResourcePlan,
  EndpointProvider,
  ProviderRegistry,
  Refusal,
  ResolveSlice01Result,
  ResolveSlice02Result,
  RepositoryConfiguration,
  ResourceValidation,
  ResourceProvider,
  WorktreeInstanceInput
} from "../../provider-contracts/index";
import {
  isFailureResult,
  toValidatedEndpoint,
  toValidatedResource,
  type ValidatedEndpointDeclaration,
  type ValidatedResourceDeclaration
} from "./declarations";
import {
  invalidConfiguration,
  isRefusal,
  unsafeScope,
  unsupportedCapability
} from "./refusals";

export {
  validateWorktreeIdentity,
  withValidatedWorktreeIdentity
} from "./worktree-identity";

function deriveResourcePlan(input: {
  provider: ResourceProvider;
  resource: ValidatedResourceDeclaration;
  worktree: {
    id: string;
    label?: string;
    branch?: string;
  };
}): DerivedResourcePlan | Refusal {
  return input.provider.deriveResource({
    resource: input.resource,
    worktree: input.worktree
  });
}

function validateResourcePlan(input: {
  provider: ResourceProvider;
  resource: ValidatedResourceDeclaration;
  derived: DerivedResourcePlan;
  worktree: {
    id?: string;
    label?: string;
    branch?: string;
  };
}): ResourceValidation | Refusal {
  if (!input.provider.capabilities?.validate || !input.provider.validateResource) {
    return {
      category: "unsupported_capability",
      reason: `Resource provider "${input.resource.provider}" does not support validate.`
    };
  }

  return input.provider.validateResource({
    resource: input.resource,
    derived: input.derived,
    worktree: input.worktree
  });
}

function deriveEndpointMapping(input: {
  provider: EndpointProvider;
  endpoint: ValidatedEndpointDeclaration;
  worktree: {
    id: string;
    label?: string;
    branch?: string;
  };
}): DerivedEndpointMapping | Refusal {
  return input.provider.deriveEndpoint({
    endpoint: input.endpoint,
    worktree: input.worktree
  });
}

export function resolveSlice01(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResolveSlice01Result {
  const { repository, worktree, providers } = input;

  if (!worktree.id) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  if (repository.resources.length !== 1) {
    return invalidConfiguration(
      "Slice 01 requires exactly one declared managed resource."
    );
  }

  if (repository.endpoints.length !== 1) {
    return invalidConfiguration(
      "Slice 01 requires exactly one declared managed endpoint."
    );
  }

  const resource = repository.resources[0];
  const endpoint = repository.endpoints[0];

  const validatedResource = toValidatedResource(resource);
  if (isFailureResult(validatedResource)) {
    return validatedResource;
  }

  const validatedEndpoint = toValidatedEndpoint(endpoint);
  if (isFailureResult(validatedEndpoint)) {
    return validatedEndpoint;
  }

  const resourceProvider = providers.resources[validatedResource.provider];
  if (!resourceProvider) {
    return invalidConfiguration(
      `No resource provider is registered for "${validatedResource.provider}".`
    );
  }

  const endpointProvider = providers.endpoints[validatedEndpoint.provider];
  if (!endpointProvider) {
    return invalidConfiguration(
      `No endpoint provider is registered for "${validatedEndpoint.provider}".`
    );
  }

  const resolvedWorktree = {
    id: worktree.id,
    label: worktree.label,
    branch: worktree.branch
  };

  const resourcePlan = deriveResourcePlan({
    provider: resourceProvider,
    resource: validatedResource,
    worktree: resolvedWorktree
  });

  if (isRefusal(resourcePlan)) {
    return {
      ok: false,
      refusal: resourcePlan
    };
  }

  const endpointMapping = deriveEndpointMapping({
    provider: endpointProvider,
    endpoint: validatedEndpoint,
    worktree: resolvedWorktree
  });

  if (isRefusal(endpointMapping)) {
    return {
      ok: false,
      refusal: endpointMapping
    };
  }

  return {
    ok: true,
    resourcePlans: [resourcePlan],
    endpointMappings: [endpointMapping]
  };
}

export function resolveSlice02(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResolveSlice02Result {
  const { repository, worktree, providers } = input;

  if (!worktree.id) {
    return {
      ok: false,
      refusal: {
        category: "unsafe_scope",
        reason: "Safe worktree scope cannot be determined."
      }
    };
  }

  if (repository.resources.length !== 1) {
    return {
      ok: false,
      refusal: {
        category: "invalid_configuration",
        reason: "Slice 02 requires exactly one declared managed resource."
      }
    };
  }

  if (repository.endpoints.length !== 1) {
    return {
      ok: false,
      refusal: {
        category: "invalid_configuration",
        reason: "Slice 02 requires exactly one declared managed endpoint."
      }
    };
  }

  const resource = repository.resources[0];
  const endpoint = repository.endpoints[0];

  const validatedResource = toValidatedResource(resource);
  if (isFailureResult(validatedResource)) {
    return validatedResource;
  }

  const validatedEndpoint = toValidatedEndpoint(endpoint);
  if (isFailureResult(validatedEndpoint)) {
    return validatedEndpoint;
  }

  const resourceProvider = providers.resources[validatedResource.provider];
  if (!resourceProvider) {
    return invalidConfiguration(
      `No resource provider is registered for "${validatedResource.provider}".`
    );
  }

  const endpointProvider = providers.endpoints[validatedEndpoint.provider];
  if (!endpointProvider) {
    return invalidConfiguration(
      `No endpoint provider is registered for "${validatedEndpoint.provider}".`
    );
  }

  const resolvedWorktree = {
    id: worktree.id,
    label: worktree.label,
    branch: worktree.branch
  };

  const resourcePlan = deriveResourcePlan({
    provider: resourceProvider,
    resource: validatedResource,
    worktree: resolvedWorktree
  });

  if (isRefusal(resourcePlan)) {
    return {
      ok: false,
      refusal: resourcePlan
    };
  }

  const endpointMapping = deriveEndpointMapping({
    provider: endpointProvider,
    endpoint: validatedEndpoint,
    worktree: resolvedWorktree
  });

  if (isRefusal(endpointMapping)) {
    return {
      ok: false,
      refusal: endpointMapping
    };
  }

  const resourceValidations: ResourceValidation[] = [];

  if (validatedResource.scopedValidate) {
    const validation = validateResourcePlan({
      provider: resourceProvider,
      resource: validatedResource,
      derived: resourcePlan,
      worktree: resolvedWorktree
    });

    if (isRefusal(validation)) {
      if (validation.category === "unsupported_capability") {
        return unsupportedCapability(validation.reason);
      }

      return {
        ok: false,
        refusal: validation
      };
    }

    resourceValidations.push(validation);
  }

  return {
    ok: true,
    resourcePlans: [resourcePlan],
    endpointMappings: [endpointMapping],
    resourceValidations
  };
}
