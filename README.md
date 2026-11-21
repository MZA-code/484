# 484 · Lequel tu préfères ?

Team Batman ou team Superman ? Chat ou chien ? Pain au chocolat ou chocolatine ? Des rivalités écrites à la main, tu choisis ton camp, et tu découvres si le reste du monde est d’accord.

> État : **pivot « Team X ou Team Y », phase 1** (moteur, contenu et mode console des débats). L’interface web affiche encore l’ancien mode « duels » jusqu’à la phase 2 du pivot. Prototype local, pas encore déployé. Prototype local, pas encore déployé.

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

## Ajouter un prétendant (ancien mode « duels »)

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

## GIF (Giphy)

Chaque prétendant affiche un GIF servi par `/api/gif/<id>` :

- s'il a des GIF choisis (`giphyIds`), l'un d'eux au hasard ;
- sinon, le premier résultat de la recherche `giphyQuery` (`rating=g`).

La clé Giphy reste sur le serveur. Les réponses de Giphy sont gardées en cache dans `data/gif-cache.json` (ignoré par git) pour ménager le quota : la clé gratuite est limitée à environ 100 appels par heure. Sans clé, le site fonctionne quand même : les cartes gardent leur cadre rayé.

1. Créer une clé de type **API** sur <https://developers.giphy.com/>.
2. Copier `.env.example` en `.env` et renseigner `GIPHY_API_KEY=…`.
3. Relancer `npm run dev`.

## Curer les GIF

```sh
npm run curate                       # les 25 premiers prétendants sans GIF choisi
npm run curate -- --theme robots     # un seul thème
npm run curate -- --limit 50         # plus de prétendants (1 recherche = 1 appel Giphy)
npm run curate -- --all              # y compris ceux qui ont déjà des GIF choisis
```

Ouvrir <http://localhost:4843>. Pour chaque prétendant, 6 propositions s'affichent. On coche ses préférés : s'il y en a plusieurs, le site en tire un au hasard. Le champ de recherche permet de relancer avec d'autres mots. « Enregistrer » réécrit `content/contenders.json` après l'avoir validé. Un prétendant sans case cochée n'est pas modifié.

## Votes mondiaux et Hall of Fame

Chaque vote part en arrière-plan vers `POST /api/vote` : le jeu n'attend jamais la réponse. Les votes sont stockés dans une base SQLite (`data/votes.sqlite`, ignorée par git), avec le module `node:sqlite` intégré à Node : rien à installer.

- Le pourcentage s'affiche dès que l'API répond. Si elle ne répond pas en 1,5 s, une remarque neutre s'affiche à la place.
- Moins de 5 votes sur une paire : « Tu es le premier à trancher ce duel ».
- Anti-abus sans cookie : en moyenne 1 vote par seconde (petites rafales tolérées) et 2 000 par jour, par empreinte d'IP. Les IP ne sont jamais stockées en clair.
- `/hall-of-fame` : top 20, les mal-aimés, les duels les plus serrés, filtrables par thème. Mis en cache 60 s.

Variables (`.env`) : `VOTE_HASH_SALT` (obligatoire pour activer les votes), `VOTES_DB_FILE` (facultatif), `TRUST_PROXY=true` derrière un proxy pour lire l'IP réelle.

Pour repartir de zéro en local : arrêter le serveur et supprimer `data/votes.sqlite*`.

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

La section « Déployer » sera écrite au moment du déploiement.
