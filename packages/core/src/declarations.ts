import type {
  EndpointDeclaration,
  IsolationStrategy,
  ResourceDeclaration
} from "../../provider-contracts/index";

import { invalidConfiguration, type FailureResult } from "./refusals";

export interface ValidatedResourceDeclaration {
  name: string;
  provider: string;
  isolationStrategy: IsolationStrategy;
  scopedValidate: boolean;
  scopedReset: boolean;
  scopedCleanup: boolean;
}

export interface ValidatedEndpointDeclaration {
  name: string;
  role: string;
  provider: string;
}

export function toValidatedResource(
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
    scopedValidate: resource.scopedValidate === true,
    scopedReset: resource.scopedReset,
    scopedCleanup: resource.scopedCleanup
  };
}

export function toValidatedEndpoint(
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

export function isFailureResult(
  value:
    | ValidatedResourceDeclaration
    | ValidatedEndpointDeclaration
    | FailureResult
): value is FailureResult {
  return "ok" in value && value.ok === false;
}
