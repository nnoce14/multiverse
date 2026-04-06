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

  const appHttpUrl = env["APP_HTTP_URL"];
  if (!appHttpUrl) {
    throw new Error("APP_HTTP_URL is required");
  }

  return {
    dbPath,
    cacheAddr,
    port: parsePortFromUrl(appHttpUrl)
  };
}

function parsePortFromUrl(address: string): number {
  const port = Number.parseInt(new URL(address).port, 10);
  if (Number.isNaN(port)) {
    throw new Error(`APP_HTTP_URL must include a numeric port: ${address}`);
  }
  return port;
}
