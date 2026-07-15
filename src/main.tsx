import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

/**
 * Démarre le mock backend (MSW) AVANT de monter l'application,
 * afin que toutes les requêtes réseau soient interceptées.
 *
 * En production, ce bloc ne s'exécuterait pas : ici le mock est
 * activé en permanence puisqu'il n'existe aucun vrai backend.
 */
async function enableMocking() {
  const { worker } = await import("./mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
