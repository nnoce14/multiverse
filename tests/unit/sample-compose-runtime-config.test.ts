import { describe, expect, it } from "vitest";

import { readRuntimeConfigFromEnv } from "../../apps/sample-compose/src/runtime-config.js";

describe("sample-compose runtime config boundary", () => {
  it("maps app-native env vars to AppConfig", () => {
    const config = readRuntimeConfigFromEnv({
      DATABASE_PATH: "/tmp/app-db",
      CACHE_ADDR: "localhost:6401",
      PORT: "5401"
    });

    expect(config).toEqual({
      dbPath: "/tmp/app-db",
      cacheAddr: "localhost:6401",
      port: 5401
    });
  });

  it("refuses when DATABASE_PATH is missing", () => {
    expect(() =>
      readRuntimeConfigFromEnv({
        CACHE_ADDR: "localhost:6401",
        PORT: "5401"
      })
    ).toThrow("DATABASE_PATH is required");
  });

  it("refuses when CACHE_ADDR is missing", () => {
    expect(() =>
      readRuntimeConfigFromEnv({
        DATABASE_PATH: "/tmp/app-db",
        PORT: "5401"
      })
    ).toThrow("CACHE_ADDR is required");
  });

  it("refuses when PORT is missing", () => {
    expect(() =>
      readRuntimeConfigFromEnv({
        DATABASE_PATH: "/tmp/app-db",
        CACHE_ADDR: "localhost:6401"
      })
    ).toThrow("PORT is required");
  });

  it("refuses malformed PORT input", () => {
    expect(() =>
      readRuntimeConfigFromEnv({
        DATABASE_PATH: "/tmp/app-db",
        CACHE_ADDR: "localhost:6401",
        PORT: "not-a-number"
      })
    ).toThrow("PORT must be a numeric string");
  });

  it("does not fall back to raw MULTIVERSE_* env vars", () => {
    expect(() =>
      readRuntimeConfigFromEnv({
        MULTIVERSE_RESOURCE_APP_DB: "/tmp/app-db",
        MULTIVERSE_RESOURCE_CACHE_SIDECAR: "localhost:6401",
        MULTIVERSE_ENDPOINT_HTTP: "http://127.0.0.1:5401"
      })
    ).toThrow("DATABASE_PATH is required");
  });
});
