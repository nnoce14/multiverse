import express from "express";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { Server } from "node:http";

export interface AppConfig {
  /** Absolute path to the JSON data file. Derived by multiverse path-scoped provider. */
  dbPath: string;
  /** Port to listen on. Derived by multiverse local-port provider. */
  port: number;
}

interface Item {
  id: number;
  name: string;
}

interface Store {
  items: Item[];
  nextId: number;
}

async function readStore(dbPath: string): Promise<Store> {
  try {
    const raw = await readFile(dbPath, "utf-8");
    return JSON.parse(raw) as Store;
  } catch {
    return { items: [], nextId: 1 };
  }
}

async function writeStore(dbPath: string, store: Store): Promise<void> {
  await mkdir(dirname(dbPath), { recursive: true });
  await writeFile(dbPath, JSON.stringify(store, null, 2), "utf-8");
}

export function createApp(config: AppConfig): express.Application {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, dbPath: config.dbPath, port: config.port });
  });

  app.get("/items", async (_req, res) => {
    const store = await readStore(config.dbPath);
    res.json(store.items);
  });

  app.post("/items", async (req, res) => {
    const { name } = req.body as { name?: string };
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const store = await readStore(config.dbPath);
    const item: Item = { id: store.nextId++, name };
    store.items.push(item);
    await writeStore(config.dbPath, store);
    res.status(201).json(item);
  });

  app.delete("/items", async (_req, res) => {
    await writeStore(config.dbPath, { items: [], nextId: 1 });
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
