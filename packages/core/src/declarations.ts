import type {
  EndpointDeclaration,
  IsolationStrategy,
  ResourceDeclaration
} from "../../provider-contracts/index";

import { invalidConfiguration, type FailureResult } from "./refusals";

export interface DeclarationValidationError {
  path: string;
  code: "required";
}

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

function requiredError(path: string): DeclarationValidationError {
  return {
    path,
    code: "required"
  };
}

export function validateResourceDeclaration(input: {
  resource: ResourceDeclaration;
  index: number;
}):
  | {
      ok: true;
      value: ValidatedResourceDeclaration;
    }
  | {
      ok: false;
      errors: DeclarationValidationError[];
    } {
  const { resource, index } = input;
  const errors: DeclarationValidationError[] = [];

  if (!resource.name) {
    errors.push(requiredError(`resources[${index}].name`));
  }

  if (!resource.provider) {
    errors.push(requiredError(`resources[${index}].provider`));
  }

  if (!resource.isolationStrategy) {
    errors.push(requiredError(`resources[${index}].isolationStrategy`));
  }

  if (typeof resource.scopedReset !== "boolean") {
    errors.push(requiredError(`resources[${index}].scopedReset`));
  }

  if (typeof resource.scopedCleanup !== "boolean") {
    errors.push(requiredError(`resources[${index}].scopedCleanup`));
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
      name: resource.name!,
      provider: resource.provider!,
      isolationStrategy: resource.isolationStrategy!,
      scopedValidate: resource.scopedValidate === true,
      scopedReset: resource.scopedReset!,
      scopedCleanup: resource.scopedCleanup!
    }
  };
}

export function validateEndpointDeclaration(input: {
  endpoint: EndpointDeclaration;
  index: number;
}):
  | {
      ok: true;
      value: ValidatedEndpointDeclaration;
    }
  | {
      ok: false;
      errors: DeclarationValidationError[];
    } {
  const { endpoint, index } = input;
  const errors: DeclarationValidationError[] = [];

  if (!endpoint.name) {
    errors.push(requiredError(`endpoints[${index}].name`));
  }

  if (!endpoint.role) {
    errors.push(requiredError(`endpoints[${index}].role`));
  }

  if (!endpoint.provider) {
    errors.push(requiredError(`endpoints[${index}].provider`));
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
      name: endpoint.name!,
      role: endpoint.role!,
      provider: endpoint.provider!
    }
  };
}

export function toValidatedResource(
  resource: ResourceDeclaration
): ValidatedResourceDeclaration | FailureResult {
  const validation = validateResourceDeclaration({
    resource,
    index: 0
  });

  if (!validation.ok) {
    return invalidConfiguration("Resource declaration is invalid.");
  }

  return validation.value;
}

export function toValidatedEndpoint(
  endpoint: EndpointDeclaration
): ValidatedEndpointDeclaration | FailureResult {
  const validation = validateEndpointDeclaration({
    endpoint,
    index: 0
  });

  if (!validation.ok) {
    return invalidConfiguration("Endpoint declaration is invalid.");
  }

  return validation.value;
}

export function isFailureResult(
  value:
    | ValidatedResourceDeclaration
    | ValidatedEndpointDeclaration
    | FailureResult
): value is FailureResult {
  return "ok" in value && value.ok === false;
}
