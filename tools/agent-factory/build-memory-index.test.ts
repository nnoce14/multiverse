import { describe, expect, it } from "vitest";
import { buildMemoryIndex, type MemoryIndexAgentFile } from "./build-memory-index.js";

describe("buildMemoryIndex", () => {
  it("indexes only active non-superseded memory entries", () => {
    const agentIndexes: MemoryIndexAgentFile[] = [
      {
        agent_id: "product-truth-steward",
        team: "core",
        last_updated: "2026-05-09",
        source_file: "agents/core/product-truth-steward/index.json",
        entries: [
          {
            id: "active-entry",
            type: "lesson",
            topic: "truth",
            summary: "Current lesson.",
            confidence: 1,
            source_ids: ["src-multiverse-old-reference"],
            iteration: 0,
            status: "active",
            supersedes: ["superseded-by-reference"]
          },
          {
            id: "superseded-by-status",
            type: "lesson",
            topic: "truth",
            summary: "Old lesson.",
            confidence: 0.5,
            source_ids: [],
            iteration: 0,
            status: "superseded",
            supersedes: []
          },
          {
            id: "superseded-by-reference",
            type: "lesson",
            topic: "truth",
            summary: "Referenced old lesson.",
            confidence: 0.5,
            source_ids: [],
            iteration: 0,
            status: "active",
            supersedes: []
          }
        ]
      }
    ];

    const output = buildMemoryIndex(agentIndexes);

    expect(output).toMatchObject({
      agent_count: 1,
      entry_count: 1,
      superseded_entry_count: 2
    });
    expect(output.entries.map((entry) => entry.id)).toEqual(["active-entry"]);
  });
});
