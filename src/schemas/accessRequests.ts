import { z } from "zod";

export const accessRequestStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export type AccessRequestStatus = z.infer<typeof accessRequestStatusSchema>;

/** French status labels — shared by the badge and the status filter. */
export const ACCESS_REQUEST_STATUS_LABELS: Record<AccessRequestStatus, string> = {
  PENDING: "En attente",
  APPROVED: "Approuvée",
  REJECTED: "Rejetée",
};

export const accessRequestSchema = z.object({
  id: z.string(),
  requesterName: z.string(),
  applicationId: z.string(),
  roleId: z.string(),
  reason: z.string(),
  status: accessRequestStatusSchema,
  createdAt: z.string(),
  reviewedAt: z.string().nullable(),
  reviewComment: z.string().nullable(),
});
export type AccessRequest = z.infer<typeof accessRequestSchema>;

export const MIN_REASON_LENGTH = 10;

/**
 * Single schema for client-side validation AND the creation payload type:
 * the rules (same as server-side) are defined once.
 */
export const createAccessRequestInputSchema = z.object({
  requesterName: z.string().trim().min(1, "Le nom du demandeur est requis."),
  applicationId: z.string().min(1, "L'application est requise."),
  roleId: z.string().min(1, "Le rôle est requis."),
  reason: z
    .string()
    .trim()
    .min(MIN_REASON_LENGTH, `La justification doit faire au moins ${MIN_REASON_LENGTH} caractères.`),
});
export type CreateAccessRequestInput = z.infer<typeof createAccessRequestInputSchema>;

export const CREATE_FIELD_NAMES = ["requesterName", "applicationId", "roleId", "reason"] as const;
export type CreateFieldName = (typeof CREATE_FIELD_NAMES)[number];
export type CreateFieldErrors = Partial<Record<CreateFieldName, string>>;

export function isCreateFieldName(value: unknown): value is CreateFieldName {
  return typeof value === "string" && (CREATE_FIELD_NAMES as readonly string[]).includes(value);
}

export const reviewDecisionSchema = z.enum(["APPROVED", "REJECTED"]);
export type ReviewDecision = z.infer<typeof reviewDecisionSchema>;

export interface ReviewAccessRequestInput {
  id: string;
  decision: ReviewDecision;
  reviewComment?: string;
}
