import express from "express";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Server } from "node:http";

export interface AppConfig {
  /** Absolute path to the SQLite database file. Derived by multiverse path-scoped provider. */
  dbPath: string;
  /** Port to listen on. Derived by multiverse local-port provider. */
  port: number;
}

interface Item {
  id: number;
  name: string;
}

/**
 * Open the database at dbPath for the duration of fn, then close it.
 * Creates the parent directory and schema on first access.
 * Using per-call open/close so that after a reset/cleanup (file deletion),
 * the next call recreates a fresh empty database at the same path.
 */
function withDb<T>(dbPath: string, fn: (db: DatabaseSync) => T): T {
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
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

  app.get("/health", (_req, res) => {
    res.json({ ok: true, dbPath: config.dbPath, port: config.port });
  });

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
      const result = db.prepare("INSERT INTO items (name) VALUES (?)").run(name);
      return { id: result.lastInsertRowid as number, name };
    });
    res.status(201).json(item);
  });

  app.delete("/items", (_req, res) => {
    withDb(config.dbPath, (db) => {
      db.exec("DELETE FROM items");
    });
    res.json({ ok: true });
  });

  return app;
}

export interface AppHandle {
  baseUrl: string;
  close(): Promise<void>;
}

export async function startApp(config: AppConfig): Promise<AppHandle> {
  const app = createApp(config);

  const server = await new Promise<Server>((resolve, reject) => {
    const s = app.listen(config.port, () => resolve(s));
    s.on("error", reject);
  });

  return {
    baseUrl: `http://localhost:${config.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      })
  };
}
