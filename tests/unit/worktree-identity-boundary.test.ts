import { describe, expect, it } from "vitest";

import { validateWorktreeIdentity } from "../../packages/core/index";

describe("worktree identity boundary validation", () => {
  it("accepts a valid worktree identity input including the reserved main identity", () => {
    expect(
      validateWorktreeIdentity({
        worktreeId: "wt-feature-a"
      })
    ).toEqual({
      ok: true,
      value: {
        kind: "worktree_identity",
        value: "wt-feature-a"
      }
    });

    expect(
      validateWorktreeIdentity({
        worktreeId: "main"
      })
    ).toEqual({
      ok: true,
      value: {
        kind: "worktree_identity",
        value: "main"
      }
    });
  });

  it("returns a required-field validation error when worktree identity is missing", () => {
    expect(validateWorktreeIdentity({})).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "required"
        }
      ]
    });
  });

  it("returns an invalid-value validation error when worktree identity is empty or whitespace only", () => {
    expect(
      validateWorktreeIdentity({
        worktreeId: ""
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "invalid_value"
        }
      ]
    });

    expect(
      validateWorktreeIdentity({
        worktreeId: " \t "
      })
    ).toEqual({
      ok: false,
      errors: [
        {
          path: "worktreeId",
          code: "invalid_value"
        }
      ]
    });
  });
});
