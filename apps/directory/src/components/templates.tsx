"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { keywordEntries } from "lib/keywords";
import { slugify } from "lib/slugify";
import { TemplateGrid } from "./template-grid";

export type TemplateMeta = {
  id: string;
  name: string;
  description: string;
  url: string;
  keywords: string[];
  integration?: string;
  framework?: string;
  wallet?: string;
  "use-case"?: string;
};

export function Templates({ templates }: { templates: TemplateMeta[] }) {
  const searchParams = useSearchParams();

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      for (const [filter] of keywordEntries) {
        const values = searchParams.getAll(slugify(filter));

        if (values.length) {
          if (!values.some((value) => template.keywords.includes(value))) {
            return false;
          }
        }
      }

      return true;
    });
  }, [searchParams, templates]);

  return <TemplateGrid templates={filteredTemplates} />;
}
