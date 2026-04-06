export type IsolationStrategy =
  | "name-scoped"
  | "path-scoped"
  | "process-scoped"
  | "process-port-scoped";

export type RefusalCategory =
  | "invalid_configuration"
  | "unsupported_capability"
  | "unsafe_scope"
  | "provider_failure";

export interface ProviderCapabilities {
  validate?: true;
  reset?: true;
  cleanup?: true;
}

export interface Refusal {
  category: RefusalCategory;
  reason: string;
}

export interface WorktreeInstanceInput {
  id?: string;
  label?: string;
  branch?: string;
}

export interface ResourceDeclaration {
  name?: string;
  provider?: string;
  isolationStrategy?: IsolationStrategy;
  scopedValidate?: boolean;
  scopedReset?: boolean;
  scopedCleanup?: boolean;
  appEnv?: string;
}

export type EndpointAppEnvValueKind = "url" | "port";
export type EndpointAppEnvMapping = Record<string, EndpointAppEnvValueKind>;

export interface EndpointDeclaration {
  name?: string;
  role?: string;
  provider?: string;
  appEnv?: string | EndpointAppEnvMapping;
  host?: string;
  basePort?: number;
}

export const FIXED_HOST_PORT_PORT_RANGE = 1000;
export const FIXED_HOST_PORT_MIN_BASE_PORT = 1;
export const FIXED_HOST_PORT_MAX_BASE_PORT = 65535 - (FIXED_HOST_PORT_PORT_RANGE - 1);

export function isValidFixedHostPortBasePort(value: number | undefined): value is number {
  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= FIXED_HOST_PORT_MIN_BASE_PORT &&
    value <= FIXED_HOST_PORT_MAX_BASE_PORT;
}

export interface RepositoryConfiguration {
  resources: ResourceDeclaration[];
  endpoints: EndpointDeclaration[];
}

export interface DerivedResourcePlan {
  resourceName: string;
  provider: string;
  isolationStrategy: IsolationStrategy;
  worktreeId: string;
  handle: string;
}

export interface DerivedEndpointMapping {
  endpointName: string;
  provider: string;
  role: string;
  worktreeId: string;
  address: string;
}

export interface ResourceValidation {
  resourceName: string;
  provider: string;
  worktreeId: string;
  capability: "validate";
}

export interface ResourceReset {
  resourceName: string;
  provider: string;
  worktreeId: string;
  capability: "reset";
}

export interface ResourceCleanup {
  resourceName: string;
  provider: string;
  worktreeId: string;
  capability: "cleanup";
}

export interface ResourceProvider {
  capabilities?: ProviderCapabilities;
  deriveResource(input: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedValidate: boolean;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    worktree: {
      id: string;
      label?: string;
      branch?: string;
    };
  }): DerivedResourcePlan | Refusal;
  validateResource?(input: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedValidate: boolean;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    derived: DerivedResourcePlan;
    worktree: {
      id?: string;
      label?: string;
      branch?: string;
    };
  }): ResourceValidation | Refusal;
  resetResource?(input: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedValidate: boolean;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    derived: DerivedResourcePlan;
    worktree: {
      id?: string;
      label?: string;
      branch?: string;
    };
  }): Promise<ResourceReset | Refusal>;
  cleanupResource?(input: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedValidate: boolean;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    derived: DerivedResourcePlan;
    worktree: {
      id?: string;
      label?: string;
      branch?: string;
    };
  }): Promise<ResourceCleanup | Refusal>;
}

export interface EndpointProvider {
  deriveEndpoint(input: {
    endpoint: {
      name: string;
      role: string;
      provider: string;
      host?: string;
      basePort?: number;
    };
    worktree: {
      id: string;
      label?: string;
      branch?: string;
    };
  }): DerivedEndpointMapping | Refusal;
}

export interface ProviderRegistry {
  resources: Record<string, ResourceProvider>;
  endpoints: Record<string, EndpointProvider>;
}

export type DeriveOneResult =
  | {
      ok: true;
      resourcePlans: DerivedResourcePlan[];
      endpointMappings: DerivedEndpointMapping[];
    }
  | {
      ok: false;
      refusal: Refusal;
    };

export type DeriveAndValidateOneResult =
  | {
      ok: true;
      resourcePlans: DerivedResourcePlan[];
      endpointMappings: DerivedEndpointMapping[];
      resourceValidations: ResourceValidation[];
    }
  | {
      ok: false;
      refusal: Refusal;
    };

export type ResetOneResourceResult =
  | {
      ok: true;
      resourcePlans: DerivedResourcePlan[];
      resourceResets: ResourceReset[];
    }
  | {
      ok: false;
      refusal: Refusal;
    };

export type CleanupOneResourceResult =
  | {
      ok: true;
      resourcePlans: DerivedResourcePlan[];
      resourceCleanups: ResourceCleanup[];
    }
  | {
      ok: false;
      refusal: Refusal;
    };
