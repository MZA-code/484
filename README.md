# 484 · Lequel tu préfères ?

Team Batman ou team Superman ? Chat ou chien ? Pain au chocolat ou chocolatine ? Des rivalités écrites à la main, tu choisis ton camp, et tu découvres si le reste du monde est d’accord.

> État : **pivot « Team X ou Team Y », phase 3** (votes mondiaux par rivalité, GIF par team, Hall of Fame des débats). Prototype local, pas encore déployé.

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
npm run play                          # ← → pour choisir, S pour passer, C pour changer de catégorie, Q pour quitter
npm run play -- --category bouffe     # catégorie de départ (mix, heros, bouffe, geek, jeux, ecrans, duos, quotidien)
npm run play -- --seed 42             # partie reproductible
npm run play -- --auto 30             # 30 votes automatiques, puis le résumé
```

Le mode console n'appelle pas l'API : ses pourcentages sont simulés, et signalés comme tels.

## Animations

Le site suit le réglage « réduire les animations » du système : avec ce réglage, les GIF s'affichent en image fixe et les animations sont coupées. L'interrupteur **« Animations : activées / réduites »** de l'en-tête permet de forcer l'un ou l'autre. Le choix est mémorisé dans le navigateur.

## Commandes

| Commande                 | Rôle                                                             |
| ------------------------ | ---------------------------------------------------------------- |
| `npm run dev`            | Serveur de développement                                         |
| `npm run build`          | Build de production dans `dist/`                                 |
| `npm start`              | Lance le build de production (serveur Node autonome)             |
| `npm run play`           | Mode console : jouer dans le terminal                            |
| `npm run curate`         | Outil de curation des GIF (page locale)                          |
| `npm run content:review` | Fiche de relecture des rivalités (`docs/relecture-rivalites.md`) |
| `npm run content:check`  | Vérifie les JSON de `content/` et affiche un résumé              |
| `npm run lint`           | ESLint                                                           |
| `npm run format`         | Formate tout le code avec Prettier                               |
| `npm run check`          | Vérification des types (TypeScript + Astro)                      |
| `npm test`               | Tests unitaires (Vitest)                                         |
| `npm run verify`         | Tout ce que fait la CI : lint, format, types, tests, build       |

## Ajouter une rivalité

1. Ouvrir `content/rivalries.json` et ajouter une entrée dans `rivalries` :

   ```json
   {
     "id": "bouffe-pain-au-chocolat-chocolatine",
     "category": "bouffe",
     "question": "Facultatif : une question sur mesure, sinon « Team A ou team B ? »",
     "a": {
       "name": "Pain au chocolat",
       "origin": "La moitié nord de la France",
       "line": "…",
       "giphyIds": [],
       "giphyQuery": "pain au chocolat"
     },
     "b": {
       "name": "Chocolatine",
       "origin": "Le Sud-Ouest, fièrement",
       "line": "…",
       "giphyIds": [],
       "giphyQuery": "chocolate croissant bakery"
     }
   }
   ```

2. Règles vérifiées automatiquement :
   - `id` unique, en minuscules et tirets, qui commence par la catégorie (`bouffe-…`) ;
   - `category` doit exister dans `categories` ;
   - deux teams de noms différents, et pas deux fois la même rivalité (dans un sens ou dans l'autre) ;
   - nom de 60 caractères maximum, origine libre de 80, réplique de 120 ;
   - au moins 3 rivalités par catégorie.

3. Lancer `npm run content:check`, puis `npm run content:review` pour relire le tout d'un coup d'œil.

## Organisation

```
content/            Tous les textes et les rivalités (JSON), modifiables sans toucher au code
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

La section « Déployer » sera écrite au moment du déploiement.
