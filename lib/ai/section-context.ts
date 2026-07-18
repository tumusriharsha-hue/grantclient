import type { ProposalTemplateSection } from "@/lib/applications/proposal-template";

type SourceRoot = Record<string, unknown>;

export interface SectionSourceData {
  organization: SourceRoot;
  application: SourceRoot;
  grant: SourceRoot;
}

function getPath(data: SectionSourceData, path: string): unknown {
  const [root, ...parts] = path.split(".");
  let current: unknown = data[root as keyof SectionSourceData];
  for (const part of parts) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function buildSectionGenerationContext(
  template: ProposalTemplateSection,
  sources: SectionSourceData,
) {
  const allowedFields = [...template.requiredSources, ...template.optionalSources];
  const fields = Object.fromEntries(
    allowedFields
      .map((path) => [path, getPath(sources, path)] as const)
      .filter(([, value]) => hasValue(value)),
  );
  const missingRequired = template.requiredSources.filter(
    (path) => !hasValue(getPath(sources, path)),
  );
  return { fields, missingRequired, allowedFields };
}

export function ensureNeedsInputMarkers(content: string, missingRequired: string[]) {
  if (missingRequired.length === 0 || content.includes("[NEEDS INPUT:")) return content;
  return `${content.trim()}\n\n${missingRequired
    .map((field) => `[NEEDS INPUT: ${field}]`)
    .join("\n")}`;
}
