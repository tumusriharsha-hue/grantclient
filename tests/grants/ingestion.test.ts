import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { simplerGrantsGovAdapter } from "@/lib/grants/ingestion/adapters/simpler-grants-gov";
import { deduplicateGrants } from "@/lib/grants/ingestion/deduplicate";
import {
  isRollingText,
  normalizeStates,
  normalizeUrl,
  parseDate,
  parseFundingRange,
  stripUnsafeHtml,
} from "@/lib/grants/ingestion/normalize";
import type { NormalizedGrantRecord } from "@/lib/grants/ingestion/types";
import { buildValidationGates, validateGrant } from "@/lib/grants/ingestion/validate";

const rawSimplerOpportunity = {
  opportunity_id: "11111111-2222-3333-4444-555555555555",
  opportunity_number: "TEST-2026-01",
  opportunity_status: "posted",
  opportunity_title: "Community Health Grant",
  agency_name: "Department of Health",
  top_level_agency_name: "Department of Health",
  summary: {
    applicant_types: [
      "nonprofits_non_higher_education_with_501c3",
      "nonprofits_non_higher_education_without_501c3",
    ],
    applicant_eligibility_description: "Not-for-profit organizations are eligible. Individuals are not eligible.",
    award_floor: 10_000,
    award_ceiling: 50_000,
    close_date: "2026-12-31",
    close_date_description: "Applications close at 11:59 PM ET.",
    estimated_total_program_funding: 500_000,
    funding_categories: ["health"],
    funding_category_description: "Community health",
    funding_instruments: ["grant"],
    is_cost_sharing: false,
    post_date: "2026-08-01",
    summary_description: "<p>Supports <strong>community health</strong> programs.</p>",
    updated_at: "2026-08-02T00:00:00Z",
    agency_contact_description: "Grant Office\ngrants@example.gov",
    agency_email_address: "grants@example.gov",
  },
};

async function normalizedFixture(): Promise<NormalizedGrantRecord> {
  const record = await simplerGrantsGovAdapter.normalize(
    rawSimplerOpportunity,
    new Date("2026-08-05T12:00:00Z"),
  );
  if (!record) throw new Error("Fixture failed to normalize");
  return record;
}

describe("grant ingestion normalization", () => {
  it("parses dates without inventing invalid values", () => {
    expect(parseDate("Deadline: 2026-12-31 17:00")).toBe("2026-12-31");
    expect(parseDate("not a date")).toBeNull();
  });

  it("parses funding ranges and suffixes", () => {
    expect(parseFundingRange("$10,000–$50,000")).toEqual({ minimum: 10_000, maximum: 50_000 });
    expect(parseFundingRange("Up to $1.5 million")).toEqual({ minimum: 1_500_000, maximum: 1_500_000 });
  });

  it("normalizes state names and rolling language", () => {
    expect(normalizeStates(["California", "tx", "California"])).toEqual(["CA", "TX"]);
    expect(isRollingText("Applications are accepted year-round")).toBe(true);
    expect(isRollingText("Deadline December 1")).toBe(false);
  });

  it("sanitizes HTML and rejects unsafe URLs", () => {
    expect(stripUnsafeHtml("<script>alert(1)</script><p>Hello &amp; welcome</p>")).toBe("Hello & welcome");
    expect(normalizeUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeUrl("http://example.com")).toBeNull();
  });
});

describe("Simpler.Grants.gov adapter", () => {
  it("maps an official nonprofit opportunity into the canonical schema", async () => {
    const record = await normalizedFixture();
    expect(record.source).toBe("simpler_grants_gov");
    expect(record.nonprofitEligible).toBe(true);
    expect(record.requires501c3).toBe(false);
    expect(record.minimumAward).toBe(10_000);
    expect(record.maximumAward).toBe(50_000);
    expect(record.deadline).toBe("2026-12-31");
    expect(record.focusAreas).toEqual(["Health"]);
    expect(record.description).not.toContain("<strong>");
    expect(record.contentHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("does not store long funding-category prose as a focus-area label", async () => {
    const record = await simplerGrantsGovAdapter.normalize({
      ...rawSimplerOpportunity,
      summary: {
        ...rawSimplerOpportunity.summary,
        funding_categories: [],
        funding_category_description: "A".repeat(200),
      },
    });
    expect(record?.focusAreas).toEqual(["Capacity Building"]);
  });

  it("does not infer nonprofit eligibility from general prose alone", async () => {
    const record = await simplerGrantsGovAdapter.normalize({
      ...rawSimplerOpportunity,
      summary: { ...rawSimplerOpportunity.summary, applicant_types: ["individuals"] },
    });
    expect(record?.nonprofitEligible).toBe(false);
  });
});

describe("validation and deduplication", () => {
  it("rejects expired and non-nonprofit records", async () => {
    const record = await normalizedFixture();
    expect(validateGrant({ ...record, nonprofitEligible: false })).toMatchObject({ reason: "NONPROFIT_NOT_ELIGIBLE" });
    expect(validateGrant({ ...record, deadline: "2020-01-01" }, new Date("2026-08-05T12:00:00Z"))).toMatchObject({ reason: "EXPIRED" });
  });

  it("removes exact duplicates and reports fingerprint candidates separately", async () => {
    const record = await normalizedFixture();
    const exact = { ...record, id: "exact-copy" };
    const review = {
      ...record,
      id: "review-copy",
      sourceRecordId: "different-id",
      sourceUrl: "https://simpler.grants.gov/opportunity/different-id",
      sourceApplicationUrl: "https://simpler.grants.gov/opportunity/different-id",
    };
    const result = deduplicateGrants([record, exact, review]);
    expect(result.records.map((item) => item.id)).toEqual([record.id, review.id]);
    expect(result.duplicates).toContainEqual(expect.objectContaining({ recordId: "exact-copy", confidence: "exact" }));
    expect(result.duplicates).toContainEqual(expect.objectContaining({ recordId: "review-copy", confidence: "review" }));
  });

  it("blocks promotion when required gates fail", async () => {
    const record = await normalizedFixture();
    const gates = buildValidationGates([record], 202);
    expect(gates.find((gate) => gate.name === "minimum_record_count")?.passed).toBe(false);
    expect(gates.filter((gate) => gate.fatal).every((gate) => gate.passed)).toBe(false);
  });
});

describe("promotion and rollback migration", () => {
  const migration = readFileSync(
    resolve(process.cwd(), "supabase/migrations/20260805192757_grant_ingestion_pipeline.sql"),
    "utf8",
  );

  it("backs up before promoting and archives unmatched grants", () => {
    expect(migration.indexOf("insert into public.grant_ingestion_backups")).toBeLessThan(
      migration.indexOf("insert into public.grants ("),
    );
    expect(migration).toContain("set status = 'archived', is_active = false");
    expect(migration).toContain("if target_run.mode <> 'incremental' then");
    expect(migration).not.toContain("truncate table public.grants");
    expect(migration).toContain("create table public.grant_related_table_backups");
    expect(migration).toContain("from public.application_sections t");
  });

  it("preserves user-linked tables during promotion and rollback", () => {
    for (const table of ["saved_grants", "applications", "generated_proposals", "grant_match_snapshots", "ai_generation_records"]) {
      expect(migration).not.toContain(`delete from public.${table}`);
      expect(migration).not.toContain(`truncate public.${table}`);
    }
  });

  it("keeps ingestion tables inaccessible to normal application roles", () => {
    expect(migration).toContain("revoke all on public.grants_ingestion_staging from public, anon, authenticated");
    expect(migration).toContain("revoke all on function public.promote_grant_ingestion(uuid) from public, anon, authenticated");
  });
});
