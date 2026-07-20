import { useState, type FormEvent } from "react";
import { useApplications, useRoles } from "@/hooks/useReferentials";
import { useCreateAccessRequest } from "@/hooks/useAccessRequests";
import { ApiError, getErrorMessage } from "@/lib/http";
import {
  createAccessRequestInputSchema,
  isCreateFieldName,
  MIN_REASON_LENGTH,
  type CreateFieldErrors,
} from "@/schemas/accessRequests";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { ErrorAlert } from "@/components/ui/error-alert";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";

interface CreateAccessRequestModalProps {
  onClose: () => void;
}

interface FormValues {
  requesterName: string;
  applicationId: string;
  roleId: string;
  reason: string;
}

const EMPTY_FORM: FormValues = {
  requesterName: "",
  applicationId: "",
  roleId: "",
  reason: "",
};

/** Maps Zod (client) or API (400) errors onto the known form fields. */
function toFieldErrors(entries: Iterable<[unknown, string]>): CreateFieldErrors {
  const fieldErrors: CreateFieldErrors = {};
  for (const [field, message] of entries) {
    if (isCreateFieldName(field) && fieldErrors[field] === undefined) {
      fieldErrors[field] = message;
    }
  }
  return fieldErrors;
}

export function CreateAccessRequestModal({ onClose }: CreateAccessRequestModalProps) {
  const applicationsQuery = useApplications();
  const rolesQuery = useRoles();
  const createRequest = useCreateAccessRequest();

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<CreateFieldErrors>({});

  const setValue = (field: keyof FormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = createAccessRequestInputSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(
        toFieldErrors(parsed.error.issues.map((issue) => [issue.path[0], issue.message])),
      );
      return;
    }

    setFieldErrors({});
    createRequest.mutate(parsed.data, {
      onSuccess: onClose,
      onError: (error) => {
        if (error instanceof ApiError && error.status === 400) {
          setFieldErrors(toFieldErrors(Object.entries(error.fieldErrors)));
        }
      },
    });
  };

  // Error not tied to a field (500, network…): banner + manual retry,
  // the form input is preserved.
  const serverError =
    createRequest.isError &&
    !(createRequest.error instanceof ApiError && createRequest.error.status === 400)
      ? createRequest.error
      : null;

  const referentialsPending = applicationsQuery.isPending || rolesQuery.isPending;

  return (
    <Modal title="Nouvelle demande d'accès" onClose={onClose}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField id="requesterName" label="Demandeur" error={fieldErrors.requesterName}>
          {(control) => (
            <Input
              type="text"
              value={values.requesterName}
              onChange={(e) => setValue("requesterName", e.target.value)}
              {...control}
            />
          )}
        </FormField>

        <FormField id="applicationId" label="Application" error={fieldErrors.applicationId}>
          {(control) => (
            <NativeSelect
              className="w-full"
              value={values.applicationId}
              onChange={(e) => setValue("applicationId", e.target.value)}
              disabled={referentialsPending}
              {...control}
            >
              <NativeSelectOption value="">
                {referentialsPending ? "Chargement…" : "— Sélectionner une application —"}
              </NativeSelectOption>
              {applicationsQuery.data?.map((application) => (
                <NativeSelectOption key={application.id} value={application.id}>
                  {application.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </FormField>

        <FormField id="roleId" label="Rôle" error={fieldErrors.roleId}>
          {(control) => (
            <NativeSelect
              className="w-full"
              value={values.roleId}
              onChange={(e) => setValue("roleId", e.target.value)}
              disabled={referentialsPending}
              {...control}
            >
              <NativeSelectOption value="">
                {referentialsPending ? "Chargement…" : "— Sélectionner un rôle —"}
              </NativeSelectOption>
              {rolesQuery.data?.map((role) => (
                <NativeSelectOption key={role.id} value={role.id}>
                  {role.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          )}
        </FormField>

        <FormField id="reason" label="Justification" error={fieldErrors.reason}>
          {(control) => (
            <Textarea
              rows={3}
              value={values.reason}
              onChange={(e) => setValue("reason", e.target.value)}
              placeholder={`Au moins ${MIN_REASON_LENGTH} caractères`}
              {...control}
            />
          )}
        </FormField>

        {serverError && (
          <ErrorAlert>
            {getErrorMessage(serverError, "Erreur réseau, veuillez réessayer.")}
          </ErrorAlert>
        )}

        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={createRequest.isPending}>
            {createRequest.isPending
              ? "Envoi…"
              : serverError
                ? "Réessayer"
                : "Créer la demande"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
