/**
 * Point d'entrée de l'application.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  À VOUS DE JOUER                                                 │
 * │                                                                  │
 * │  Ce composant est volontairement minimal. C'est le point de      │
 * │  départ de l'exercice décrit dans le README.                     │
 * │                                                                  │
 * │  - Mettez en place la gestion de l'état / data-fetching de votre │
 * │    choix.                                                        │
 * │  - Consommez le backend mocké (voir src/mocks/handlers.ts pour   │
 * │    le contrat d'API).                                            │
 * │  - Organisez le code comme bon vous semble.                      │
 * └──────────────────────────────────────────────────────────────────┘
 */
export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <h1>Portail des habilitations</h1>
        <p>Gestion des demandes d'accès au parc applicatif</p>
      </header>

      <section className="app__placeholder">
        <p>
          Squelette de départ. Consultez le <code>README.md</code> pour les
          consignes de l'exercice, puis remplacez ce contenu.
        </p>
      </section>
    </main>
  );
}
