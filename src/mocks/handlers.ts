/**
 * Handlers MSW = définition du "backend" mocké.
 *
 * ========================================================================
 *  CONTRAT D'API (ce que le candidat peut consommer)
 * ========================================================================
 *
 *  GET    /api/applications
 *         -> 200 { data: Application[] }
 *
 *  GET    /api/roles
 *         -> 200 { data: Role[] }
 *
 *  GET    /api/access-requests
 *         Query params optionnels :
 *           - status : PENDING | APPROVED | REJECTED  (filtre)
 *           - q      : recherche plein texte sur le nom du demandeur
 *         -> 200 { data: AccessRequest[] }
 *
 *  GET    /api/access-requests/:id
 *         -> 200 { data: AccessRequest }
 *         -> 404 { message: string }
 *
 *  POST   /api/access-requests
 *         Body: { requesterName, applicationId, roleId, reason }
 *         -> 201 { data: AccessRequest }
 *         -> 400 { message: string, errors?: Record<string,string> }
 *
 *  PATCH  /api/access-requests/:id/review
 *         Body: { decision: "APPROVED" | "REJECTED", reviewComment?: string }
 *         -> 200 { data: AccessRequest }
 *         -> 404 { message: string }
 *         -> 409 { message: string }   (demande déjà traitée)
 *
 * ------------------------------------------------------------------------
 *  Notes :
 *   - Une latence artificielle est ajoutée pour simuler le réseau
 *     (utile pour gérer les états de chargement).
 *   - L'endpoint POST échoue volontairement de façon aléatoire (~15%)
 *     avec un statut 500, pour tester la gestion d'erreur.
 *   - Les données vivent en mémoire et sont réinitialisées au rechargement.
 * ========================================================================
 */
import { http, HttpResponse, delay } from "msw";
import {
  applications,
  roles,
  accessRequests as seed,
  type AccessRequestSeed,
} from "./data";

// "Base de données" en mémoire (copie du seed pour pouvoir muter sans effet de bord)
const db: AccessRequestSeed[] = seed.map((r) => ({ ...r }));

let idCounter = 2000;
const nextId = () => `req-${++idCounter}`;

const NETWORK_LATENCY_MS = 500;

// Taux d'échec simulé (500) sur la création, pour tester la gestion d'erreur.
const FAILURE_RATE = 0.15;

export const handlers = [
  // --- Référentiels ---
  http.get("/api/applications", async () => {
    await delay(NETWORK_LATENCY_MS);
    return HttpResponse.json({ data: applications });
  }),

  http.get("/api/roles", async () => {
    await delay(NETWORK_LATENCY_MS);
    return HttpResponse.json({ data: roles });
  }),

  // --- Liste des demandes (avec filtre + recherche) ---
  http.get("/api/access-requests", async ({ request }) => {
    await delay(NETWORK_LATENCY_MS);
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.toLowerCase().trim();

    let result = [...db];
    if (status) {
      result = result.filter((r) => r.status === status);
    }
    if (q) {
      result = result.filter((r) => r.requesterName.toLowerCase().includes(q));
    }
    // Tri : plus récentes en premier
    result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return HttpResponse.json({ data: result });
  }),

  // --- Détail d'une demande ---
  http.get("/api/access-requests/:id", async ({ params }) => {
    await delay(NETWORK_LATENCY_MS);
    const found = db.find((r) => r.id === params.id);
    if (!found) {
      return HttpResponse.json(
        { message: "Demande introuvable." },
        { status: 404 }
      );
    }
    return HttpResponse.json({ data: found });
  }),

  // --- Création d'une demande ---
  http.post("/api/access-requests", async ({ request }) => {
    await delay(NETWORK_LATENCY_MS);

    // Échec réseau aléatoire pour tester la robustesse côté client.
    // NB : Math.random() est ici volontaire — il ne sert PAS à un usage
    // de sécurité (pas de token/clé), seulement à simuler l'instabilité
    // réseau d'un backend mocké. Un CSPRNG serait inutile.
    if (Math.random() < FAILURE_RATE) {
      // NOSONAR typescript:S2245 - PRNG non cryptographique acceptable (mock only)
      return HttpResponse.json(
        { message: "Erreur serveur, veuillez réessayer." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Partial<{
      requesterName: string;
      applicationId: string;
      roleId: string;
      reason: string;
    }>;

    // Validation côté serveur
    const errors: Record<string, string> = {};
    if (!body.requesterName?.trim())
      errors.requesterName = "Le nom du demandeur est requis.";
    if (!body.applicationId)
      errors.applicationId = "L'application est requise.";
    else if (!applications.some((a) => a.id === body.applicationId))
      errors.applicationId = "Application inconnue.";
    if (!body.roleId) errors.roleId = "Le rôle est requis.";
    else if (!roles.some((r) => r.id === body.roleId))
      errors.roleId = "Rôle inconnu.";
    if (!body.reason?.trim() || body.reason.trim().length < 10)
      errors.reason = "La justification doit faire au moins 10 caractères.";

    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { message: "Données invalides.", errors },
        { status: 400 }
      );
    }

    const created: AccessRequestSeed = {
      id: nextId(),
      requesterName: body.requesterName!.trim(),
      applicationId: body.applicationId!,
      roleId: body.roleId!,
      reason: body.reason!.trim(),
      status: "PENDING",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewComment: null,
    };
    db.push(created);

    return HttpResponse.json({ data: created }, { status: 201 });
  }),

  // --- Validation / rejet d'une demande ---
  http.patch("/api/access-requests/:id/review", async ({ params, request }) => {
    await delay(NETWORK_LATENCY_MS);
    const body = (await request.json()) as Partial<{
      decision: "APPROVED" | "REJECTED";
      reviewComment: string;
    }>;

    const found = db.find((r) => r.id === params.id);
    if (!found) {
      return HttpResponse.json(
        { message: "Demande introuvable." },
        { status: 404 }
      );
    }
    if (found.status !== "PENDING") {
      return HttpResponse.json(
        { message: "Cette demande a déjà été traitée." },
        { status: 409 }
      );
    }
    if (body.decision !== "APPROVED" && body.decision !== "REJECTED") {
      return HttpResponse.json(
        { message: "Décision invalide." },
        { status: 400 }
      );
    }

    found.status = body.decision;
    found.reviewedAt = new Date().toISOString();
    found.reviewComment = body.reviewComment?.trim() || null;

    return HttpResponse.json({ data: found });
  }),
];
