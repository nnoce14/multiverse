import type {
  DerivedEndpointMapping,
  DerivedResourcePlan,
  EndpointDeclaration,
  EndpointProvider,
  IsolationStrategy,
  ProviderRegistry,
  Refusal,
  RepositoryConfiguration,
  ResolveSlice01Result,
  ResourceDeclaration,
  ResourceProvider,
  WorktreeInstanceInput
} from "../../provider-contracts/src";

type FailureResult = Extract<ResolveSlice01Result, { ok: false }>;

function invalidConfiguration(reason: string): FailureResult {
  return {
    ok: false,
    refusal: {
      category: "invalid_configuration",
      reason
    }
  };
}

function unsafeScope(reason: string): FailureResult {
  return {
    ok: false,
    refusal: {
      category: "unsafe_scope",
      reason
    }
  };
}

function isRefusal(value: unknown): value is Refusal {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "reason" in value
  );
}

function validateResource(resource: ResourceDeclaration) {
  if (!resource.name) {
    return invalidConfiguration("Resource declaration must include a name.");
  }

  if (!resource.provider) {
    return invalidConfiguration("Resource declaration must include a provider.");
  }

  if (!resource.isolationStrategy) {
    return invalidConfiguration(
      "Resource declaration must include a primary isolation strategy."
    );
  }

  if (typeof resource.scopedReset !== "boolean") {
    return invalidConfiguration(
      "Resource declaration must indicate scoped reset intent."
    );
  }

  if (typeof resource.scopedCleanup !== "boolean") {
    return invalidConfiguration(
      "Resource declaration must indicate scoped cleanup intent."
    );
  }

  return null;
}

function validateEndpoint(endpoint: EndpointDeclaration) {
  if (!endpoint.name) {
    return invalidConfiguration("Endpoint declaration must include a name.");
  }

  if (!endpoint.role) {
    return invalidConfiguration("Endpoint declaration must include a role.");
  }

  if (!endpoint.provider) {
    return invalidConfiguration("Endpoint declaration must include a provider.");
  }

  return null;
}

interface ValidatedResourceDeclaration {
  name: string;
  provider: string;
  isolationStrategy: IsolationStrategy;
  scopedReset: boolean;
  scopedCleanup: boolean;
}

interface ValidatedEndpointDeclaration {
  name: string;
  role: string;
  provider: string;
}

function toValidatedResource(
  resource: ResourceDeclaration
): ValidatedResourceDeclaration | FailureResult {
  if (!resource.name) {
    return invalidConfiguration("Resource declaration must include a name.");
  }

  if (!resource.provider) {
    return invalidConfiguration("Resource declaration must include a provider.");
  }

  if (!resource.isolationStrategy) {
    return invalidConfiguration(
      "Resource declaration must include a primary isolation strategy."
    );
  }

  if (typeof resource.scopedReset !== "boolean") {
    return invalidConfiguration(
      "Resource declaration must indicate scoped reset intent."
    );
  }

  if (typeof resource.scopedCleanup !== "boolean") {
    return invalidConfiguration(
      "Resource declaration must indicate scoped cleanup intent."
    );
  }

  return {
    name: resource.name,
    provider: resource.provider,
    isolationStrategy: resource.isolationStrategy,
    scopedReset: resource.scopedReset,
    scopedCleanup: resource.scopedCleanup
  };
}

function toValidatedEndpoint(
  endpoint: EndpointDeclaration
): ValidatedEndpointDeclaration | FailureResult {
  if (!endpoint.name) {
    return invalidConfiguration("Endpoint declaration must include a name.");
  }

  if (!endpoint.role) {
    return invalidConfiguration("Endpoint declaration must include a role.");
  }

  if (!endpoint.provider) {
    return invalidConfiguration("Endpoint declaration must include a provider.");
  }

  return {
    name: endpoint.name,
    role: endpoint.role,
    provider: endpoint.provider
  };
}

function isFailureResult(
  value:
    | ValidatedResourceDeclaration
    | ValidatedEndpointDeclaration
    | FailureResult
): value is FailureResult {
  return "ok" in value && value.ok === false;
}

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
