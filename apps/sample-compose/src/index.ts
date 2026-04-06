import process from "node:process";

import { startApp } from "./app.js";
import { readRuntimeConfigFromEnv } from "./runtime-config.js";

async function main(): Promise<void> {
  const config = readRuntimeConfigFromEnv();
  await startApp(config);
}

const isMainModule =
  process.argv[1] !== undefined &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href;

if (isMainModule) {
  await main();
}
