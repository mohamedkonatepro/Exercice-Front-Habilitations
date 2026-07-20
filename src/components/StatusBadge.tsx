import { Badge } from "@/components/ui/badge";
import {
  ACCESS_REQUEST_STATUS_LABELS,
  type AccessRequestStatus,
} from "@/schemas/accessRequests";

const STATUS_CLASSES: Record<AccessRequestStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
};

const DOT_CLASSES: Record<AccessRequestStatus, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
};

export function StatusBadge({ status }: { status: AccessRequestStatus }) {
  return (
    <Badge variant="outline" className={STATUS_CLASSES[status]}>
      <span aria-hidden className={`size-1.5 rounded-full ${DOT_CLASSES[status]}`} />
      {ACCESS_REQUEST_STATUS_LABELS[status]}
    </Badge>
  );
}
