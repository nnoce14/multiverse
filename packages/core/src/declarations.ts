import type {
  EndpointDeclaration,
  EndpointAppEnvMapping,
  IsolationStrategy,
  ResourceDeclaration
} from "@multiverse/provider-contracts";
import {
  isValidFixedHostPortBasePort
} from "@multiverse/provider-contracts";


export interface DeclarationValidationError {
  path: string;
  code: "required" | "invalid_value" | "invalid_env_var_name" | "reserved_name" | "duplicate_appenv" | "invalid_appenv_mapping_kind";
}

export interface ValidatedResourceDeclaration {
  name: string;
  provider: string;
  isolationStrategy: IsolationStrategy;
  scopedValidate: boolean;
  scopedReset: boolean;
  scopedCleanup: boolean;
  appEnv?: string;
}

export interface ValidatedEndpointDeclaration {
  name: string;
  role: string;
  provider: string;
  appEnv?: string | EndpointAppEnvMapping;
  host?: string;
  basePort?: number;
}

export interface EndpointDeclarationValidationError {
  path: "name" | "role" | "provider" | "appEnv" | "host" | "basePort";
  code: "required" | "invalid_value" | "invalid_env_var_name" | "reserved_name" | "invalid_appenv_mapping_kind";
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

/** Pattern for a valid environment variable name (POSIX-like). */
const ENV_VAR_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;
const RESERVED_PREFIX = "MULTIVERSE_";
function isValidEnvVarName(name: string): boolean {
  return ENV_VAR_NAME_PATTERN.test(name);
}

function isReservedEnvVarName(name: string): boolean {
  return name.startsWith(RESERVED_PREFIX);
}

function requiredError(path: string): DeclarationValidationError {
  return { path, code: "required" };
}

function requiredEndpointError(
  path: EndpointDeclarationValidationError["path"]
): EndpointDeclarationValidationError {
  return { path, code: "required" };
}

function appEnvErrors(
  value: string,
  pathPrefix: string
): DeclarationValidationError[] {
  const errors: DeclarationValidationError[] = [];
  if (!isValidEnvVarName(value)) {
    errors.push({ path: `${pathPrefix}.appEnv`, code: "invalid_env_var_name" });
  } else if (isReservedEnvVarName(value)) {
    errors.push({ path: `${pathPrefix}.appEnv`, code: "reserved_name" });
  }
  return errors;
}

function endpointAppEnvErrors(
  value: string | EndpointAppEnvMapping
): EndpointDeclarationValidationError[] {
  if (typeof value === "string") {
    const errors: EndpointDeclarationValidationError[] = [];
    if (!isValidEnvVarName(value)) {
      errors.push({ path: "appEnv", code: "invalid_env_var_name" });
    } else if (isReservedEnvVarName(value)) {
      errors.push({ path: "appEnv", code: "reserved_name" });
    }
    return errors;
  }

  const errors: EndpointDeclarationValidationError[] = [];
  const entries = Object.entries(value);
  if (entries.length === 0) {
    errors.push({ path: "appEnv", code: "invalid_env_var_name" });
    return errors;
  }

  for (const [envName, kind] of entries) {
    if (!isValidEnvVarName(envName)) {
      errors.push({ path: "appEnv", code: "invalid_env_var_name" });
      continue;
    }

    if (isReservedEnvVarName(envName)) {
      errors.push({ path: "appEnv", code: "reserved_name" });
      continue;
    }

    if (kind !== "url" && kind !== "port") {
      errors.push({ path: "appEnv", code: "invalid_appenv_mapping_kind" });
    }
  }

  return errors;
}

function invalidEndpointValueError(
  path: EndpointDeclarationValidationError["path"]
): EndpointDeclarationValidationError {
  return { path, code: "invalid_value" };
}

function fixedHostPortConfigErrors(
  input: EndpointDeclaration
): EndpointDeclarationValidationError[] {
  const errors: EndpointDeclarationValidationError[] = [];

  if (input.host === undefined) {
    errors.push(requiredEndpointError("host"));
  } else if (typeof input.host !== "string" || input.host.trim().length === 0) {
    errors.push(invalidEndpointValueError("host"));
  }

  if (input.basePort === undefined) {
    errors.push(requiredEndpointError("basePort"));
  } else if (!isValidFixedHostPortBasePort(input.basePort)) {
    errors.push(invalidEndpointValueError("basePort"));
  }

  return errors;
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

  if (resource.appEnv !== undefined) {
    errors.push(...appEnvErrors(resource.appEnv, `resources[${index}]`));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name: resource.name!,
      provider: resource.provider!,
      isolationStrategy: resource.isolationStrategy!,
      scopedValidate: resource.scopedValidate === true,
      scopedReset: resource.scopedReset!,
      scopedCleanup: resource.scopedCleanup!,
      ...(resource.appEnv !== undefined ? { appEnv: resource.appEnv } : {})
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

  if (input.provider === "fixed-host-port") {
    errors.push(...fixedHostPortConfigErrors(input));
  }

  if (input.appEnv !== undefined) {
    errors.push(...endpointAppEnvErrors(input.appEnv));
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name: input.name!,
      role: input.role!,
      provider: input.provider!,
      ...(input.provider === "fixed-host-port" && input.host !== undefined ? { host: input.host } : {}),
      ...(input.provider === "fixed-host-port" && input.basePort !== undefined
        ? { basePort: input.basePort }
        : {}),
      ...(input.appEnv !== undefined ? { appEnv: input.appEnv } : {})
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
      errors: validation.errors.map((error) => ({
        path: `endpoints[${input.index}].${error.path}`,
        code: error.code as DeclarationValidationError["code"]
      }))
    };
  }

  return {
    ok: true,
    value: validation.value
  };
}
