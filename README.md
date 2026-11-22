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
npm run play                          # ← → pour choisir, ↓ aucun des deux, S pour passer, C pour changer de catégorie, Q pour quitter
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

1. **GIF choisis à la main** : les `giphyIds`, les liens Tenor `gifUrls` et les images du site `images`, un au hasard parmi tous. C'est la seule source vraiment fiable.
2. **Recherche Giphy** avec `giphyQuery` (`lang=fr`, `rating=g`, 25 résultats), **validée** sur le titre, le slug ou le nom de l'auteur du GIF (sans accents, sans casse, en mots entiers) :
   - d'abord **exacte** : il contient un mot-clé entier de la team (son nom, sa requête, ou ses `giphyKeywords`) ;
   - puis **mot à mot** (seulement sans `giphyKeywords`) : il contient un mot significatif de la requête, 4 lettres ou plus, hors mots vagues comme « film » ou « funny ». C'est ce qui donne un GIF aux teams « idées » (« Contrôler la météo » → `weather control` → « Weather Map Storm »).
3. **GIF d'ambiance de la catégorie** : ses `giphyIds` si tu en as choisi, sinon les premiers résultats de sa recherche générique (`giphyQuery` de la catégorie, par exemple `difficult choice` pour les dilemmes). Chaque team reçoit toujours le même parmi 5, pas toutes le même.
4. **Rien** : la route renvoie `null` et la carte garde son cadre rayé avec le nom (seulement si Giphy ne renvoie rien du tout).

Un résultat de recherche non validé n'est jamais présenté comme la team : au pire, la carte montre un GIF d'ambiance de sa catégorie.

Ce même GIF d'ambiance sert de vignette aux cartes des catégories sur l'accueil (`GET /api/category-gif/<catégorie>`, version réduite de Giphy, une quinzaine de Ko). Les vignettes ne se chargent qu'à l'approche de l'écran, en image fixe si les animations sont réduites ; tant qu'elles chargent, ou si Giphy ne répond pas, l'icône de la catégorie reste affichée. Pour changer la vignette d'une catégorie : modifier son `giphyQuery`, ou lui donner des `giphyIds` dans `content/rivalries.json`.

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

### Liens Tenor : quand Giphy n'a rien

Giphy connaît mal les œuvres françaises (Eddy Mitchell, la 7e compagnie…), que Tenor a souvent. L'API Tenor est fermée aux sites extérieurs depuis le 30 juin 2026 : pas de recherche automatique, mais on peut **coller un lien** choisi sur tenor.com (clic droit sur le GIF, « Copier l'adresse de l'image ») dans la page de curation, champ « Liens Tenor ou Giphy ». Il est rangé dans `gifUrls` :

```json
"gifUrls": ["https://media.tenor.com/4Pm3OjjE7BEAAAAC/eddy-mitchell-claude-moine.gif"]
```

- Seules les images `https://media.tenor.com/…` (et `media1.tenor.com/m/…`) sont acceptées ; le fichier refuse tout autre lien. Dans la page de curation, un lien non reconnu n'empêche pas d'enregistrer les autres : il est signalé et recopié dans `liens-refuses.txt` (ignoré par git).
- Le lien est rangé sous une forme unique (version `AAAAC`). Le site en sert la **vidéo MP4 légère** (`AAAPo`) et un **aperçu fixe** (`AAAAe`) pour les animations réduites, déduits du lien (`src/server/gif-links.ts`). Le GIF d'origine, parfois plusieurs Mo, n'est jamais chargé.
- Le GIF reste hébergé chez Tenor ; si Google change ses adresses, la carte garde son cadre rayé.
- Un lien Giphy collé dans le même champ est converti en identifiant et rangé dans `giphyIds`.
- Le pied de page affiche « GIF via Tenor » dès qu'un lien est utilisé, et la page Confidentialité mentionne Tenor.

### Images rangées sur le site : quand il n'y a aucun GIF

Pour une team qu'aucun service de GIF ne connaît (Tazos, Les Ripoux…), on colle dans le même champ de la page de curation le lien d'une image (clic droit, « Copier l'adresse de l'image ») ou le chemin d'un fichier du poste (« Copier en tant que chemin »). À l'enregistrement, `scripts/lib/team-images.ts` :

- télécharge ou lit l'image, vérifie que c'en est une (25 Mo au plus) ;
- la réduit à 480 px de large en WebP dans `public/images/teams/<team>-<empreinte>.webp` ;
- si elle est animée, garde aussi une version animée `….anim.webp` (1,5 Mo au plus, sinon elle reste fixe) ; la version fixe sert pour les animations réduites ;
- range le chemin dans `images` :

```json
"images": ["/images/teams/tazos-18035d40.webp"]
```

L'image est servie par le site lui-même : aucun service tiers, rien à changer dans la page Confidentialité. L'API renvoie `mp4: ""` et l'image dans `webp` ; la carte l'affiche alors en image. Un test vérifie que chaque image listée existe dans `public/`, avec sa version fixe. Les images sont recopiées sur le site : préférer celles qu'on a le droit d'utiliser.

