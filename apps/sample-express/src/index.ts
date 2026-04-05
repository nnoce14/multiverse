import process from "node:process";
import { startApp } from "./app.js";

const dbPath = process.env.MULTIVERSE_DB_PATH;
const portEnv = process.env.MULTIVERSE_PORT;

if (!dbPath) {
  process.stderr.write("MULTIVERSE_DB_PATH is required\n");
  process.exit(1);
}

if (!portEnv) {
  process.stderr.write("MULTIVERSE_PORT is required\n");
  process.exit(1);
}

const port = parseInt(portEnv, 10);
if (isNaN(port)) {
  process.stderr.write(`MULTIVERSE_PORT must be a number, got: ${portEnv}\n`);
  process.exit(1);
}

const handle = await startApp({ dbPath, port });
process.stdout.write(`Sample Express app running at ${handle.baseUrl}\n`);
process.stdout.write(`Data file: ${dbPath}\n`);
