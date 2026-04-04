export type IsolationStrategy =
  | "name-scoped"
  | "path-scoped"
  | "process-scoped";

export type RefusalCategory =
  | "invalid_configuration"
  | "unsupported_capability"
  | "unsafe_scope"
  | "provider_failure";

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

export interface ResourceProvider {
  deriveResource(input: {
    resource: {
      name: string;
      provider: string;
      isolationStrategy: IsolationStrategy;
      scopedReset: boolean;
      scopedCleanup: boolean;
    };
    worktree: {
      id: string;
      label?: string;
      branch?: string;
    };
  }): DerivedResourcePlan | Refusal;
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

export type ResolveSlice01Result =
  | {
      ok: true;
      resourcePlans: DerivedResourcePlan[];
      endpointMappings: DerivedEndpointMapping[];
    }
  | {
      ok: false;
      refusal: Refusal;
    };
