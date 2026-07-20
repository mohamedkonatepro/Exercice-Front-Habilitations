import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "./http";

const MAX_QUERY_RETRIES = 2;

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retrying a GET is safe (idempotent), but pointless on a 4xx.
      retry: (failureCount, error) =>
        !isClientError(error) && failureCount < MAX_QUERY_RETRIES,
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Never auto-retry a mutation: a POST is not idempotent, retrying
      // is left to the user (the "Réessayer" button).
      retry: false,
    },
  },
});
