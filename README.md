# Exercice technique Front — Portail des habilitations

Bienvenue, et merci de prendre le temps de réaliser cet exercice.

Vous rejoignez une équipe qui développe un **portail de gestion des
habilitations** : une application permettant de gérer les droits d'accès des
collaborateurs sur l'ensemble d'un parc applicatif (CRM, SIRH, Finance, etc.).

Cet exercice reproduit une tranche fonctionnelle réaliste de ce portail. Il est
**uniquement Front** : un backend est déjà **mocké** et fourni, vous n'avez
rien à développer côté serveur.

---

## Durée

L'exercice est calibré pour être réalisé en **2 à 3 heures**.

Nous ne cherchons pas un travail « fini à 100 % ». Nous cherchons à évaluer la
façon dont vous concevez, structurez et priorisez. Il vaut mieux un périmètre
**cœur** soigné qu'un ensemble de fonctionnalités bâclées.

---

## Contexte fonctionnel

Un collaborateur peut **demander un accès** à une application avec un certain
**rôle** (Lecture, Contributeur, Administrateur). Chaque demande passe par un
cycle de vie :

- `PENDING` — en attente de validation
- `APPROVED` — validée par un approbateur
- `REJECTED` — refusée par un approbateur

L'application doit permettre de **consulter**, **créer** et **traiter** ces
demandes d'habilitation.

---

## Stack imposée

- **React 19** + **TypeScript**
- **Vite** (déjà configuré)
- **MSW** pour le mock backend (déjà configuré, voir plus bas)

### Gestion de l'état / data-fetching : à vous de choisir

C'est un point **volontairement laissé libre**. 

Vous pouvez utiliser les librairies que vous jugez necessaires.

> Vous devrez **justifier votre choix** dans la section « Notes » du README
> (voir le template en bas). Ce choix et son argumentation font partie de
> l'évaluation.

Vous êtes libre pour le reste (styling, routing, composants...). Aucune
librairie UI n'est imposée ni fournie : faites au plus simple et au plus propre.

---

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:5173. Le mock backend (MSW) est
lancé automatiquement au chargement de la page — **aucune commande
supplémentaire** n'est nécessaire.

> Si vous voyez un avertissement MSW dans la console au premier lancement,
> rechargez la page. Le service worker (`public/mockServiceWorker.js`) est déjà
> présent dans le dépôt.

Scripts disponibles :

| Commande          | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Serveur de développement           |
| `npm run build`   | Build de production + typecheck    |
| `npm run preview` | Prévisualisation du build          |
| `npm run lint`    | Lint ESLint                        |
| `npm run test`    | Tests (Vitest)                     |

---

## Le backend mocké

Tout est dans `src/mocks/`. **Vous n'avez pas besoin de le modifier** (mais vous
pouvez l'étendre si vous le souhaitez).

- `src/mocks/data.ts` — jeu de données initial (applications, rôles, demandes)
- `src/mocks/handlers.ts` — **le contrat d'API complet** (endpoints, formats,
  codes d'erreur). Lisez ce fichier : c'est votre documentation d'API.
- `src/mocks/browser.ts` — configuration du worker

> **Important — comment tester les endpoints.**
> MSW intercepte uniquement les requêtes `fetch` / `XHR` **émises par le code
> de l'application**. Ouvrir une URL d'API directement dans la barre d'adresse
> du navigateur (ex. `http://localhost:5173/api/access-requests`) **ne renvoie
> pas** les données mockées : le navigateur effectue une navigation que Vite
> résout avec `index.html` (vous verrez donc la page React).
>
> Pour tester rapidement le mock, ouvrez l'application puis, dans la console
> des DevTools :
>
> ```js
> fetch("/api/access-requests").then((r) => r.json()).then(console.log);
> ```
>
> Vous obtiendrez le `{ data: [...] }` attendu. Vos requêtes mockées sont aussi
> visibles dans l'onglet **Network** des DevTools.

### Résumé du contrat d'API

