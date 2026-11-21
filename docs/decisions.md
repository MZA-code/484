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
