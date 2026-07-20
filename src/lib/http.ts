import { z } from "zod";

/**
 * HTTP boundary of the app: the only place that calls `fetch`.
 * Non-2xx responses become `ApiError` (status + field errors) so upper
 * layers can discriminate 400 / 409 / 500 without re-parsing anything.
 */

const apiErrorBodySchema = z.object({
  message: z.string(),
  errors: z.record(z.string(), z.string()).optional(),
});

const GENERIC_ERROR_MESSAGE = "Une erreur inattendue est survenue.";

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: Record<string, string>;

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Human-readable message for the UI: an `ApiError` carries a message
 * meant for the user (sent by the API), anything else (network failure,
 * bug…) falls back to the provided generic message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export async function fetchJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Missing or non-JSON body: keep `null`, the generic message takes over.
  }

  if (!response.ok) {
    const parsed = apiErrorBodySchema.safeParse(body);
    throw new ApiError(
      response.status,
      parsed.success ? parsed.data.message : GENERIC_ERROR_MESSAGE,
      parsed.success ? (parsed.data.errors ?? {}) : {},
    );
  }

  return body;
}

/**
 * Fetch + validation of the `{ data: T }` envelope shared by every API
 * response. Endpoints only declare their content schema; unwrapping is
 * centralized here, in the transport layer.
 */
export async function fetchData<T>(
  url: string,
  dataSchema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const raw = await fetchJson(url, init);
  return z.object({ data: dataSchema }).parse(raw).data;
}
