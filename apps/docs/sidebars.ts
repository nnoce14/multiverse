import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "category",
      label: "Agent Swarm",
      items: [
        "agent-factory/README"
      ]
    },
    {
      type: "category",
      label: "Development",
      items: [
        "development/current-state",
        "development/roadmap",
        "development/repo-map"
      ]
    }
  ]
};

export default sidebars;
