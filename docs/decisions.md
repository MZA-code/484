# Décisions techniques

Chaque entrée : le contexte, la décision, et pourquoi.

## D1 — Hébergement : O2Switch plutôt que Cloudflare (phase 0)

**Contexte.** Le brief proposait Cloudflare Pages + Functions + D1. Pas de compte Cloudflare, mais un hébergement O2Switch existant. Pas encore de domaine. On commence par un prototype local, déployé seulement s'il convainc.

**Décision.** Astro avec l'adaptateur `@astrojs/node` en mode autonome :

- les pages (accueil, projets, 404…) sont pré-rendues en HTML statique ;
- seules les routes `/api/*` tournent côté serveur (`export const prerender = false`).

**Pourquoi.** O2Switch sait faire tourner une application Node (cPanel, « Setup Node.js App »). Un seul langage (TypeScript) du front à l'API, et le même code tourne en local et en production. Le stockage des votes (phase 4) sera derrière une interface, pour pouvoir passer de SQLite (local) à MySQL (O2Switch) si besoin. Toujours gratuit à faible trafic et sans serveur à administrer soi-même.

## D2 — Îlot de jeu : Preact (phase 0)

**Décision.** Preact pour l'îlot interactif du jeu, plutôt que Svelte.

**Pourquoi.** Environ 4 ko, syntaxe JSX standard, intégration Astro officielle. Le moteur du jeu reste un module TypeScript pur, indépendant du framework : changer d'îlot plus tard ne toucherait que l'affichage.

## D3 — Gestionnaire de paquets : npm (phase 0)

**Décision.** npm, avec `package-lock.json` commité.

**Pourquoi.** Node 26 ne livre plus Corepack, donc pnpm demanderait une installation séparée. npm est disponible partout, y compris sur O2Switch.

## D4 — Versions de l'outillage (phase 0)

- **TypeScript 6.0** et non 7 : `typescript-eslint` et `astro check` ne prennent pas encore en charge TypeScript 7.
- **`eslint-plugin-jsx-a11y-x`** à la place de `eslint-plugin-jsx-a11y`, qui n'est pas compatible avec ESLint 10. C'est le fork prévu par `eslint-plugin-astro`.
- `npm audit` signale 3 alertes modérées, uniquement dans l'outillage de lint (`minimatch`, déni de service sur des motifs de fichiers). Aucune ne concerne le code livré (`npm audit --omit=dev` : 0).
- Le script d'installation d'esbuild est autorisé explicitement (`allowScripts` dans `package.json`).

## D5 — Télémétrie

La télémétrie d'Astro est désactivée en CI (`ASTRO_TELEMETRY_DISABLED`), dans l'esprit « aucun traceur ». En local : `npx astro telemetry disable`.

## D6 — Typographie française appliquée au build (phase 1)

**Décision.** `frenchTypography()` (`src/lib/typography.ts`) est appliquée à toutes les chaînes des JSON au chargement, sauf aux clés techniques (`id`, `theme`, `url`, `giphyIds`, `giphyQuery`, `version`). Les composants ne voient jamais de texte brut.

**Règles en plus du brief.**

- Espace fine insécable avant `%` (« 75 % »), y compris après un marqueur (« {percent} % »), pour qu'un pourcentage ne soit jamais coupé en fin de ligne.
- Les URL contenues dans un texte et les heures (« 12:30 ») ne sont pas modifiées.
- La fonction est idempotente : la relancer sur un texte déjà corrigé ne change rien.

Les espaces spéciales sont écrites `String.fromCharCode(0x202f)` dans le code : un caractère invisible en dur ne se relit pas.

## D7 — Moteur : fonctions pures et hasard injectable (phase 1)

**Décision.** `src/engine/` expose des fonctions pures (`createGame`, `vote`, `skipDuel`, `changeTheme`, `nextQuip`…) qui prennent un état et renvoient le suivant, avec une liste d'événements (`voted`, `retired`, `milestone`) que l'interface affichera. Le hasard est passé en paramètre (`Rng`) : une graine fixe rend une partie reproductible, dans les tests comme dans le mode console.

**Précisions sur les règles.**

