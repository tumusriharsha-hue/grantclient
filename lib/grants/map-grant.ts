import type { GrantRow, TablesInsert } from "@/types/database";
import { sanitizeGrantText } from "@/lib/grants/sanitize-text";
import type { Grant } from "@/types/grant";

export function mapGrantRow(row: GrantRow): Grant {
  return {
    id: row.id,
    title: sanitizeGrantText(row.title),
    description: sanitizeGrantText(row.description),
    funder: sanitizeGrantText(row.funder),
    category: row.category as Grant["category"],
    region: row.region as Grant["region"],
    status: row.status as Grant["status"],
    amount: row.amount ?? undefined,
    deadline: row.deadline ?? undefined,
    applicationUrl: row.application_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapGrantToInsert(grant: Grant): TablesInsert<"grants"> {
  return {
    id: grant.id,
    title: grant.title,
    description: grant.description,
    funder: grant.funder,
    category: grant.category,
    region: grant.region,
    status: grant.status,
    amount: grant.amount ?? null,
    deadline: grant.deadline ?? null,
    application_url: grant.applicationUrl,
    created_at: grant.createdAt,
    updated_at: grant.updatedAt,
  };
}
