import { z } from "zod";

export const applicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const roleSchema = z.object({
  id: z.string(),
  label: z.string(),
});

export type Application = z.infer<typeof applicationSchema>;
export type Role = z.infer<typeof roleSchema>;
