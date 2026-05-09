import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import webpack from "webpack";

const baseUrl = process.env.DOCUSAURUS_BASE_URL ?? "/multiverse/";
const currentDir = dirname(fileURLToPath(import.meta.url));
const clientModulesPath = resolve(currentDir, "src/client-modules.ts");

const config: Config = {
  title: "Multiverse",
  tagline: "Deterministic local runtime isolation for parallel git worktrees.",
  favicon: "img/favicon.svg",

  url: "https://nnoce14.github.io",
  baseUrl,

  organizationName: "nnoce14",
  projectName: "multiverse",

  future: {
    experimental_router: "hash"
  },

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn"
    }
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "../../docs",
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl: "https://github.com/nnoce14/multiverse/edit/main/docs/"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      } satisfies Preset.Options
    ]
  ],

  plugins: [
    function generatedClientModulesEsm() {
      return {
        name: "generated-client-modules-esm",
        configureWebpack() {
          return {
            plugins: [
              // Docusaurus generates this module with CommonJS require calls; keep the docs package ESM.
              new webpack.NormalModuleReplacementPlugin(
                /^@generated\/client-modules$/,
                clientModulesPath
              )
            ]
          };
        }
      };
    }
  ],

  themeConfig: {
    image: "img/multiverse-social.svg",
    navbar: {
      title: "Multiverse",
      logo: {
        alt: "Multiverse",
        src: "img/logo.svg"
      },
      items: [
        { to: "/docs/agent-factory/", label: "Agent Swarm", position: "left" },
        { to: "/docs/development/current-state", label: "Development", position: "left" },
        {
          href: "https://github.com/nnoce14/multiverse",
          label: "GitHub",
          position: "right"
        }
      ]
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Workflow",
          items: [
            { label: "Agent Swarm", to: "/docs/agent-factory/" },
            { label: "Current State", to: "/docs/development/current-state" },
            { label: "Roadmap", to: "/docs/development/roadmap" }
          ]
        },
        {
          title: "Repository",
          items: [
            { label: "GitHub", href: "https://github.com/nnoce14/multiverse" },
            { label: "Decisions", href: "https://github.com/nnoce14/multiverse/tree/main/decisions" },
            { label: "Agents", href: "https://github.com/nnoce14/multiverse/tree/main/agents" }
          ]
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Multiverse.`
    },
    prism: {
      additionalLanguages: ["bash", "json"]
    }
  } satisfies Preset.ThemeConfig
};

export default config;
