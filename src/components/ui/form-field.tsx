import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Props FormField hands to the control (input/select/textarea) via the render prop. */
export interface FieldControlProps {
  id: string;
  name: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Standard form field wrapper: label, control, error message. The control
 * receives its props (aria wiring) already prepared, so the error ↔ field
 * link cannot be forgotten at call sites. Error styling is handled by the
 * shadcn controls themselves via `aria-invalid`.
 */
export function FormField({ id, label, error, children }: FormFieldProps) {
  const hasError = error !== undefined;

  const control: FieldControlProps = {
    id,
    name: id,
    "aria-invalid": hasError,
    "aria-describedby": hasError ? `${id}-error` : undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(control)}
      {hasError && (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
