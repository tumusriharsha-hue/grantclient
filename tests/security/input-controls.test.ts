import { describe, expect, it } from "vitest";
import { saveApplicationDraftSchema } from "@/lib/validations/application";
import { matchesDocumentSignature } from "@/lib/storage/organization-documents";

describe("security input controls", () => {
  it("rejects oversized or unknown draft fields", () => {
    const result = saveApplicationDraftSchema.safeParse({
      id: "00000000-0000-4000-8000-000000000000",
      title: "Draft",
      sections: [{ title: "Section", body: "ok", unexpected: "payload" }],
    });

    expect(result.success).toBe(false);
  });

  it("requires uploaded document bytes to match the declared MIME type", () => {
    expect(
      matchesDocumentSignature("application/pdf", new TextEncoder().encode("not a pdf")),
    ).toBe(false);
    expect(
      matchesDocumentSignature("application/pdf", new TextEncoder().encode("%PDF-1.7")),
    ).toBe(true);
  });
});
