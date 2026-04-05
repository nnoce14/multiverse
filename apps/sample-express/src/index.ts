import process from "node:process";
import { startApp } from "./app.js";

// Env vars injected by `multiverse run` following ADR-0013 naming convention:
//   MULTIVERSE_RESOURCE_APP_DB  — path-scoped handle for the "app-db" resource
//   MULTIVERSE_ENDPOINT_HTTP    — full address for the "http" endpoint (e.g. http://localhost:5200)
const dbPath = process.env["MULTIVERSE_RESOURCE_APP_DB"];
const endpointAddress = process.env["MULTIVERSE_ENDPOINT_HTTP"];

if (!dbPath) {
  process.stderr.write("MULTIVERSE_RESOURCE_APP_DB is required\n");
  process.exit(1);
}

if (!endpointAddress) {
  process.stderr.write("MULTIVERSE_ENDPOINT_HTTP is required\n");
  process.exit(1);
}

const portStr = new URL(endpointAddress).port;
const port = parseInt(portStr, 10);
if (isNaN(port) || port === 0) {
  process.stderr.write(`Cannot parse port from MULTIVERSE_ENDPOINT_HTTP: ${endpointAddress}\n`);
  process.exit(1);
}

const handle = await startApp({ dbPath, port });
process.stdout.write(`Sample Express app running at ${handle.baseUrl}\n`);
process.stdout.write(`Database: ${dbPath}\n`);
