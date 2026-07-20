import { useState, type ReactNode } from "react";
import { useAccessRequest, useReviewAccessRequest } from "@/hooks/useAccessRequests";
import { useApplications, useRoles } from "@/hooks/useReferentials";
import { toAccessRequestViews } from "@/hooks/useAccessRequestViews";
import { combineQueryStates } from "@/lib/combineQueryStates";
import { formatDateTime } from "@/lib/formatDateTime";
import { getErrorMessage } from "@/lib/http";
import type { ReviewDecision } from "@/schemas/accessRequests";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "./StatusBadge";

interface AccessRequestDetailModalProps {
  requestId: string;
  onClose: () => void;
}

const DECISION_LABELS: Record<ReviewDecision, string> = {
  APPROVED: "Approuver",
  REJECTED: "Rejeter",
};

function SummaryItem({
  term,
  children,
  wide = false,
}: {
  term: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-full" : undefined}>
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {term}
      </dt>
      <dd className="m-0 mt-0.5">{children}</dd>
    </div>
  );
}

/**
 * Request detail (fetched via GET /api/access-requests/:id).
 * A PENDING request also gets the review section; otherwise the
 * decision date and comment are shown.
 */
export function AccessRequestDetailModal({ requestId, onClose }: AccessRequestDetailModalProps) {
  const requestQuery = useAccessRequest(requestId);
  const applicationsQuery = useApplications();
  const rolesQuery = useRoles();
  const reviewRequest = useReviewAccessRequest();
  const [reviewComment, setReviewComment] = useState("");

  const { isPending, isError } = combineQueryStates(
    requestQuery,
    applicationsQuery,
    rolesQuery,
  );

  const view =
    requestQuery.data && applicationsQuery.data && rolesQuery.data
      ? toAccessRequestViews([requestQuery.data], applicationsQuery.data, rolesQuery.data)[0]
      : undefined;

  const handleDecision = (decision: ReviewDecision) => {
    reviewRequest.mutate({
      id: requestId,
      decision,
      reviewComment: reviewComment.trim() || undefined,
    });
    // No close on success: invalidation re-fetches the detail and the
    // modal then shows the decision (date + comment).
  };

  const reviewErrorMessage = reviewRequest.isError
    ? getErrorMessage(reviewRequest.error, "Erreur réseau, veuillez réessayer.")
    : null;

  return (
    <Modal title="Détail de la demande" onClose={onClose}>
      {isPending ? (
        <p className="text-muted-foreground" role="status">
          Chargement de la demande…
        </p>
      ) : isError || view === undefined ? (
        <>
          <ErrorAlert>
            {getErrorMessage(requestQuery.error, "Impossible de charger la demande.")}
          </ErrorAlert>
          <div className="flex justify-end">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </>
      ) : (
        <>
          <dl className="m-0 grid grid-cols-2 gap-3">
            <SummaryItem term="Demandeur">{view.requesterName}</SummaryItem>
            <SummaryItem term="Statut">
              <StatusBadge status={view.status} />
            </SummaryItem>
            <SummaryItem term="Application">{view.applicationName}</SummaryItem>
            <SummaryItem term="Rôle">{view.roleLabel}</SummaryItem>
            <SummaryItem term="Créée le">{formatDateTime(view.createdAt)}</SummaryItem>
            <SummaryItem term="Justification" wide>
              {view.reason}
            </SummaryItem>
          </dl>

          {view.status === "PENDING" ? (
            <>
              <FormField id="reviewComment" label="Commentaire (optionnel)">
                {(control) => (
                  <Textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    disabled={reviewRequest.isPending}
                    {...control}
                  />
                )}
              </FormField>

              {reviewErrorMessage && <ErrorAlert>{reviewErrorMessage}</ErrorAlert>}

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={reviewRequest.isPending}
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDecision("REJECTED")}
                  disabled={reviewRequest.isPending}
                >
                  {reviewRequest.isPending ? "Envoi…" : DECISION_LABELS.REJECTED}
                </Button>
                <Button
                  onClick={() => handleDecision("APPROVED")}
                  disabled={reviewRequest.isPending}
                >
                  {reviewRequest.isPending ? "Envoi…" : DECISION_LABELS.APPROVED}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                <p className="m-0 font-semibold">
                  Traitée le {view.reviewedAt ? formatDateTime(view.reviewedAt) : "—"}
                </p>
                <p className="m-0 mt-1 text-muted-foreground">
                  {view.reviewComment ?? "Aucun commentaire."}
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={onClose}>Fermer</Button>
              </div>
            </>
          )}
        </>
      )}
    </Modal>
  );
}
