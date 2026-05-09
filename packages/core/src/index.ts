import type {
  CleanupOneResourceResult,
  DeriveAndValidateOneResult,
  DeriveOneResult,
  ProviderRegistry,
  ResetOneResourceResult,
  RepositoryConfiguration,
  WorktreeInstanceInput
} from "@multiverse/provider-contracts";
import {
  resolveAndDeriveAll,
  resolveAndDeriveAllWithValidation,
  resolveAndResetAll,
  resolveAndCleanupAll
} from "./orchestration.js";

export {
  validateWorktreeIdentity,
  withValidatedWorktreeIdentity
} from "./worktree-identity.js";
export {
  validateEndpointDeclaration,
  withValidatedEndpointDeclaration
} from "./declarations.js";
export {
  validateRepositoryConfiguration,
  withValidatedRepositoryConfiguration
} from "./repository-configuration.js";

export function deriveOne(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): DeriveOneResult {
  return resolveAndDeriveAll(input);
}

export function deriveAndValidateOne(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): DeriveAndValidateOneResult {
  return resolveAndDeriveAllWithValidation(input);
}

export function resetOneResource(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): Promise<ResetOneResourceResult> {
  return resolveAndResetAll(input);
}

export function cleanupOneResource(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): Promise<CleanupOneResourceResult> {
  return resolveAndCleanupAll(input);
}
