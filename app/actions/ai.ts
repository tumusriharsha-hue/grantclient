"use server";

import { revalidatePath } from "next/cache";
import { generateMatchExplanations } from "@/lib/ai/match-explanations";
import { generateProposalSection } from "@/lib/ai/generate-section";
import { z } from "zod";

export async function refreshGrantExplanations() {
  const result = await generateMatchExplanations();
  if (result.success) revalidatePath("/dashboard");
  return result;
}

const sectionRequestSchema = z.object({
  applicationId: z.uuid(),
  sectionKey: z.string().min(1).max(100),
});

export async function generateApplicationSection(input: {
  applicationId: string;
  sectionKey: string;
}) {
  const parsed = sectionRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, code: "invalid_request", error: "Invalid section request." };
  }
  return generateProposalSection(parsed.data.applicationId, parsed.data.sectionKey);
}
