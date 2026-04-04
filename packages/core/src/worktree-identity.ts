export interface RawWorktreeIdentityInput {
  worktreeId?: string;
}

export interface WorktreeIdentity {
  kind: "worktree_identity";
  value: string;
}

export interface ValidationError {
  path: "worktreeId";
  code: "required" | "invalid_value";
}

export type ValidationResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      errors: ValidationError[];
    };

function createWorktreeIdentity(value: string): WorktreeIdentity {
  return {
    kind: "worktree_identity",
    value
  };
}

export function validateWorktreeIdentity(
  input: RawWorktreeIdentityInput
): ValidationResult<WorktreeIdentity> {
  if (input.worktreeId === undefined) {
    return {
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "required"
        }
      ]
    };
  }

  if (input.worktreeId.trim().length === 0) {
    return {
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "invalid_value"
        }
      ]
    };
  }

  return {
    ok: true,
    value: createWorktreeIdentity(input.worktreeId)
  };
}

export function withValidatedWorktreeIdentity<TResult>(
  input: RawWorktreeIdentityInput,
  onValidated: (worktreeIdentity: WorktreeIdentity) => TResult
): ValidationResult<TResult> {
  const validation = validateWorktreeIdentity(input);
  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    value: onValidated(validation.value)
  };
}
