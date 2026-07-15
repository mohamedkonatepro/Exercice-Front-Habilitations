import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

// Worker MSW pour le navigateur.
// Démarré depuis src/main.tsx avant le rendu de l'application.
export const worker = setupWorker(...handlers);
