import type {
  DerivedEndpointMapping,
  DerivedResourcePlan,
  EndpointProvider,
  ProviderRegistry,
  RepositoryConfiguration,
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
import { invalidConfiguration, isRefusal, unsafeScope, type FailureResult } from "./refusals";

export interface ResolvedWorktree {
  id: string;
  label?: string;
  branch?: string;
}

export interface ResolvedSliceProviders {
  resource: ResourceProvider;
  endpoint: EndpointProvider;
}

export interface ResolvedSliceDeclarations {
  resource: ValidatedResourceDeclaration;
  endpoint: ValidatedEndpointDeclaration;
}

export interface ResolvedSlicePreflight {
  worktree: ResolvedWorktree;
  declarations: ResolvedSliceDeclarations;
  providers: ResolvedSliceProviders;
}

export interface ResolvedSliceDerivedValues {
  resourcePlan: DerivedResourcePlan;
  endpointMapping: DerivedEndpointMapping;
}

export interface ResolvedSliceExecution extends ResolvedSlicePreflight {
  derived: ResolvedSliceDerivedValues;
}

function isFailureOutcome(value: unknown): value is FailureResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false
  );
}

export function resolveSlicePreflight(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
  resourceCountReason: string;
  endpointCountReason: string;
}): ResolvedSlicePreflight | FailureResult {
  const resolvedWorktree = requireResolvedWorktree(input.worktree);
  if (isFailureOutcome(resolvedWorktree)) {
    return resolvedWorktree;
  }

  const declarations = resolveSliceDeclarations({
    repository: input.repository,
    resourceCountReason: input.resourceCountReason,
    endpointCountReason: input.endpointCountReason
  });
  if (isFailureOutcome(declarations)) {
    return declarations;
  }

  const resolvedProviders = resolveSliceProviders({
    providers: input.providers,
    declarations
  });
  if (isFailureOutcome(resolvedProviders)) {
    return resolvedProviders;
  }

  return {
    worktree: resolvedWorktree,
    declarations,
    providers: resolvedProviders
  };
}

export function resolveSliceExecution(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
  resourceCountReason: string;
  endpointCountReason: string;
}): ResolvedSliceExecution | FailureResult {
  const preflight = resolveSlicePreflight(input);
  if (isFailureOutcome(preflight)) {
    return preflight;
  }

  const derived = deriveSliceValues(preflight);
  if (isFailureOutcome(derived)) {
    return derived;
  }

  return {
    ...preflight,
    derived
  };
}

function requireResolvedWorktree(
  worktree: WorktreeInstanceInput
): ResolvedWorktree | FailureResult {
  if (!worktree.id) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  return {
    id: worktree.id,
    label: worktree.label,
    branch: worktree.branch
  };
}

function resolveSliceDeclarations(input: {
  repository: RepositoryConfiguration;
  resourceCountReason: string;
  endpointCountReason: string;
}): ResolvedSliceDeclarations | FailureResult {
  const { repository, resourceCountReason, endpointCountReason } = input;

  if (repository.resources.length !== 1) {
    return invalidConfiguration(resourceCountReason);
  }

  if (repository.endpoints.length !== 1) {
    return invalidConfiguration(endpointCountReason);
  }

  const validatedResource = toValidatedResource(repository.resources[0]);
  if (isFailureResult(validatedResource)) {
    return validatedResource;
  }

  const validatedEndpoint = toValidatedEndpoint(repository.endpoints[0]);
  if (isFailureResult(validatedEndpoint)) {
    return validatedEndpoint;
  }

  return {
    resource: validatedResource,
    endpoint: validatedEndpoint
  };
}

function resolveSliceProviders(input: {
  providers: ProviderRegistry;
  declarations: ResolvedSliceDeclarations;
}): ResolvedSliceProviders | FailureResult {
  const { providers, declarations } = input;

  const resourceProvider = providers.resources[declarations.resource.provider];
  if (!resourceProvider) {
    return invalidConfiguration(
      `No resource provider is registered for "${declarations.resource.provider}".`
    );
  }

  const endpointProvider = providers.endpoints[declarations.endpoint.provider];
  if (!endpointProvider) {
    return invalidConfiguration(
      `No endpoint provider is registered for "${declarations.endpoint.provider}".`
    );
  }

  return {
    resource: resourceProvider,
    endpoint: endpointProvider
  };
}

function deriveSliceValues(
  input: ResolvedSlicePreflight
): ResolvedSliceDerivedValues | FailureResult {
  const resourcePlan = input.providers.resource.deriveResource({
    resource: input.declarations.resource,
    worktree: input.worktree
  });

  if (isRefusal(resourcePlan)) {
    return {
      ok: false,
      refusal: resourcePlan
    };
  }

  const endpointMapping = input.providers.endpoint.deriveEndpoint({
    endpoint: input.declarations.endpoint,
    worktree: input.worktree
  });

  if (isRefusal(endpointMapping)) {
    return {
      ok: false,
      refusal: endpointMapping
    };
  }

  return {
    resourcePlan,
    endpointMapping
  };
}
