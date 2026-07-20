import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, fetchData, fetchJson, getErrorMessage } from "./http";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function stubFetch(response: Response) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchJson", () => {
  it("renvoie le corps JSON quand la réponse est OK", async () => {
    stubFetch(jsonResponse({ data: [1, 2] }));
    await expect(fetchJson("/api/test")).resolves.toEqual({ data: [1, 2] });
  });

  it("lève une ApiError avec le message et les erreurs de champs du serveur (400)", async () => {
    stubFetch(
      jsonResponse(
        { message: "Validation échouée.", errors: { reason: "Trop court." } },
        400,
      ),
    );

    const error: unknown = await fetchJson("/api/test").catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.status).toBe(400);
    expect(apiError.message).toBe("Validation échouée.");
    expect(apiError.fieldErrors).toEqual({ reason: "Trop court." });
  });

  it("préserve le status et le message serveur d'un conflit 409", async () => {
    stubFetch(jsonResponse({ message: "Demande déjà traitée." }, 409));

    const error = (await fetchJson("/api/test").catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(409);
    expect(error.message).toBe("Demande déjà traitée.");
    expect(error.fieldErrors).toEqual({});
  });

  it("replie sur un message générique quand le corps d'erreur n'est pas du JSON", async () => {
    stubFetch(new Response("Internal Server Error", { status: 500 }));

    const error = (await fetchJson("/api/test").catch((e: unknown) => e)) as ApiError;

    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(500);
    expect(error.message).toBe("Une erreur inattendue est survenue.");
    expect(error.fieldErrors).toEqual({});
  });
});

describe("fetchData", () => {
  const itemSchema = z.object({ id: z.string() });

  it("désenveloppe { data } et renvoie le contenu validé", async () => {
    stubFetch(jsonResponse({ data: [{ id: "req-1" }] }));

    await expect(fetchData("/api/test", z.array(itemSchema))).resolves.toEqual([
      { id: "req-1" },
    ]);
  });

  it("rejette quand la réponse ne respecte pas le schéma attendu", async () => {
    stubFetch(jsonResponse({ data: [{ id: 123 }] }));

    await expect(fetchData("/api/test", z.array(itemSchema))).rejects.toThrow();
  });

  it("rejette quand l'enveloppe { data } est absente", async () => {
    stubFetch(jsonResponse({ items: [] }));

    await expect(fetchData("/api/test", z.array(itemSchema))).rejects.toThrow();
  });
});

describe("getErrorMessage", () => {
  it("renvoie le message d'une ApiError", () => {
    const error = new ApiError(500, "Erreur serveur.");
    expect(getErrorMessage(error, "Message générique.")).toBe("Erreur serveur.");
  });

  it("replie sur le message fourni pour toute autre erreur", () => {
    expect(getErrorMessage(new TypeError("failed to fetch"), "Message générique.")).toBe(
      "Message générique.",
    );
    expect(getErrorMessage(undefined, "Message générique.")).toBe("Message générique.");
  });
});