| Méthode | Endpoint                            | Description                            |
| ------- | ----------------------------------- | -------------------------------------- |
| GET     | `/api/applications`                 | Liste des applications                 |
| GET     | `/api/roles`                        | Liste des rôles                        |
| GET     | `/api/access-requests`              | Liste des demandes (filtre `status`, recherche `q`) |
| GET     | `/api/access-requests/:id`          | Détail d'une demande                   |
| POST    | `/api/access-requests`              | Créer une demande                      |
| PATCH   | `/api/access-requests/:id/review`   | Approuver / rejeter une demande        |

Toutes les réponses ont la forme `{ data: ... }` (ou `{ message, errors? }` en
cas d'erreur). Les détails (payloads, validations, codes 400/404/409/500) sont
documentés dans `src/mocks/handlers.ts`.

Points d'attention volontairement intégrés au mock :

- une **latence réseau** simulée (pensez aux états de chargement) ;
- une **validation serveur** sur la création (gérez les erreurs de formulaire) ;
- un **échec aléatoire (~15 %)** sur la création (gérez l'erreur et le retry) ;
- un conflit **409** si on traite une demande déjà traitée.

> Note : les données vivent en mémoire et sont réinitialisées à chaque
> rechargement de la page.

---

## Travail demandé

### Cœur (attendu) — à faire en priorité

1. **Lister les demandes d'habilitation**
   - Afficher les demandes avec au minimum : demandeur, application, rôle,
     statut, date de création.
   - Gérer les états de **chargement** et d'**erreur**.

2. **Créer une demande d'accès**
   - Formulaire avec : demandeur, application (parmi la liste), rôle (parmi la
     liste), justification.
   - **Validation** des champs (côté client) et prise en compte des **erreurs
     renvoyées par le serveur** (400).
   - Gérer le cas d'**échec** (500) proprement.
   - La liste doit refléter la nouvelle demande après création.

3. **Traiter une demande** (approuver / rejeter)
   - Permettre à un approbateur d'**approuver** ou **rejeter** une demande
     `PENDING`, avec un commentaire optionnel.
   - La liste / le détail doivent refléter le nouveau statut.

### Bonus (optionnels, pour aller plus loin)

Ne les abordez que si le cœur est solide. Aucun n'est obligatoire.

- **Filtres & recherche** : filtrer par statut, rechercher par nom de demandeur
  (les query params `status` et `q` sont supportés par l'API).
- **Vue détail** d'une demande (via `/api/access-requests/:id`).
- **Tests** : quelques tests unitaires ou d'intégration pertinents.
- **Accessibilité** (labels, navigation clavier, aria).
- **UX** : tri, pagination, feedback (toasts), optimistic updates, etc.
- **Qualité** : découpage en composants, hooks réutilisables, typage strict.

---

## Ce que nous évaluons

- **Qualité et lisibilité du code** (structure, nommage, composants, hooks).
- **Typage TypeScript** (pertinence, rigueur, pas de `any` de facilité).
- **Gestion de l'état & du data-fetching**, et **pertinence de votre choix**
  de librairie (le point clé laissé libre).
- **Gestion des états asynchrones** : chargement, erreurs, cas limites.
- **Ergonomie & robustesse** de l'interface.
- Vos **choix d'architecture** et votre capacité à **prioriser** dans le temps
  imparti.

Nous accordons plus d'importance à la **qualité et à la clarté** qu'à la
quantité de fonctionnalités.

---

## Rendu

1. **Forkez** ce dépôt.
2. Développez sur une branche (ou sur `main` de votre fork).
3. Complétez la section **« Notes du candidat »** ci-dessous.
4. Envoyez-nous le lien de votre fork.

---

## Notes du candidat

_Merci de remplir cette section (elle fait partie de l'évaluation)._

**Librairie de state / data-fetching choisie :**

> 

**Choix d'architecture notables :**

>

**Ce que vous auriez fait avec plus de temps :**

>

**Temps approximatif passé :**

>
