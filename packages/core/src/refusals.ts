import type {
  Refusal,
  ResolveSlice01Result,
  ResolveSlice02Result
} from "@multiverse/provider-contracts";

export type FailureResult = Extract<ResolveSlice01Result, { ok: false }>;

export function invalidConfiguration(reason: string): FailureResult {
  return {
    ok: false,
    refusal: {
      category: "invalid_configuration",
      reason
    }
  };
}

export function unsafeScope(reason: string): FailureResult {
  return {
    ok: false,
    refusal: {
      category: "unsafe_scope",
      reason
    }
  };
}

export function unsupportedCapability(
  reason: string
): Extract<ResolveSlice02Result, { ok: false }> {
  return {
    ok: false,
    refusal: {
      category: "unsupported_capability",
      reason
    }
  };
}

export function isRefusal(value: unknown): value is Refusal {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "reason" in value
  );
}