- **Compteur de duels.** Il compte les votes. Passer un duel ou changer de thème ne l'incrémente pas, et « Duel n° X » affiche `votes + 1`.
- **Revanche immédiate.** Après un vote, le perdant n'est pas retiré tout de suite s'il reste assez de prétendants. C'est une exclusion « souple » qui ne bloque jamais un thème de 2 ou 3 prétendants.
- **Retraite.** À 10 victoires, deux nouveaux prétendants sont tirés en évitant le retraité et son dernier adversaire.
- **Top 5.** À égalité de victoires, l'ordre est alphabétique par identifiant, donc stable.

## D8 — Pourcentages et remarques (phase 1)

- Le pourcentage affiché est arrondi, et la catégorie de remarque est calculée sur ce chiffre arrondi : 59,5 % s'affiche « 60 % » et donne une remarque `high`, pour que l'écran reste cohérent.
- Une 4ᵉ catégorie `neutral` sert quand il n'y a pas de pourcentage : API muette, ou moins de 5 votes (où `duel.firstVote` s'affiche à la place du chiffre). Ses textes sont dans `ui-texts.fr.json`.
- Textes ajoutés pour le moteur : `duel.choice`, `duel.share`, `duel.streakBadge` (singulier et pluriel), `quips.neutral`.

## D9 — État sauvegardé toujours assaini (phase 1)

L'état relu du `localStorage` est vérifié avec Zod, puis confronté au catalogue courant. Un prétendant supprimé du JSON, un thème disparu ou une série incohérente ne cassent pas la partie : le duel est retiré au sort, mais le compteur, les victoires et les records sont conservés. Une donnée illisible donne simplement une nouvelle partie.

## D10 — Interface (phase 2)

- **Îlot `client:only`.** La partie dépend du stockage local et de l'URL, qui n'existent pas au build. L'îlot n'est donc rendu que dans le navigateur. Un squelette de même taille s'affiche pendant le chargement pour éviter que la page saute, et un message `<noscript>` drôle prend le relais sans JavaScript.
- **Onglets de thème = boutons à bascule (`aria-pressed`), pas un `tablist` ARIA.** Un `tablist` utilise les flèches du clavier pour naviguer entre onglets, or ← et → servent à voter partout sur la page.
- **Bandeaux au-dessus des cartes, avec une hauteur réservée.** Le résultat du vote apparaît sans décaler les cartes, ce qui évite les clics ratés quand on enchaîne vite. Les paliers et les retraites, plus rares, agrandissent la zone. Cette zone est une région `aria-live` : chaque résultat est annoncé aux lecteurs d'écran.
- **Transition de vote : 120 ms de sortie + 160 ms d'entrée** (moins de 300 ms en tout). Les votes sont ignorés pendant ces 120 ms pour éviter les doubles clics. Avec `prefers-reduced-motion`, le remplacement est immédiat.
- **Cartes de duel.** L'accessibilité passe par `aria-label="Choisir X"` et `aria-describedby` (origine, réplique, badge), pour que le nom ne soit pas lu deux fois.
- **LinkedIn masqué tant que l'URL est vide** (`links.linkedin.url` dans `ui-texts.fr.json`). Cela vaut pour l'en-tête comme pour le bouton des paliers 25 et 484. Aucune fausse URL n'est publiée.
- **Polices** : sous-ensemble latin de Fontsource (accents, œ, ’ et espaces fines inclus). Les symboles → et ∞, absents de ce sous-ensemble, s'affichent avec la police système.
- **Playwright** est installé dès cette phase, pour les captures de contrôle (360 px et 1280 px). Le parcours de bout en bout complet reste prévu en phase 6.

## D11 — GIF Giphy (phase 3)

