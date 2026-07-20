import { useQuery } from "@tanstack/react-query";
import { listApplications, listRoles } from "@/api/referentials";
import { queryKeys } from "@/lib/queryKeys";

// Referentials are immutable during a session: no need to re-fetch them.
const REFERENTIAL_STALE_TIME = Infinity;

export function useApplications() {
  return useQuery({
    queryKey: queryKeys.applications,
    queryFn: listApplications,
    staleTime: REFERENTIAL_STALE_TIME,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: listRoles,
    staleTime: REFERENTIAL_STALE_TIME,
  });
}
