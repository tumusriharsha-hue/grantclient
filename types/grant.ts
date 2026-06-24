export type GrantStatus = "draft" | "open" | "closed" | "awarded";

export interface Grant {
  id: string;
  title: string;
  description: string;
  status: GrantStatus;
  amount?: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GrantListParams {
  status?: GrantStatus;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
