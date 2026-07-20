import type { AccessRequestFilters } from "@/api/accessRequests";

/**
 * Single source of truth for TanStack Query cache keys: queries and
 * invalidations always agree, and refactoring a key cannot silently
 * desynchronize the cache.
 */
export const queryKeys = {
  accessRequests: {
    all: ["access-requests"] as const,
    list: (filters: AccessRequestFilters) =>
      [...queryKeys.accessRequests.all, filters] as const,
    detail: (id: string) => [...queryKeys.accessRequests.all, id] as const,
  },
  applications: ["applications"] as const,
  roles: ["roles"] as const,
};
