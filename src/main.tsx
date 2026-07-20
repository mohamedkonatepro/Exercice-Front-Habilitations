import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { queryClient } from "./lib/queryClient";
import "./index.css";

/**
 * Starts the mock backend (MSW) BEFORE mounting the app so every network
 * request is intercepted. In production this block would not run: the mock
 * is always on here since there is no real backend.
 */
async function enableMocking() {
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

void enableMocking()
  .then(() => {
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error("Élément racine #root introuvable dans index.html.");
    }

    createRoot(rootElement).render(
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </StrictMode>
    );
  })
  .catch((error: unknown) => {
    // Without this, a failed MSW start leaves a silent blank page.
    console.error("Échec du démarrage de l'application :", error);
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.textContent =
        "Le démarrage de l'application a échoué. Ouvrez la console pour le détail.";
    }
  });
