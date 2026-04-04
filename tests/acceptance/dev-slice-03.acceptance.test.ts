import { describe, expect, it, vi } from "vitest";

import { withValidatedWorktreeIdentity } from "../../packages/core/index";

describe("Development Slice 03 acceptance", () => {
  it("accepts valid raw worktree identity input and passes a trusted value downstream", () => {
    const downstream = vi.fn((worktreeIdentity) => ({
      trusted: worktreeIdentity
    }));

    const outcome = withValidatedWorktreeIdentity(
      {
        worktreeId: "wt-feature-a"
      },
      downstream
    );

    expect(outcome).toEqual({
      ok: true,
      value: {
        trusted: {
          kind: "worktree_identity",
          value: "wt-feature-a"
        }
      }
    });
    expect(downstream).toHaveBeenCalledTimes(1);
    expect(downstream).toHaveBeenCalledWith({
      kind: "worktree_identity",
      value: "wt-feature-a"
    });
  });

  it("accepts the reserved main worktree identity and passes a trusted value downstream", () => {
    const downstream = vi.fn((worktreeIdentity) => ({
      trusted: worktreeIdentity
    }));

    const outcome = withValidatedWorktreeIdentity(
      {
        worktreeId: "main"
      },
      downstream
    );

    expect(outcome).toEqual({
      ok: true,
      value: {
        trusted: {
          kind: "worktree_identity",
          value: "main"
        }
      }
    });
    expect(downstream).toHaveBeenCalledTimes(1);
    expect(downstream).toHaveBeenCalledWith({
      kind: "worktree_identity",
      value: "main"
    });
  });

  it("rejects missing worktree identity with structured validation output", () => {
    const downstream = vi.fn();

    const outcome = withValidatedWorktreeIdentity({}, downstream);

    expect(outcome).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "required"
        }
      ]
    });
    expect(downstream).not.toHaveBeenCalled();
  });

  it("rejects empty or whitespace-only worktree identity with structured validation output", () => {
    const downstream = vi.fn();

    const emptyOutcome = withValidatedWorktreeIdentity(
      {
        worktreeId: ""
      },
      downstream
    );
    const whitespaceOutcome = withValidatedWorktreeIdentity(
      {
        worktreeId: "   "
      },
      downstream
    );

    expect(emptyOutcome).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "invalid_value"
        }
      ]
    });
    expect(whitespaceOutcome).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "invalid_value"
        }
      ]
    });
    expect(downstream).not.toHaveBeenCalled();
  });
});