### Signalements « Mauvais GIF ? »

Sous chaque carte, un bouton discret « Mauvais GIF ? » envoie `POST /api/gif-report { teamId, gifId }`. Le serveur ajoute un signalement au compteur de ce GIF dans la base SQLite des votes (tables `gif_reports` et `report_limits`) : jamais d'IP, seulement l'empreinte quotidienne déjà utilisée pour les votes. Limite : 3 signalements d'affilée, puis 1 par minute, 30 par jour et par visiteur. Un visiteur ne compte qu'**une fois par jour pour un même GIF**.

**Remplacement automatique.** La recherche garde en cache jusqu'à 5 GIF validés par team. Dès qu'un GIF trouvé par la recherche atteint **3 signalements** (`GIF_REJECT_THRESHOLD`, donc 3 visiteurs différents, ou 3 jours), le site passe au suivant de la liste, sans nouvel appel à Giphy. Si les 5 sont écartés, la carte garde le cadre rayé. Les GIF choisis à la main (`giphyIds`) ne sont jamais écartés automatiquement : ils apparaissent dans `npm run gif-audit`, et c'est toi qui décides. Le navigateur garde la réponse une heure : un remplacement se voit au plus tard une heure après.

Pour lire les signalements du site en ligne depuis ton poste, choisis un jeton (une longue chaîne aléatoire) et mets-le **aux deux endroits** :

- sur le serveur : variable `GIF_REPORT_TOKEN` dans cPanel (application Node), puis redémarrer l'application ;
- en local : `GIF_REPORT_TOKEN=…` dans `.env`.

Sans jeton sur le serveur, la liste n'est pas consultable (404).

### Mode admin : écarter un GIF d'un clic

Pour l'éditeur seulement. Sur chaque appareil (PC, téléphone), ouvrir une fois :

```
https://team484.fr/#admin=<GIF_REPORT_TOKEN>
```

Le navigateur garde le jeton (stockage local) et l'efface de la barre d'adresse ; comme il est après le `#`, il n'est jamais envoyé au serveur dans l'URL ni écrit dans ses journaux. Ensuite, « Mauvais GIF ? » envoie le jeton dans l'en-tête `x-484-admin` : pas de limite de débit, et le GIF est écarté tout de suite (il compte pour `GIF_REJECT_THRESHOLD` signalements). La carte affiche aussitôt le GIF suivant, et le bouton reste disponible pour l'écarter aussi. Pour couper le mode admin : `https://team484.fr/#admin=off`.

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

## Achievements

Sous le jeu, le panneau « Tes achievements » montre les objectifs débloqués, ceux à venir (barre de progression) et le prochain à viser ; un bandeau « Achievement débloqué » s'affiche au moment où l'un d'eux est atteint. Tout est calculé dans le navigateur, à partir de la partie gardée en stockage local : aucun compte, rien n'est envoyé.

La liste est dans `content/ui-texts.fr.json` (`achievements.list`) : identifiant, type, objectif, icône, nom, description, phrase du bandeau, et `link: true` pour y ajouter le lien LinkedIn. Types possibles (`src/engine/achievements.ts`) :

| Type         | Compte                                                   |
| ------------ | -------------------------------------------------------- |
| `debates`    | débats tranchés                                          |
| `rebels`     | choix rebelles (team choisie par moins de 40 % du monde) |
| `streak`     | meilleure série d'accords avec la majorité, d'affilée    |
| `categories` | catégories où au moins un débat a été tranché            |
| `universes`  | univers où au moins un débat a été tranché               |

## Protection contre les robots et le spam

Votes et signalements passent par les mêmes barrières, dans cet ordre :

1. **Filtre de requête** (`src/server/votes/guard.ts`) : en-tête `Origin` obligatoire et égal au site, corps JSON, et `User-Agent` d'un vrai navigateur (curl, Python, navigateurs pilotés et robots déclarés sont refusés).
2. **Adresse IP fiable** : derrière le proxy d'o2switch (`TRUST_PROXY=true`), on lit l'adresse ajoutée **à droite** de `X-Forwarded-For` par le proxy lui-même. Celles de gauche peuvent être inventées par le visiteur, et ne servent jamais. Diagnostic : `GET /api/health?ip` avec l'en-tête `Authorization: Bearer <GIF_REPORT_TOKEN>`.
3. **Limite de débit** par empreinte d'IP du jour : votes 5 d'affilée puis 1 par seconde, 600 par jour ; signalements 3 d'affilée puis 1 par minute, 30 par jour.
4. **Un vote par rivalité, et un signalement par GIF, par visiteur et par jour.** Les suivants reçoivent les chiffres, mais ne comptent pas.

Limite assumée : un réseau de robots qui imite un navigateur et change d'adresse IP peut encore voter. Contre cela, il faudrait un test anti-robot (type Cloudflare Turnstile), qui ajoute un service tiers.

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
