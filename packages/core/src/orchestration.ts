import type {
  DerivedEndpointMapping,
  DerivedResourcePlan,
  EndpointProvider,
  ProviderRegistry,
  RepositoryConfiguration,
  ResourceProvider,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";
import {
  type ValidatedEndpointDeclaration,
  type ValidatedResourceDeclaration
} from "./declarations";
import {
  type ValidatedRepositoryConfiguration,
  withValidatedRepositoryConfiguration
} from "./repository-configuration";
import {
  invalidConfiguration,
  isFailureOutcome,
  isRefusal,
  unsupportedCapability,
  unsafeScope,
  type FailureResult
} from "./refusals";
import { validateWorktreeIdentity } from "./worktree-identity";

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

  const repositoryValidation = withValidatedRepositoryConfiguration(
    input.repository,
    (repository) => repository
  );
  if (!repositoryValidation.ok) {
    return invalidConfiguration("Repository configuration is invalid.");
  }

  const declarations = resolveSliceDeclarations({
    repository: repositoryValidation.value,
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

  const capabilityIntent = validateCapabilityIntent({
    resource: declarations.resource,
    provider: resolvedProviders.resource
  });
  if (isFailureOutcome(capabilityIntent)) {
    return capabilityIntent;
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
  const validation = validateWorktreeIdentity({
    worktreeId: worktree.id
  });

  if (!validation.ok) {
    return unsafeScope("Safe worktree scope cannot be determined.");
  }

  return {
    id: validation.value.value,
    label: worktree.label,
    branch: worktree.branch
  };
}

function resolveSliceDeclarations(input: {
  repository: ValidatedRepositoryConfiguration;
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

  return {
    resource: repository.resources[0],
    endpoint: repository.endpoints[0]
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

function validateCapabilityIntent(input: {
  resource: ValidatedResourceDeclaration;
  provider: ResourceProvider;
}): void | FailureResult {
  const { resource, provider } = input;

  if (resource.scopedValidate && !provider.capabilities?.validate) {
    return unsupportedCapability(
      `Resource provider "${resource.provider}" does not support validate.`
    );
  }

  if (resource.scopedReset && !provider.capabilities?.reset) {
    return unsupportedCapability(
      `Resource provider "${resource.provider}" does not support reset.`
    );
  }

  if (resource.scopedCleanup && !provider.capabilities?.cleanup) {
    return unsupportedCapability(
      `Resource provider "${resource.provider}" does not support cleanup.`
    );
  }
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

export function resolveAndDeriveAll(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): { ok: true; resourcePlans: DerivedResourcePlan[]; endpointMappings: DerivedEndpointMapping[] } | FailureResult {
  const resolvedWorktree = requireResolvedWorktree(input.worktree);
  if (isFailureOutcome(resolvedWorktree)) {
    return resolvedWorktree;
  }

  const repoValidation = withValidatedRepositoryConfiguration(
    input.repository,
    (repository) => repository
  );
  if (!repoValidation.ok) {
    return invalidConfiguration("Repository configuration is invalid.");
  }

  const repo = repoValidation.value;
  const resourcePlans: DerivedResourcePlan[] = [];
  const endpointMappings: DerivedEndpointMapping[] = [];

  for (const resourceDecl of repo.resources) {
    const resourceProvider = input.providers.resources[resourceDecl.provider];
    if (!resourceProvider) {
      return invalidConfiguration(
        `No resource provider is registered for "${resourceDecl.provider}".`
      );
    }

    const capabilityCheck = validateCapabilityIntent({
      resource: resourceDecl,
      provider: resourceProvider
    });
    if (isFailureOutcome(capabilityCheck)) {
      return capabilityCheck;
    }

    const plan = resourceProvider.deriveResource({
      resource: resourceDecl,
      worktree: resolvedWorktree
    });
    if (isRefusal(plan)) {
      return { ok: false, refusal: plan };
    }
    resourcePlans.push(plan);
  }

  for (const endpointDecl of repo.endpoints) {
    const endpointProvider = input.providers.endpoints[endpointDecl.provider];
    if (!endpointProvider) {
      return invalidConfiguration(
        `No endpoint provider is registered for "${endpointDecl.provider}".`
      );
    }

    const mapping = endpointProvider.deriveEndpoint({
      endpoint: endpointDecl,
      worktree: resolvedWorktree
    });
    if (isRefusal(mapping)) {
      return { ok: false, refusal: mapping };
    }
    endpointMappings.push(mapping);
  }

  return { ok: true, resourcePlans, endpointMappings };
}
