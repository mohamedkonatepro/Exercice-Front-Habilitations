import { z } from "zod";
import { fetchData } from "@/lib/http";
import {
  applicationSchema,
  roleSchema,
  type Application,
  type Role,
} from "@/schemas/referentials";

export function listApplications(): Promise<Application[]> {
  return fetchData("/api/applications", z.array(applicationSchema));
}

export function listRoles(): Promise<Role[]> {
  return fetchData("/api/roles", z.array(roleSchema));
}
