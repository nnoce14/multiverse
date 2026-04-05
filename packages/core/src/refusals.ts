import type {
  Refusal,
  DeriveOneResult,
  DeriveAndValidateOneResult
} from "@multiverse/provider-contracts";

export type FailureResult = Extract<DeriveOneResult, { ok: false }>;

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
): Extract<DeriveAndValidateOneResult, { ok: false }> {
  return {
    ok: false,
    refusal: {
      category: "unsupported_capability",
      reason
    }
  };
}

export function isFailureOutcome(value: unknown): value is FailureResult {
  return (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    (value as { ok: unknown }).ok === false
  );
}

export function isRefusal(value: unknown): value is Refusal {
  return (
    typeof value === "object" &&
    value !== null &&
    "category" in value &&
    "reason" in value
  );
}
