import { Footer } from "components/footer";
import { Hero } from "components/hero";
import { TemplateMeta, Templates } from "components/templates";

import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs";
import { slugify } from "lib/slugify";
import { keywordOptions } from "lib/keywords";
import { Suspense } from "react";
import { Filters } from "components/filters";
import { TemplateGrid } from "components/template-grid";

const examplesPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "..",
  "examples"
);

const templates: TemplateMeta[] = fg
  .globSync(["**/package.json"], {
    cwd: examplesPath,
    deep: 2,
    onlyFiles: true,
  })
  .map((packageJsonPath) => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(examplesPath, packageJsonPath), "utf-8")
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
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const metadata = {
  metadataBase: new URL("https://developers.swing.xyz/examples"),
  title: "Swing Example Templates",
  description:
    "Find an example template to help you get started integrating with Swing.",
  openGraph: {
    type: "website",
    images: [
      {
        url: "https://developers.swing.xyz/examples/directory-landing.png",
        width: 1200,
        height: 838,
        alt: "Swing Example Templates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@swing_xyz",
    site: "@swing_xyz",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Directory() {
  return (
    <main>
      <Hero />

      <div id="templates">
        <div className="flex flex-col min-[960px]:flex-row container max-w-6xl gap-10 py-32">
          <div className="px-10 min-[960px]:w-56 min-[960px]:px-0">
            <Suspense>
              <Filters />
            </Suspense>
          </div>

          <div className="flex-grow">
            <Suspense fallback={<TemplateGrid templates={templates} />}>
              <Templates templates={templates} />
            </Suspense>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
