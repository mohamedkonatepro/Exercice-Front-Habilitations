interface QueryStateLike {
  isPending: boolean;
  isError: boolean;
}

/**
 * Combined state of several parallel queries: pending while at least one
 * is pending, in error as soon as one failed. Shared by every screen that
 * joins a resource with the referentials.
 */
export function combineQueryStates(...queries: QueryStateLike[]): QueryStateLike {
  return {
    isPending: queries.some((query) => query.isPending),
    isError: queries.some((query) => query.isError),
  };
}