- **Le serveur appelle l'API Giphy, le navigateur n'y touche jamais.** `GET /api/gif/:id` renvoie seulement les URL des médias (rendu `fixed_height` : MP4 et WebP de 200 px de haut, plus l'image fixe). La clé passe par `astro:env` (secret côté serveur) et n'apparaît dans aucun message d'erreur.
- **Cache à deux niveaux.**
  - Serveur : en mémoire, plus un fichier JSON (`data/gif-cache.json`) qui survit aux redémarrages. Durées : 30 jours pour un GIF choisi, 7 jours pour une recherche, 1 jour pour une recherche vide.
  - Navigateur : `Cache-Control` d'un jour (une heure si plusieurs GIF sont choisis, pour garder un peu de variété).

  Deux demandes simultanées du même GIF ne déclenchent qu'un seul appel à Giphy. La clé gratuite est limitée à environ 100 appels par heure, d'où ces précautions.

- **Préchargement en mémoire.** Les médias de Giphy autorisent CORS. Le MP4 des deux prochains prétendants de la file est donc téléchargé à l'avance et gardé sous forme d'URL `blob:` (10 au maximum, jamais celles affichées). Mesure avec un Giphy simulé : le GIF du challenger s'affiche environ 30 ms après l'entrée de sa carte.
- **Repli.** Le cadre rayé avec le nom reste sous la vidéo. Il se voit pendant le chargement et en cas d'échec (pas de clé, Giphy en panne, quota atteint, média introuvable). Le jeu ne bloque jamais.
- **Mouvement réduit.** Avec `prefers-reduced-motion`, on affiche l'image fixe de Giphy au lieu de la vidéo.
- **Recherches de secours réécrites en anglais, avec l'œuvre** (« Data Star Trek The Next Generation », « Cylon Battlestar Galactica »…). Giphy indexe surtout en anglais, et les noms seuls étaient ambigus. Les noms affichés ne changent pas.
- **Attribution.** « Powered by GIPHY » dans le pied de page de toutes les pages, en discret.
- **Curation** (`npm run curate`) : petit serveur local (127.0.0.1 uniquement) avec une page de cases à cocher. Le fichier est validé par le schéma avant d'être réécrit, avec la mise en forme Prettier du projet.

## D12 — Votes mondiaux (phase 4)

- **SQLite via `node:sqlite`**, intégré à Node 24 et plus : aucun module natif à compiler, un simple fichier sur le serveur. Le stockage est derrière l'interface `VoteStore`, pour passer à MySQL si l'hébergement l'exige. Les migrations sont numérotées et suivies par `PRAGMA user_version`. Mode WAL pour lire pendant une écriture.
- **Schéma du brief** : `pairs(a_id, b_id, a_wins, b_wins)` avec la paire triée (`CHECK a_id < b_id`) et `contenders(id, wins, losses)`. Chaque vote met à jour les deux tables en une seule transaction. Le thème est validé mais pas stocké : les identifiants commencent par leur thème (`robots-…`), ce qui suffit pour filtrer le Hall of Fame.
- **Limite de débit : seau de jetons** (rafale de 5, un jeton regagné par seconde) plutôt qu'un intervalle strict d'une seconde. Un joueur rapide au clavier enchaîne parfois 2 ou 3 votes en une seconde : avec une règle stricte, il perdrait ses pourcentages. La moyenne reste à 1 vote par seconde, plafonnée à 2 000 par jour.
- **Empreinte d'IP** : `SHA-256(sel | jour | IP)`, tronquée à 32 caractères. Le jour entre dans l'empreinte, donc deux journées d'un même visiteur ne peuvent pas être reliées. Les empreintes des jours précédents sont effacées.
- **Un vote limité (429) renvoie quand même les chiffres de la paire** : c'est une lecture sans risque, et l'affichage reste cohérent.
- **Origine** : un vote envoyé depuis un autre site est refusé (403). La comparaison se fait avec l'hôte demandé (`Host` ou `X-Forwarded-Host`), pas avec l'URL interne, pour fonctionner derrière le proxy d'O2Switch.
- **Côté client** : le duel suivant s'affiche immédiatement, et le bandeau montre « Tu as choisi X » avec des points de suspension. Le pourcentage, la barre et la remarque arrivent avec la réponse : 30 à 40 ms en local. Au-delà de 1,5 s, ou si l'API est coupée, une remarque neutre s'affiche, mais la requête continue (`keepalive`). Une réponse qui arrive après un autre vote est ignorée.
- **Classement** : borne basse de l'intervalle de Wilson à 95 % pour le top (il faut au moins une victoire), borne haute pour les mal-aimés (au moins 5 votes), écart relatif pour les duels serrés (au moins 10 votes).
