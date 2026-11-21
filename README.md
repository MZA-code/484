# 484 · Lequel tu préfères ?

Des duels infinis entre icônes de la pop culture. Tu choisis, le gagnant reste, un nouveau challenger arrive.

> État : **phase 2** (interface jouable, sans votes mondiaux ni GIF). Prototype local, pas encore déployé.

## Prérequis

- Node.js 24 ou plus récent (voir `.nvmrc`)
- npm (livré avec Node)

## Lancer le projet

```sh
npm install
npm run dev        # http://localhost:4840
```

Vérifier que la partie serveur répond : <http://localhost:4840/api/health>.

## Jouer dans le terminal

```sh
npm run play                       # ← → pour choisir, S pour passer, T pour changer de thème, Q pour quitter
npm run play -- --theme robots     # thème de départ (mix, robots, duos, vehicules, ecrans)
npm run play -- --seed 42          # partie reproductible
npm run play -- --auto 30          # 30 votes automatiques, puis le résumé
```

Tant que l'API de votes n'existe pas (phase 4), les pourcentages du mode console sont simulés.

## Commandes

| Commande                | Rôle                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `npm run dev`           | Serveur de développement                                   |
| `npm run build`         | Build de production dans `dist/`                           |
| `npm start`             | Lance le build de production (serveur Node autonome)       |
| `npm run play`          | Mode console : jouer dans le terminal                      |
| `npm run content:check` | Vérifie les JSON de `content/` et affiche un résumé        |
| `npm run lint`          | ESLint                                                     |
| `npm run format`        | Formate tout le code avec Prettier                         |
| `npm run check`         | Vérification des types (TypeScript + Astro)                |
| `npm test`              | Tests unitaires (Vitest)                                   |
| `npm run verify`        | Tout ce que fait la CI : lint, format, types, tests, build |

## Ajouter un prétendant

1. Ouvrir `content/contenders.json` et ajouter une entrée dans `contenders` :

   ```json
   {
     "id": "robots-wall-e",
     "theme": "robots",
     "name": "WALL-E",
     "origin": "Pixar · 2008",
     "line": "Compacte les déchets, collectionne les briquets, tombe amoureux.",
     "giphyIds": [],
     "giphyQuery": "WALL-E"
   }
   ```

2. Règles vérifiées automatiquement :
   - `id` unique, en minuscules et tirets, qui commence par le thème (`robots-…`) ;
   - `theme` doit exister dans `themes` ;
   - `origin` au format « Œuvre · année » ;
   - `line` courte (120 caractères maximum).

3. Lancer `npm run content:check`. En cas d'erreur, le message indique l'entrée et le champ fautifs.

Pas besoin de soigner les espaces avant `; : ! ?`, dans les guillemets « » ni les apostrophes : la typographie française est appliquée automatiquement au build.

## Modifier les textes de l'interface

Tous les textes sont dans `content/ui-texts.fr.json`. Les marqueurs entre accolades (`{name}`, `{n}`, `{percent}`) sont remplacés par le jeu et doivent être conservés. Chaque catégorie de remarques (`quips`) doit en contenir au moins deux, pour ne jamais répéter la même deux fois de suite.

## Organisation

```
content/            Tous les textes et les prétendants (JSON), modifiables sans toucher au code
docs/               Brief d'origine et décisions techniques (decisions.md)
scripts/            Outils en ligne de commande (mode console, vérification du contenu)
src/engine/         Moteur du jeu : TypeScript pur, sans dépendance au framework, entièrement testé
src/data/           Schémas Zod et chargement des contenus (validation + typographie)
src/lib/            Utilitaires : typographie française, couleurs des cartes, textes à trous
src/pages/          Pages Astro et routes API (src/pages/api/)
.github/workflows/  CI : lint + types + tests + build à chaque push
```

## Secrets

Copier `.env.example` en `.env` et le remplir. Le fichier `.env` n'est jamais commité.

## À venir

Les sections « Curer les GIF » et « Déployer » seront écrites dans les phases correspondantes.
