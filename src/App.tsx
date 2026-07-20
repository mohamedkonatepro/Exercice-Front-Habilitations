import { useState } from "react";
import { PlusIcon, UserRoundIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessRequestList } from "@/components/AccessRequestList";
import { AccessRequestDetailModal } from "@/components/AccessRequestDetailModal";
import { CreateAccessRequestModal } from "@/components/CreateAccessRequestModal";

type ActiveModal =
  | { kind: "create" }
  | { kind: "detail"; requestId: string }
  | null;

/**
 * Simulated profile: the exercise has no authentication, the role only
 * gates the review actions (an approver reviews, a requester consults).
 */
type UserRole = "APPROVER" | "REQUESTER";

export default function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [userRole, setUserRole] = useState<UserRole>("APPROVER");

  const closeModal = () => setActiveModal(null);
  const canReview = userRole === "APPROVER";

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portail des habilitations</h1>
          <p className="text-sm text-muted-foreground">
            Gestion des demandes d'accès au parc applicatif
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={userRole}
            onValueChange={(selected) =>
              setUserRole(selected === "REQUESTER" ? "REQUESTER" : "APPROVER")
            }
          >
            <SelectTrigger className="bg-card" aria-label="Profil utilisateur">
              <UserRoundIcon className="text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="APPROVER">Approbateur</SelectItem>
              <SelectItem value="REQUESTER">Demandeur</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" onClick={() => setActiveModal({ kind: "create" })}>
            <PlusIcon data-icon="inline-start" />
            Nouvelle demande
          </Button>
        </div>
      </header>

      <section aria-label="Demandes d'habilitation">
        <AccessRequestList
          canReview={canReview}
          onSelectRequest={(requestId) => setActiveModal({ kind: "detail", requestId })}
        />
      </section>

      {activeModal?.kind === "create" && <CreateAccessRequestModal onClose={closeModal} />}
      {activeModal?.kind === "detail" && (
        <AccessRequestDetailModal
          requestId={activeModal.requestId}
          canReview={canReview}
          onClose={closeModal}
        />
      )}
    </main>
  );
}
