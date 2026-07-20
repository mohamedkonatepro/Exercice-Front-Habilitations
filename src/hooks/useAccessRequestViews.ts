import { useMemo } from "react";
import type { AccessRequestFilters } from "@/api/accessRequests";
import { combineQueryStates } from "@/lib/combineQueryStates";
import type { AccessRequest } from "@/schemas/accessRequests";
import type { Application, Role } from "@/schemas/referentials";
import { useAccessRequests } from "./useAccessRequests";
import { useApplications, useRoles } from "./useReferentials";

/**
 * View model: request enriched with application / role labels so
 * presentational components never do the join themselves.
 */
export interface AccessRequestView extends AccessRequest {
  applicationName: string;
  roleLabel: string;
}

const UNKNOWN_LABEL = "—";

/** Pure join requests × referentials (exported separately for tests). */
export function toAccessRequestViews(
  requests: AccessRequest[],
  applications: Application[],
  roles: Role[],
): AccessRequestView[] {
  const applicationNamesById = new Map(applications.map((a) => [a.id, a.name]));
  const roleLabelsById = new Map(roles.map((r) => [r.id, r.label]));

  return requests.map((request) => ({
    ...request,
    applicationName: applicationNamesById.get(request.applicationId) ?? UNKNOWN_LABEL,
    roleLabel: roleLabelsById.get(request.roleId) ?? UNKNOWN_LABEL,
  }));
}

export function useAccessRequestViews(filters: AccessRequestFilters = {}) {
  const requestsQuery = useAccessRequests(filters);
  const applicationsQuery = useApplications();
  const rolesQuery = useRoles();

  const views = useMemo(() => {
    if (!requestsQuery.data || !applicationsQuery.data || !rolesQuery.data) return [];
    return toAccessRequestViews(requestsQuery.data, applicationsQuery.data, rolesQuery.data);
  }, [requestsQuery.data, applicationsQuery.data, rolesQuery.data]);

  const queries = [requestsQuery, applicationsQuery, rolesQuery];

  return {
    views,
    ...combineQueryStates(...queries),
    refetchAll: () => {
      for (const query of queries) void query.refetch();
    },
  };
}
