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
      label: "Specifications",
      items: [
        "spec/glossary",
        "spec/product-spec",
        "spec/worktree-identity",
        "spec/resource-isolation",
        "spec/endpoint-model",
        "spec/provider-model",
        "spec/repository-configuration",
        "spec/safety-and-refusal",
        "spec/cli-output-shapes"
      ]
    },
    {
      type: "category",
      label: "Decisions",
      items: [
        "decisions/index",
        "decisions/agentic-foundation-first",
        "decisions/git-worktrees-only",
        "decisions/branch-name-is-metadata",
        "decisions/main-checkout-reserved-identity",
        "decisions/resource-isolation-strategies",
        "decisions/providers-implement-isolation-contracts",
        "decisions/endpoints-are-declared-objects",
        "decisions/repository-configuration-is-explicit",
        "decisions/unsafe-operations-are-refused",
        "decisions/explicit-responsibility-boundaries"
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
