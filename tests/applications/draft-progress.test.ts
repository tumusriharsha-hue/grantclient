import { describe, expect, it } from "vitest";
import { calculateDraftSectionProgress } from "@/lib/applications/defaults";

describe("calculateDraftSectionProgress", () => {
  it("starts with the setup baseline when every section is empty", () => {
    expect(calculateDraftSectionProgress(["", "  "], 2)).toBe(20);
  });

  it("increases according to populated sections", () => {
    expect(calculateDraftSectionProgress(["Draft", ""], 2)).toBe(60);
  });

  it("reaches 100 when every section has content", () => {
    expect(calculateDraftSectionProgress(["One", "Two"], 2)).toBe(100);
  });
});
