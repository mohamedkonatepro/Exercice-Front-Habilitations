/**
 * Jeu de données initial du mock backend.
 *
 * Ces données servent de "base de données" en mémoire pour MSW.
 * Elles sont réinitialisées à chaque rechargement de la page.
 *
 * NOTE POUR LE CANDIDAT :
 * Vous n'êtes PAS obligé de modifier ce fichier.
 * Il décrit la forme des données renvoyées par l'API mockée.
 * Libre à vous de définir vos propres types côté application.
 */

// Applications du parc pour lesquelles on peut demander des accès
export const applications = [
  { id: "app-crm", name: "CRM Ventes", description: "Gestion de la relation client" },
  { id: "app-hr", name: "SIRH", description: "Système d'information RH" },
  { id: "app-fin", name: "Finance Cloud", description: "Comptabilité et facturation" },
  { id: "app-bi", name: "Data & BI", description: "Rapports et tableaux de bord" },
  { id: "app-infra", name: "Console Infra", description: "Administration des serveurs" },
];

// Rôles disponibles (le niveau de droit demandé sur une application)
export const roles = [
  { id: "reader", label: "Lecture" },
  { id: "contributor", label: "Contributeur" },
  { id: "admin", label: "Administrateur" },
];

// Statuts possibles d'une demande d'habilitation
// PENDING  -> en attente de validation
// APPROVED -> validée par un approbateur
// REJECTED -> refusée par un approbateur
export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AccessRequestSeed {
  id: string;
  requesterName: string;
  applicationId: string;
  roleId: string;
  reason: string;
  status: AccessRequestStatus;
  createdAt: string; // ISO date
  reviewedAt: string | null; // ISO date ou null
  reviewComment: string | null;
}

// Demandes d'habilitation initiales
export const accessRequests: AccessRequestSeed[] = [
  {
    id: "req-1001",
    requesterName: "Alice Martin",
    applicationId: "app-crm",
    roleId: "contributor",
    reason: "Nouvelle arrivée dans l'équipe commerciale.",
    status: "PENDING",
    createdAt: "2026-06-28T09:12:00.000Z",
    reviewedAt: null,
    reviewComment: null,
  },
  {
    id: "req-1002",
    requesterName: "Bruno Lefevre",
    applicationId: "app-fin",
    roleId: "reader",
    reason: "Consultation des factures fournisseurs.",
    status: "APPROVED",
    createdAt: "2026-06-25T14:03:00.000Z",
    reviewedAt: "2026-06-26T08:30:00.000Z",
    reviewComment: "Accès en lecture accordé.",
  },
  {
    id: "req-1003",
    requesterName: "Chloé Nguyen",
    applicationId: "app-infra",
    roleId: "admin",
    reason: "Astreinte production week-end.",
    status: "REJECTED",
    createdAt: "2026-06-20T17:45:00.000Z",
    reviewedAt: "2026-06-21T10:15:00.000Z",
    reviewComment: "Droits admin non justifiés, passer par l'équipe SRE.",
  },
  {
    id: "req-1004",
    requesterName: "David Ospina",
    applicationId: "app-bi",
    roleId: "reader",
    reason: "Suivi des KPI mensuels.",
    status: "PENDING",
    createdAt: "2026-06-30T11:20:00.000Z",
    reviewedAt: null,
    reviewComment: null,
  },
];
