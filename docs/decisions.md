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
