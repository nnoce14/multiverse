import type { RepositoryConfiguration } from "@multiverse/provider-contracts";

import {
  validateIndexedEndpointDeclaration,
  validateResourceDeclaration,
  type DeclarationValidationError,
  type ValidatedEndpointDeclaration,
  type ValidatedResourceDeclaration
} from "./declarations.js";

export interface ValidatedRepositoryConfiguration {
  resources: ValidatedResourceDeclaration[];
  endpoints: ValidatedEndpointDeclaration[];
}

export type RepositoryConfigurationValidationError = DeclarationValidationError;

export type RepositoryConfigurationValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: RepositoryConfigurationValidationError[];
    };

export function validateRepositoryConfiguration(
  input: RepositoryConfiguration
): RepositoryConfigurationValidationResult<ValidatedRepositoryConfiguration> {
  const errors: RepositoryConfigurationValidationError[] = [];
  const resources: ValidatedResourceDeclaration[] = [];
  const endpoints: ValidatedEndpointDeclaration[] = [];

  for (const [index, resource] of input.resources.entries()) {
    const validation = validateResourceDeclaration({
      resource,
      index
    });

    if (!validation.ok) {
      errors.push(...validation.errors);
      continue;
    }

    resources.push(validation.value);
  }

  for (const [index, endpoint] of input.endpoints.entries()) {
    const validation = validateIndexedEndpointDeclaration({
      endpoint,
      index
    });

    if (!validation.ok) {
      errors.push(...validation.errors);
      continue;
    }

    endpoints.push(validation.value);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      errors
    };
  }

  return {
    ok: true,
    value: {
      resources,
      endpoints
    }
  };
}

export function withValidatedRepositoryConfiguration<TResult>(
  input: RepositoryConfiguration,
  onValidated: (repository: ValidatedRepositoryConfiguration) => TResult
): RepositoryConfigurationValidationResult<TResult> {
  const validation = validateRepositoryConfiguration(input);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    value: onValidated(validation.value)
  };
}
