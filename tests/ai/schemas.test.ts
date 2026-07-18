import { describe, expect, it } from "vitest";
import {
  draftSectionOutputSchema,
  matchExplanationBatchSchema,
  parseMatchExplanationResponse,
} from "@/lib/ai/schemas";

describe("AI response schemas", () => {
  it("does not allow an explanation to alter a score", () => {
    const result = matchExplanationBatchSchema.safeParse({
      explanations: [{
        grantId: "grant-1",
        summary: "Strong fit.",
        strengths: ["Aligned focus"],
        caution: null,
        totalScore: 100,
      }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid explanation JSON shapes", () => {
    expect(matchExplanationBatchSchema.safeParse({ explanations: "invalid" }).success).toBe(false);
  });

  it("falls back safely for invalid provider JSON", () => {
    expect(parseMatchExplanationResponse("not-json")).toBeNull();
    expect(parseMatchExplanationResponse('{"explanations":"invalid"}')).toBeNull();
  });

  it("validates section generation output", () => {
    const result = draftSectionOutputSchema.safeParse({
      content: "Project facts only.",
      missingInformation: [],
      usedSourceFields: ["application.projectSummary"],
    });
    expect(result.success).toBe(true);
  });
});
