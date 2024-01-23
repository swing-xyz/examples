import type { TemplateMeta } from "components/templates";

import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs";
import { slugify } from "lib/slugify";
import { keywordOptions } from "lib/keywords";

const examplesPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "examples"
);

export function getTemplates() {
  const files = fg.globSync(["**/package.json"], {
    cwd: examplesPath,
    deep: 2,
    onlyFiles: true,
  });

  const templates: TemplateMeta[] = files.map((packageJsonPath) => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(examplesPath, packageJsonPath), {
        encoding: "utf-8",
      })
    );

    if (!packageJson.name) {
      console.log(packageJson);
    }

    const keywords: string[] =
      packageJson.keywords?.map((keyword: string) => slugify(keyword)) || [];

    const template = {
      integration: keywordOptions.Integration.find((integration) =>
        packageJson.name.includes(slugify(integration))
      ),
      framework: keywordOptions.Framework.find((framework) =>
        keywords.includes(slugify(framework))
      ),
      wallet: keywordOptions.Wallet.find((wallet) =>
        keywords.includes(slugify(wallet))
      ),
      "use-case": keywordOptions["Use Case"].find((useCase) =>
        packageJson.name.includes(slugify(useCase))
      ),
    };

    return {
      id: packageJson.name,
      name: `${template["use-case"]} ${template.integration} in ${template.framework}`,
      description: `${template.framework} example showcasing how to integrate the ${template["use-case"]} ${template.integration}.`,
      url:
        packageJson.demo ||
        `https://github.com/swing-xyz/examples/tree/main/examples/${packageJson.name}`,
      keywords,
      ...template,
    };
  });

  return templates.sort((a, b) => a.name.localeCompare(b.name));
}
