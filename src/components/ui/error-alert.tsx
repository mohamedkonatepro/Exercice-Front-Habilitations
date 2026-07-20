import type { ReactNode } from "react";
import { AlertCircleIcon } from "lucide-react";
import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert";

interface ErrorAlertProps {
  children: ReactNode;
  /** Optional action (e.g. a retry button) shown at the right of the alert. */
  action?: ReactNode;
}

/** Single error banner used everywhere a query or mutation fails. */
export function ErrorAlert({ children, action }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{children}</AlertTitle>
      {action && <AlertAction>{action}</AlertAction>}
    </Alert>
  );
}
