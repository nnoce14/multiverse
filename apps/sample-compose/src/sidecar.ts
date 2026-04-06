/**
 * Minimal in-memory key-value sidecar.
 *
 * Started by the process-port-scoped provider via multiverse reset.
 * Receives its port from the {PORT} token substitution in the provider command.
 *
 * Routes:
 *   GET  /health          → { ok: true, port }
 *   GET  /cache/:key      → { key, value }   (null if not set)
 *   POST /cache/:key      → { ok: true }     body: { value: string }
 */

import http from "node:http";

function main(): void {
  const portIndex = process.argv.indexOf("--port");
  const port = portIndex !== -1 ? parseInt(process.argv[portIndex + 1] ?? "", 10) : NaN;

  if (isNaN(port) || port <= 0) {
    process.stderr.write("--port <number> is required\n");
    process.exit(1);
  }

  const store = new Map<string, string>();

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);

    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, port }));
      return;
    }

    const cacheMatch = url.pathname.match(/^\/cache\/(.+)$/);
    if (cacheMatch) {
      const key = decodeURIComponent(cacheMatch[1]);

      if (req.method === "GET") {
        const value = store.get(key) ?? null;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ key, value }));
        return;
      }

      if (req.method === "POST") {
        let body = "";
        req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
        req.on("end", () => {
          const parsed = JSON.parse(body) as { value: string };
          store.set(key, parsed.value);
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        });
        return;
      }
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "not found" }));
  });

  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`sidecar ready on port ${port}\n`);
  });
}

main();
