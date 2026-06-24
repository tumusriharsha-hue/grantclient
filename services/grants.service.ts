import { apiClient } from "@/lib/api-client";
import type { Grant, GrantListParams, PaginatedResponse } from "@/types";

const GRANTS_PATH = "/grants";

export async function getGrants(
  params: GrantListParams = {},
): Promise<PaginatedResponse<Grant>> {
  const { status, page, limit } = params;

  return apiClient<PaginatedResponse<Grant>>(GRANTS_PATH, {
    params: { status, page, limit },
  });
}

export async function getGrantById(id: string): Promise<Grant> {
  return apiClient<Grant>(`${GRANTS_PATH}/${id}`);
}

export async function createGrant(
  input: Pick<Grant, "title" | "description">,
): Promise<Grant> {
  return apiClient<Grant>(GRANTS_PATH, {
    method: "POST",
    body: input,
  });
}
