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
}): ResetOneResourceResult {
  return resolveAndResetAll(input);
}

export function cleanupOneResource(input: {
  repository: RepositoryConfiguration;
  worktree: WorktreeInstanceInput;
  providers: ProviderRegistry;
}): CleanupOneResourceResult {
  return resolveAndCleanupAll(input);
}
