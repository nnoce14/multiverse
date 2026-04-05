import type {
  CleanupOneResourceResult,
  DeriveAndValidateOneResult,
  DerivedEndpointMapping,
  DerivedResourcePlan,
  ProviderRegistry,
  RepositoryConfiguration,
  ResourceCleanup,
  ResourceReset,
  ResourceValidation,
  ResetOneResourceResult,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";
import {
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

interface ResolvedWorktree {
  id: string;
  label?: string;
  branch?: string;
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

function validateCapabilityIntent(input: {
  resource: {
    provider: string;
    scopedValidate: boolean;
    scopedReset: boolean;
    scopedCleanup: boolean;
  };
  provider: {
    capabilities?: {
      validate?: true;
      reset?: true;
      cleanup?: true;
    };
  };
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

export function resolveAndDeriveAllWithValidation(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): DeriveAndValidateOneResult {
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
  const resourceValidations: ResourceValidation[] = [];

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

    if (resourceDecl.scopedValidate) {
      if (!resourceProvider.capabilities?.validate || !resourceProvider.validateResource) {
        return { ok: false, refusal: { category: "unsupported_capability", reason: `Resource provider "${resourceDecl.provider}" does not support validate.` } };
      }

      const validation = resourceProvider.validateResource({
        resource: resourceDecl,
        derived: plan,
        worktree: resolvedWorktree
      });
      if (isRefusal(validation)) {
        return { ok: false, refusal: validation };
      }
      resourceValidations.push(validation);
    }
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

  return { ok: true, resourcePlans, endpointMappings, resourceValidations };
}

export function resolveAndResetAll(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResetOneResourceResult {
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
  const resetTargets = repo.resources.filter((r) => r.scopedReset);

  if (resetTargets.length === 0) {
    return invalidConfiguration(
      "No resources declare scoped reset intent. Reset requires at least one resource with scopedReset: true."
    );
  }

  const resourcePlans: DerivedResourcePlan[] = [];
  const resourceResets: ResourceReset[] = [];

  for (const resourceDecl of resetTargets) {
    const resourceProvider = input.providers.resources[resourceDecl.provider];
    if (!resourceProvider) {
      return invalidConfiguration(
        `No resource provider is registered for "${resourceDecl.provider}".`
      );
    }

    if (!resourceProvider.capabilities?.reset || !resourceProvider.resetResource) {
      return { ok: false, refusal: { category: "unsupported_capability", reason: `Resource provider "${resourceDecl.provider}" does not support reset.` } };
    }

    const plan = resourceProvider.deriveResource({
      resource: resourceDecl,
      worktree: resolvedWorktree
    });
    if (isRefusal(plan)) {
      return { ok: false, refusal: plan };
    }

    const reset = resourceProvider.resetResource({
      resource: resourceDecl,
      derived: plan,
      worktree: resolvedWorktree
    });
    if (isRefusal(reset)) {
      return { ok: false, refusal: reset };
    }

    resourcePlans.push(plan);
    resourceResets.push(reset);
  }

  return { ok: true, resourcePlans, resourceResets };
}

export function resolveAndCleanupAll(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): CleanupOneResourceResult {
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
  const cleanupTargets = repo.resources.filter((r) => r.scopedCleanup);

  if (cleanupTargets.length === 0) {
    return invalidConfiguration(
      "No resources declare scoped cleanup intent. Cleanup requires at least one resource with scopedCleanup: true."
    );
  }

  const resourcePlans: DerivedResourcePlan[] = [];
  const resourceCleanups: ResourceCleanup[] = [];

  for (const resourceDecl of cleanupTargets) {
    const resourceProvider = input.providers.resources[resourceDecl.provider];
    if (!resourceProvider) {
      return invalidConfiguration(
        `No resource provider is registered for "${resourceDecl.provider}".`
      );
    }

    if (!resourceProvider.capabilities?.cleanup || !resourceProvider.cleanupResource) {
      return { ok: false, refusal: { category: "unsupported_capability", reason: `Resource provider "${resourceDecl.provider}" does not support cleanup.` } };
    }

    const plan = resourceProvider.deriveResource({
      resource: resourceDecl,
      worktree: resolvedWorktree
    });
    if (isRefusal(plan)) {
      return { ok: false, refusal: plan };
    }

    const cleanup = resourceProvider.cleanupResource({
      resource: resourceDecl,
      derived: plan,
      worktree: resolvedWorktree
    });
    if (isRefusal(cleanup)) {
      return { ok: false, refusal: cleanup };
    }

    resourcePlans.push(plan);
    resourceCleanups.push(cleanup);
  }

  return { ok: true, resourcePlans, resourceCleanups };
}
