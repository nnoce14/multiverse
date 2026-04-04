import type {
  ProviderRegistry,
  Refusal,
  ResolveSlice01Result,
  ResolveSlice02Result,
  RepositoryConfiguration,
  ResourceValidation,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";
import { isRefusal, unsupportedCapability } from "./refusals";
import {
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

function isFailureOutcome(
  value: ResolvedSliceExecution | Extract<ResolveSlice01Result, { ok: false }>
): value is Extract<ResolveSlice01Result, { ok: false }> {
  return "ok" in value && value.ok === false;
}

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

export function resolveSlice01(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResolveSlice01Result {
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

export function resolveSlice02(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): ResolveSlice02Result {
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
