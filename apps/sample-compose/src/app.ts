/**
 * sample-compose app — demonstrates mixed-provider Multiverse composition.
 *
 * Three Multiverse-managed seams consumed at startup:
 *   dbPath     — path-scoped resource handle (absolute dir path for SQLite)
 *   cacheAddr  — process-port-scoped resource handle ("localhost:port")
 *   port       — derived from local-port endpoint address
 */

import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { Server } from "node:http";
import express from "express";

export interface AppConfig {
  /** Absolute directory path from path-scoped handle. SQLite file is placed inside. */
  dbPath: string;
  /** Cache sidecar address from process-port-scoped handle, e.g. "localhost:6042". */
  cacheAddr: string;
  /** Port to listen on, extracted from the local-port endpoint address. */
  port: number;
}

interface Item {
  id: number;
  name: string;
}

function withDb<T>(dbDir: string, fn: (db: DatabaseSync) => T): T {
  mkdirSync(dbDir, { recursive: true });
  const db = new DatabaseSync(join(dbDir, "app.db"));
  try {
    db.exec("PRAGMA journal_mode = DELETE");
    db.exec(
      "CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)"
    );
    return fn(db);
  } finally {
    db.close();
  }
}

export function createApp(config: AppConfig): express.Application {
  const app = express();
  app.use(express.json());

  const cacheBase = `http://${config.cacheAddr}`;

  app.get("/health", (_req, res) => {
    res.json({ ok: true, dbPath: config.dbPath, cacheAddr: config.cacheAddr, port: config.port });
  });

  // --- SQLite (path-scoped) routes ---

  app.get("/items", (_req, res) => {
    const items = withDb(config.dbPath, (db) =>
      db.prepare("SELECT id, name FROM items").all() as unknown as Item[]
    );
    res.json(items);
  });

  app.post("/items", (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const item = withDb(config.dbPath, (db) => {
      db.prepare("INSERT INTO items (name) VALUES (?)").run(name);
      return db.prepare("SELECT id, name FROM items ORDER BY id DESC LIMIT 1").get() as unknown as Item;
    });
    res.status(201).json(item);
  });

  // --- Cache sidecar (process-port-scoped) routes ---

  app.get("/cache/:key", async (req, res) => {
    try {
      const r = await fetch(`${cacheBase}/cache/${encodeURIComponent(req.params.key)}`);
      const body = await r.json() as { key: string; value: string | null };
      res.json(body);
    } catch (err) {
      res.status(502).json({ error: "sidecar unreachable", detail: String(err) });
    }
  });

  app.post("/cache/:key", async (req, res) => {
    const { value } = req.body as { value?: string };
    if (value === undefined) {
      res.status(400).json({ error: "value is required" });
      return;
    }
    try {
      const r = await fetch(`${cacheBase}/cache/${encodeURIComponent(req.params.key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
      const body = await r.json() as { ok: boolean };
      res.json(body);
    } catch (err) {
      res.status(502).json({ error: "sidecar unreachable", detail: String(err) });
    }
  });

  return app;
}

export interface AppHandle {
  address: string;
  close(): Promise<void>;
}

export async function startApp(config: AppConfig): Promise<AppHandle> {
  const app = createApp(config);
  return new Promise((resolve, reject) => {
    const server: Server = app.listen(config.port, "127.0.0.1", () => {
      resolve({
        address: `http://127.0.0.1:${config.port}`,
        close: () =>
          new Promise<void>((res, rej) =>
            server.close((err) => (err ? rej(err) : res()))
          )
      });
    });
    server.on("error", reject);
  });
}
