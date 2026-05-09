import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const buildDirectory = "apps/docs/build";

const forbiddenPatterns = [
  {
    name: "absolute CommonJS require emitted into browser bundle",
    pattern: /require\(["']\/(?:home|Users|mnt|tmp)\//u
  },
  {
    name: "generated Docusaurus CommonJS client module emitted into browser bundle",
    pattern: /webpack-internal:\/\/\/\.\/\.docusaurus\/client-modules\.js/u
  }
];

async function collectJavaScriptFiles(directory) {
  const entries = await readdir(directory);
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry);
    const info = await stat(path);
    if (info.isDirectory()) {
      files.push(...(await collectJavaScriptFiles(path)));
    } else if (path.endsWith(".js")) {
      files.push(path);
    }
  }

  return files;
}

async function readBuildBundles() {
  const files = await collectJavaScriptFiles(buildDirectory);
  return Promise.all(
    files.map(async (file) => ({
      label: file,
      text: await readFile(file, "utf8")
    }))
  );
}

async function readPreviewBundle() {
  const url = process.env.DOCS_PREVIEW_BUNDLE_URL;
  if (!url) {
    return [];
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch preview bundle ${url}: ${response.status} ${response.statusText}`);
  }

  return [{ label: url, text: await response.text() }];
}

async function main() {
  const bundles = [...(await readBuildBundles()), ...(await readPreviewBundle())];
  const failures = [];

  for (const bundle of bundles) {
    for (const forbidden of forbiddenPatterns) {
      if (forbidden.pattern.test(bundle.text)) {
        failures.push(`${bundle.label}: ${forbidden.name}`);
      }
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Verified ${bundles.length} docs client bundle(s).`);
}

await main();
