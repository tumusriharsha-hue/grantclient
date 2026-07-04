import { z } from "zod";
import {
  MISSION_CATEGORIES,
  ORGANIZATION_TYPES,
} from "@/types/organization";

const organizationTypeSchema = z.enum(ORGANIZATION_TYPES);
const focusAreaSchema = z.enum(MISSION_CATEGORIES);

export const organizationProfileSchema = z.object({
  organization_name: z
    .string()
    .trim()
    .min(1, "Organization name is required"),
  mission: z
    .string()
    .trim()
    .min(10, "Mission statement must be at least 10 characters")
    .max(500, "Mission statement must be 500 characters or fewer"),
  location: z.string().trim().min(1, "Location is required"),
  organization_type: organizationTypeSchema,
  keywords: z
    .array(focusAreaSchema)
    .min(1, "Select at least one focus area"),
  budget: z
    .union([
      z.literal(""),
      z.coerce.number().int().positive("Budget must be a positive number"),
    ])
    .optional()
    .transform((value) => (value === "" || value === undefined ? null : value)),
  is_501c3: z.boolean().optional().default(false),
});

export type OrganizationProfileInput = z.input<typeof organizationProfileSchema>;
export type OrganizationProfileValues = z.output<typeof organizationProfileSchema>;
