import process from "node:process";

import type { AppConfig } from "./app.js";

export function readRuntimeConfigFromEnv(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const dbPath = env["DATABASE_PATH"];
  if (!dbPath) {
    throw new Error("DATABASE_PATH is required");
  }

  const cacheAddr = env["CACHE_ADDR"];
  if (!cacheAddr) {
    throw new Error("CACHE_ADDR is required");
  }

  const port = env["PORT"];
  if (!port) {
    throw new Error("PORT is required");
  }

  return {
    dbPath,
    cacheAddr,
    port: parsePort(port)
  };
}

function parsePort(value: string): number {
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port)) {
    throw new Error(`PORT must be a numeric string: ${value}`);
  }
  return port;
}
