import type {
  EndpointDeclaration,
  IsolationStrategy,
  ResourceDeclaration
} from "@multiverse/provider-contracts";


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

export interface EndpointDeclarationValidationError {
  path: "name" | "role" | "provider";
  code: "required";
}

export type EndpointDeclarationValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: EndpointDeclarationValidationError[];
    };

function requiredError(path: string): DeclarationValidationError {
  return {
    path,
    code: "required"
  };
}

function requiredEndpointError(
  path: EndpointDeclarationValidationError["path"]
): EndpointDeclarationValidationError {
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

export function validateEndpointDeclaration(
  input: EndpointDeclaration
): EndpointDeclarationValidationResult<ValidatedEndpointDeclaration> {
  const errors: EndpointDeclarationValidationError[] = [];

  if (!input.name) {
    errors.push(requiredEndpointError("name"));
  }

  if (!input.role) {
    errors.push(requiredEndpointError("role"));
  }

  if (!input.provider) {
    errors.push(requiredEndpointError("provider"));
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
      name: input.name!,
      role: input.role!,
      provider: input.provider!
    }
  };
}

export function withValidatedEndpointDeclaration<TResult>(
  input: EndpointDeclaration,
  onValidated: (endpoint: ValidatedEndpointDeclaration) => TResult
): EndpointDeclarationValidationResult<TResult> {
  const validation = validateEndpointDeclaration(input);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    value: onValidated(validation.value)
  };
}

export function validateIndexedEndpointDeclaration(input: {
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
  const validation = validateEndpointDeclaration(input.endpoint);

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors.map((error) =>
        requiredError(`endpoints[${input.index}].${error.path}`)
      )
    };
  }

  return {
    ok: true,
    value: validation.value
  };
}

