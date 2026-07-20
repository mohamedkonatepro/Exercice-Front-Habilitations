import { z } from "zod";
import { fetchData } from "@/lib/http";
import {
  accessRequestSchema,
  type AccessRequest,
  type AccessRequestStatus,
  type CreateAccessRequestInput,
  type ReviewAccessRequestInput,
} from "@/schemas/accessRequests";

const ACCESS_REQUESTS_URL = "/api/access-requests";
const accessRequestListSchema = z.array(accessRequestSchema);

export interface AccessRequestFilters {
  status?: AccessRequestStatus;
  q?: string;
}

function buildListUrl(filters: AccessRequestFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.q) params.set("q", filters.q);
  const queryString = params.toString();
  return queryString ? `${ACCESS_REQUESTS_URL}?${queryString}` : ACCESS_REQUESTS_URL;
}

export function listAccessRequests(
  filters: AccessRequestFilters = {},
): Promise<AccessRequest[]> {
  return fetchData(buildListUrl(filters), accessRequestListSchema);
}

export function getAccessRequest(id: string): Promise<AccessRequest> {
  return fetchData(
    `${ACCESS_REQUESTS_URL}/${encodeURIComponent(id)}`,
    accessRequestSchema,
  );
}

export function createAccessRequest(
  input: CreateAccessRequestInput,
): Promise<AccessRequest> {
  return fetchData(ACCESS_REQUESTS_URL, accessRequestSchema, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function reviewAccessRequest({
  id,
  decision,
  reviewComment,
}: ReviewAccessRequestInput): Promise<AccessRequest> {
  return fetchData(
    `${ACCESS_REQUESTS_URL}/${encodeURIComponent(id)}/review`,
    accessRequestSchema,
    {
      method: "PATCH",
      body: JSON.stringify({ decision, reviewComment }),
    },
  );
}
