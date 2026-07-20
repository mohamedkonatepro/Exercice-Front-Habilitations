import { useState } from "react";
import { InboxIcon } from "lucide-react";
import { useAccessRequestViews } from "@/hooks/useAccessRequestViews";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { formatDateTime } from "@/lib/formatDateTime";
import {
  AccessRequestFiltersBar,
  type AccessRequestFiltersValue,
} from "./AccessRequestFiltersBar";
import { Button } from "@/components/ui/button";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "./StatusBadge";

interface AccessRequestListProps {
  /** Approver profile: opens PENDING requests for review instead of read-only. */
  canReview: boolean;
  onSelectRequest: (requestId: string) => void;
}

const CELL_CLASSES = "border-t px-4 py-3 align-middle";
const HEADER_CELL_CLASSES =
  "h-11 px-4 text-left align-middle text-xs font-medium tracking-wider text-muted-foreground uppercase";

const SEARCH_DEBOUNCE_MS = 300;
const NO_FILTERS: AccessRequestFiltersValue = { status: "", q: "" };
const SKELETON_ROW_COUNT = 4;

export function AccessRequestList({ canReview, onSelectRequest }: AccessRequestListProps) {
  const [filters, setFilters] = useState<AccessRequestFiltersValue>(NO_FILTERS);
  const debouncedQ = useDebouncedValue(filters.q, SEARCH_DEBOUNCE_MS);

  const { views, isPending, isError, refetchAll } = useAccessRequestViews({
    status: filters.status || undefined,
    q: debouncedQ.trim() || undefined,
  });

  const hasActiveFilters = filters.status !== "" || filters.q.trim() !== "";

  return (
    <>
      <AccessRequestFiltersBar value={filters} onChange={setFilters} />

      {isPending ? (
        <div
          className="space-y-3 rounded-xl border bg-card p-4 shadow-sm"
          role="status"
          aria-label="Chargement des demandes…"
        >
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-11 w-full" />
          ))}
        </div>
      ) : isError ? (
        <ErrorAlert action={<Button size="sm" onClick={refetchAll}>Réessayer</Button>}>
          Impossible de charger les demandes.
        </ErrorAlert>
      ) : views.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed bg-card px-6 py-14 text-center shadow-sm">
          <InboxIcon aria-hidden className="mb-1 size-8 text-muted-foreground/50" />
          <p className="font-medium">
            {hasActiveFilters
              ? "Aucune demande ne correspond à votre recherche."
              : "Aucune demande pour le moment."}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasActiveFilters
              ? "Essayez d'ajuster vos filtres."
              : "Créez votre première demande d'accès pour commencer."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th scope="col" className={HEADER_CELL_CLASSES}>
                  Demandeur
                </th>
                <th scope="col" className={HEADER_CELL_CLASSES}>
                  Application
                </th>
                <th scope="col" className={HEADER_CELL_CLASSES}>
                  Rôle
                </th>
                <th scope="col" className={HEADER_CELL_CLASSES}>
                  Statut
                </th>
                <th scope="col" className={HEADER_CELL_CLASSES}>
                  Créée le
                </th>
                <th scope="col" className="px-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {views.map((request) => {
                const needsReview = canReview && request.status === "PENDING";
                return (
                  <tr key={request.id} className="transition-colors hover:bg-muted/40">
                    <td className={`${CELL_CLASSES} font-medium`}>{request.requesterName}</td>
                    <td className={CELL_CLASSES}>{request.applicationName}</td>
                    <td className={`${CELL_CLASSES} text-muted-foreground`}>
                      {request.roleLabel}
                    </td>
                    <td className={CELL_CLASSES}>
                      <StatusBadge status={request.status} />
                    </td>
                    <td className={`${CELL_CLASSES} text-muted-foreground`}>
                      {formatDateTime(request.createdAt)}
                    </td>
                    <td className={`${CELL_CLASSES} text-right`}>
                      <Button
                        variant={needsReview ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSelectRequest(request.id)}
                      >
                        {needsReview ? "À traiter" : "Détails"}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
