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

  // Cross-declaration duplicate appEnv check.
  // Only run when all individual declarations passed validation (errors.length === 0),
  // because partially-validated resources/endpoints may have been skipped above.
  if (errors.length === 0) {
    const seen = new Map<string, string>(); // appEnv value → first path that claimed it

    for (const [index, resource] of resources.entries()) {
      if (resource.appEnv === undefined) continue;
      const existing = seen.get(resource.appEnv);
      if (existing !== undefined) {
        errors.push({
          path: `resources[${index}].appEnv`,
          code: "duplicate_appenv"
        });
      } else {
        seen.set(resource.appEnv, `resources[${index}].appEnv`);
      }
    }

    for (const [index, endpoint] of endpoints.entries()) {
      if (endpoint.appEnv === undefined) continue;
      const existing = seen.get(endpoint.appEnv);
      if (existing !== undefined) {
        errors.push({
          path: `endpoints[${index}].appEnv`,
          code: "duplicate_appenv"
        });
      } else {
        seen.set(endpoint.appEnv, `endpoints[${index}].appEnv`);
      }
    }
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
