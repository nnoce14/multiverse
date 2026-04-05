import type {
  CleanupOneResourceResult,
  DeriveAndValidateOneResult,
  DeriveOneResult,
  ProviderRegistry,
  Refusal,
  ResourceCleanup,
  ResetOneResourceResult,
  RepositoryConfiguration,
  ResourceReset,
  ResourceValidation,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";
import { invalidConfiguration, isFailureOutcome, isRefusal, unsupportedCapability } from "./refusals";
import {
  resolveSlicePreflight,
  resolveSliceExecution,
  type ResolvedSliceExecution
} from "./orchestration";

export {
  validateWorktreeIdentity,
  withValidatedWorktreeIdentity
} from "./worktree-identity";
export {
  validateEndpointDeclaration,
  withValidatedEndpointDeclaration
} from "./declarations";
export {
  validateRepositoryConfiguration,
  withValidatedRepositoryConfiguration
} from "./repository-configuration";

function validateResourcePlan(input: {
  provider: ResolvedSliceExecution["providers"]["resource"];
  resource: ResolvedSliceExecution["declarations"]["resource"];
  derived: ResolvedSliceExecution["derived"]["resourcePlan"];
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

function resetResourcePlan(input: {
  provider: ResolvedSliceExecution["providers"]["resource"];
  resource: ResolvedSliceExecution["declarations"]["resource"];
  derived: ResolvedSliceExecution["derived"]["resourcePlan"];
  worktree: {
    id?: string;
    label?: string;
    branch?: string;
  };
}): ResourceReset | Refusal | Extract<ResetOneResourceResult, { ok: false }> {
  if (!input.resource.scopedReset) {
    return invalidConfiguration(
      `Resource "${input.resource.name}" does not declare scoped reset intent.`
    );
  }

  if (!input.provider.capabilities?.reset || !input.provider.resetResource) {
    return unsupportedCapability(
      `Resource provider "${input.resource.provider}" does not support reset.`
    );
  }

  return input.provider.resetResource({
    resource: input.resource,
    derived: input.derived,
    worktree: input.worktree
  });
}

function cleanupResourcePlan(input: {
  provider: ResolvedSliceExecution["providers"]["resource"];
  resource: ResolvedSliceExecution["declarations"]["resource"];
  derived: ResolvedSliceExecution["derived"]["resourcePlan"];
  worktree: {
    id?: string;
    label?: string;
    branch?: string;
  };
}): ResourceCleanup | Refusal | Extract<CleanupOneResourceResult, { ok: false }> {
  if (!input.resource.scopedCleanup) {
    return invalidConfiguration(
      `Resource "${input.resource.name}" does not declare scoped cleanup intent.`
    );
  }

  if (!input.provider.capabilities?.cleanup || !input.provider.cleanupResource) {
    return unsupportedCapability(
      `Resource provider "${input.resource.provider}" does not support cleanup.`
    );
  }

  return input.provider.cleanupResource({
    resource: input.resource,
    derived: input.derived,
    worktree: input.worktree
  });
}

export function deriveOne(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): DeriveOneResult {
  const execution = resolveSliceExecution({
    ...input,
    resourceCountReason: "Slice 01 requires exactly one declared managed resource.",
    endpointCountReason: "Slice 01 requires exactly one declared managed endpoint."
  });

  if (isFailureOutcome(execution)) {
    return execution;
  }

  return {
    ok: true,
    resourcePlans: [execution.derived.resourcePlan],
    endpointMappings: [execution.derived.endpointMapping]
  };
}

export function deriveAndValidateOne(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): DeriveAndValidateOneResult {
  const execution = resolveSliceExecution({
    ...input,
    resourceCountReason: "Slice 02 requires exactly one declared managed resource.",
    endpointCountReason: "Slice 02 requires exactly one declared managed endpoint."
  });

  if (isFailureOutcome(execution)) {
    return execution;
  }

  const resourceValidations: ResourceValidation[] = [];

  if (execution.declarations.resource.scopedValidate) {
    const validation = validateResourcePlan({
      provider: execution.providers.resource,
      resource: execution.declarations.resource,
      derived: execution.derived.resourcePlan,
      worktree: execution.worktree
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
    resourcePlans: [execution.derived.resourcePlan],
    endpointMappings: [execution.derived.endpointMapping],
    resourceValidations
  };
}

export function resetOneResource(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResetOneResourceResult {
  const preflight = resolveSlicePreflight({
    ...input,
    resourceCountReason: "Reset requires exactly one declared managed resource.",
    endpointCountReason: "Reset requires exactly one declared managed endpoint."
  });

  if (isFailureOutcome(preflight)) {
    return preflight;
  }

  if (!preflight.declarations.resource.scopedReset) {
    return invalidConfiguration(
      `Resource "${preflight.declarations.resource.name}" does not declare scoped reset intent.`
    );
  }

  const resourcePlan = preflight.providers.resource.deriveResource({
    resource: preflight.declarations.resource,
    worktree: preflight.worktree
  });

  if (isRefusal(resourcePlan)) {
    return {
      ok: false,
      refusal: resourcePlan
    };
  }

  const reset = resetResourcePlan({
    provider: preflight.providers.resource,
    resource: preflight.declarations.resource,
    derived: resourcePlan,
    worktree: preflight.worktree
  });

  if (isFailureOutcome(reset)) {
    return reset;
  }

  if (isRefusal(reset)) {
    return {
      ok: false,
      refusal: reset
    };
  }

  return {
    ok: true,
    resourcePlans: [resourcePlan],
    resourceResets: [reset]
  };
}

export function cleanupOneResource(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): CleanupOneResourceResult {
  const preflight = resolveSlicePreflight({
    ...input,
    resourceCountReason: "Cleanup requires exactly one declared managed resource.",
    endpointCountReason: "Cleanup requires exactly one declared managed endpoint."
  });

  if (isFailureOutcome(preflight)) {
    return preflight;
  }

  if (!preflight.declarations.resource.scopedCleanup) {
    return invalidConfiguration(
      `Resource "${preflight.declarations.resource.name}" does not declare scoped cleanup intent.`
    );
  }

  const resourcePlan = preflight.providers.resource.deriveResource({
    resource: preflight.declarations.resource,
    worktree: preflight.worktree
  });

  if (isRefusal(resourcePlan)) {
    return {
      ok: false,
      refusal: resourcePlan
    };
  }

  const cleanup = cleanupResourcePlan({
    provider: preflight.providers.resource,
    resource: preflight.declarations.resource,
    derived: resourcePlan,
    worktree: preflight.worktree
  });

  if (isFailureOutcome(cleanup)) {
    return cleanup;
  }

  if (isRefusal(cleanup)) {
    return {
      ok: false,
      refusal: cleanup
    };
  }

  return {
    ok: true,
    resourcePlans: [resourcePlan],
    resourceCleanups: [cleanup]
  };
}
