import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAccessRequest,
  getAccessRequest,
  listAccessRequests,
  reviewAccessRequest,
  type AccessRequestFilters,
} from "@/api/accessRequests";
import { queryKeys } from "@/lib/queryKeys";

export function useAccessRequests(filters: AccessRequestFilters = {}) {
  return useQuery({
    queryKey: queryKeys.accessRequests.list(filters),
    queryFn: () => listAccessRequests(filters),
    // When filters change, keep showing the previous results while
    // fetching instead of flashing a loading state.
    placeholderData: keepPreviousData,
  });
}

export function useAccessRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.accessRequests.detail(id),
    queryFn: () => getAccessRequest(id),
  });
}

export function useCreateAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAccessRequest,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accessRequests.all }),
  });
}

export function useReviewAccessRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewAccessRequest,
    // `onSettled` (not `onSuccess`): a 409 means our cache is stale
    // (the request was reviewed elsewhere) — resync in that case too.
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.accessRequests.all }),
  });
}
