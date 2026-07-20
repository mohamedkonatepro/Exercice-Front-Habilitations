import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccessRequestList } from "@/components/AccessRequestList";
import { AccessRequestDetailModal } from "@/components/AccessRequestDetailModal";
import { CreateAccessRequestModal } from "@/components/CreateAccessRequestModal";

type ActiveModal =
  | { kind: "create" }
  | { kind: "detail"; requestId: string }
  | null;

export default function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Portail des habilitations</h1>
            <p className="text-sm text-muted-foreground">
              Gestion des demandes d'accès au parc applicatif
            </p>
          </div>
        </div>
        <Button size="lg" onClick={() => setActiveModal({ kind: "create" })}>
          <PlusIcon data-icon="inline-start" />
          Nouvelle demande
        </Button>
      </header>

      <section aria-label="Demandes d'habilitation">
        <AccessRequestList
          onSelectRequest={(requestId) => setActiveModal({ kind: "detail", requestId })}
        />
      </section>

      {activeModal?.kind === "create" && <CreateAccessRequestModal onClose={closeModal} />}
      {activeModal?.kind === "detail" && (
        <AccessRequestDetailModal requestId={activeModal.requestId} onClose={closeModal} />
      )}
    </main>
  );
}
