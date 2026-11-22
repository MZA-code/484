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
| `npm run gif-audit`      | GIF à curer en priorité (signalés, œuvres françaises) + page     |
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

## Curer les GIF

### Comment le site choisit le GIF d'une team

La route `/api/gif/<rivalité>/<a|b>` suit cet ordre, sans exception :

1. **GIF choisis à la main** (`giphyIds`) : un au hasard. C'est la seule source vraiment fiable.
2. **Recherche Giphy** avec `giphyQuery` (`lang=fr`, `rating=g`, 25 résultats), **validée par mots-clés** : un résultat n'est retenu que si son titre, son slug ou le nom de son auteur contient au moins un des mots-clés de la team (sans accents, sans casse, en mots entiers).
3. **Rien** : la route renvoie `null` et la carte garde son cadre rayé avec le nom.

Un résultat de recherche qui ne passe pas la validation n'est jamais affiché. Mieux vaut un cadre rayé qu'un GIF hors sujet.

Les mots-clés se règlent avec le champ facultatif `giphyKeywords` :

```json
{
  "name": "Les Trois Frères",
  "origin": "Les Inconnus · 1995",
  "giphyIds": [],
  "giphyQuery": "Les Trois Freres",
  "giphyKeywords": ["les trois freres", "les inconnus"]
}
```

Sans `giphyKeywords`, les mots-clés sont le nom de la team sans son article (« Les Jedi » → « jedi ») et la requête `giphyQuery` entière. Avec `giphyKeywords`, seuls ces mots-clés comptent : utile pour un nom trop vague (« Taxi », « Camping »).

### Signalements « Mauvais GIF ? »

Sous chaque carte, un bouton discret « Mauvais GIF ? » envoie `POST /api/gif-report { teamId, gifId }`. Le serveur ajoute un signalement au compteur de ce GIF dans la base SQLite des votes (tables `gif_reports` et `report_limits`) : jamais d'IP, seulement l'empreinte quotidienne déjà utilisée pour les votes. Limite : 3 signalements d'affilée, puis 1 par minute, 30 par jour et par visiteur.

Pour lire les signalements du site en ligne depuis ton poste, choisis un jeton (une longue chaîne aléatoire) et mets-le **aux deux endroits** :

- sur le serveur : variable `GIF_REPORT_TOKEN` dans cPanel (application Node), puis redémarrer l'application ;
- en local : `GIF_REPORT_TOKEN=…` dans `.env`.

Sans jeton sur le serveur, la liste n'est pas consultable (404).

### L'audit : `npm run gif-audit`

```sh
npm run gif-audit -- --reports https://team484.fr   # signalements du site en ligne
npm run gif-audit                                   # signalements de la base locale (data/votes.sqlite)
npm run gif-audit -- --list                         # la liste seule, sans page ni appel à Giphy
npm run gif-audit -- --limit 40                     # plus de teams dans la page (défaut : 25)
npm run gif-audit -- --full                         # liste aussi les teams sans GIF jamais signalées
```

Le script affiche :

1. les teams **sans `giphyIds`**, les plus signalées d'abord ;
2. les teams dont l'**origine cite une œuvre française** (catégorie `cinefr`, ou un auteur, une série, une chaîne de la liste `FRENCH_MARKERS` de `scripts/lib/audit.ts`, à compléter au besoin) ;
3. les teams dont un **GIF choisi à la main a été signalé**.

Puis il ouvre une page locale (<http://localhost:4843>) avec **6 propositions Giphy par team**, dans cet ordre de priorité. Chaque proposition indique si elle passerait la validation par mots-clés (« ✓ mots-clés ») et si elle a déjà été signalée. Tu peux relancer une recherche, modifier les mots-clés, cocher un ou plusieurs GIF, puis **« Enregistrer dans rivalries.json »** : le fichier est validé, mis en forme et réécrit. Il reste à committer et à déployer.

Quota : chaque team de la page coûte une recherche Giphy (clé gratuite : environ 100 par heure). Avance par lots de 25.

`npm run curate` ouvre la même page, sans la priorisation : `--category bouffe` pour une catégorie, `--all` pour inclure les teams déjà curées.

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

## Crédits

- Icônes : [Font Awesome Free](https://fontawesome.com), licence CC BY 4.0.
- GIF : [GIPHY](https://giphy.com).
- Polices : Anton, Space Grotesk, Space Mono (licence SIL OFL), via Fontsource.
