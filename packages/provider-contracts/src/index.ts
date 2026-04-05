export type IsolationStrategy =
  | "name-scoped"
  | "path-scoped"
  | "process-scoped";

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
}

export interface EndpointDeclaration {
  name?: string;
  role?: string;
  provider?: string;
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
  }): ResourceReset | Refusal;
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
  }): ResourceCleanup | Refusal;
}

export interface EndpointProvider {
  deriveEndpoint(input: {
    endpoint: {
      name: string;
      role: string;
      provider: string;
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
