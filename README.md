# 484 · T’es team quoi ?

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

| Commande                 | Rôle                                                              |
| ------------------------ | ----------------------------------------------------------------- |
| `npm run dev`            | Serveur de développement                                          |
| `npm run dev:sans-giphy` | Idem, sans aucun appel à Giphy (GIF de remplacement, quota gardé) |
| `npm run build`          | Build de production dans `dist/`                                  |
| `npm start`              | Lance le build de production (serveur Node autonome)              |
| `npm run play`           | Mode console : jouer dans le terminal                             |
| `npm run gif-admin`      | Page d'admin des GIF, en local : voir, choisir, publier           |
| `npm run content:review` | Fiche de relecture des rivalités (`docs/relecture-rivalites.md`)  |
| `npm run content:check`  | Vérifie les JSON de `content/` et affiche un résumé               |
| `npm run lint`           | ESLint                                                            |
| `npm run format`         | Formate tout le code avec Prettier                                |
| `npm run check`          | Vérification des types (TypeScript + Astro)                       |
| `npm test`               | Tests unitaires (Vitest)                                          |
| `npm run verify`         | Tout ce que fait la CI : lint, format, types, tests, build        |

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

**Qui appelle Giphy ?** Le navigateur, directement : c'est la règle de GIPHY pour une application web (pas de serveur intermédiaire, aucune réponse ni adresse gardée en cache, adresses utilisées telles quelles). La route `/api/gif/<rivalité>/<a|b>` ne fait que préparer un « plan » : le GIF choisi à la main tiré au sort, ou la recherche avec ses mots-clés de validation et le GIF d'ambiance de la catégorie. Le navigateur l'exécute avec `src/lib/giphy.ts`. La clé Giphy du site part donc dans ce plan : une clé web est publique par nature. Après un « quota dépassé », le navigateur n'appelle plus Giphy jusqu'à la fin de la visite.

L'ordre est toujours le même, sans exception :

1. **GIF choisis à la main** : les `giphyIds`, les liens Tenor `gifUrls` et les images du site `images`, un au hasard parmi tous. C'est la seule source vraiment fiable.
2. **Recherche Giphy** avec `giphyQuery` (`lang=fr`, `rating=g`, 25 résultats), **validée** sur le titre, le slug ou le nom de l'auteur du GIF (sans accents, sans casse, en mots entiers) :
   - d'abord **exacte** : il contient un mot-clé entier de la team (son nom, sa requête, ou ses `giphyKeywords`) ;
   - puis **mot à mot** (seulement sans `giphyKeywords`) : il contient un mot significatif de la requête, 4 lettres ou plus, hors mots vagues comme « film » ou « funny ». C'est ce qui donne un GIF aux teams « idées » (« Contrôler la météo » → `weather control` → « Weather Map Storm »).
3. **GIF d'ambiance de la catégorie** : ses `giphyIds` si tu en as choisi, sinon les premiers résultats de sa recherche générique (`giphyQuery` de la catégorie, par exemple `difficult choice` pour les dilemmes). Chaque team reçoit toujours le même parmi 5, pas toutes le même.
4. **Rien** : la carte garde son cadre rayé avec le nom (seulement si Giphy ne renvoie rien du tout, ou refuse : quota dépassé).

Un résultat de recherche non validé n'est jamais présenté comme la team : au pire, la carte montre un GIF d'ambiance de sa catégorie.

Ce même GIF d'ambiance sert de vignette aux cartes des catégories sur l'accueil (`GET /api/category-gif/<catégorie>` donne quoi demander, le navigateur demande à Giphy la version réduite, une quinzaine de Ko). Les vignettes ne se chargent qu'à l'approche de l'écran, en image fixe si les animations sont réduites ; tant qu'elles chargent, ou si Giphy ne répond pas, l'icône de la catégorie reste affichée. Pour changer la vignette d'une catégorie : modifier son `giphyQuery`, ou lui donner des `giphyIds` dans `content/rivalries.json`.

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

Giphy connaît mal les œuvres françaises (Eddy Mitchell, la 7e compagnie…), que Tenor a souvent. L'API Tenor est fermée aux sites extérieurs depuis le 30 juin 2026 : pas de recherche automatique, mais on peut **coller un lien** choisi sur tenor.com (clic droit sur le GIF, « Copier l'adresse de l'image ») dans la page d'admin, champ « Coller des liens ». Il est rangé dans `gifUrls` :

```json
"gifUrls": ["https://media.tenor.com/4Pm3OjjE7BEAAAAC/eddy-mitchell-claude-moine.gif"]
```

- Seules les images `https://media.tenor.com/…` (et `media1.tenor.com/m/…`) sont acceptées ; le fichier refuse tout autre lien. Dans la page d'admin, un lien non reconnu n'empêche pas d'enregistrer les autres : il est signalé et recopié dans `liens-refuses.txt` (ignoré par git).
- Le lien est rangé sous une forme unique (version `AAAAC`). Le site en sert la **vidéo MP4 légère** (`AAAPo`) et un **aperçu fixe** (`AAAAe`) pour les animations réduites, déduits du lien (`src/server/gif-links.ts`). Le GIF d'origine, parfois plusieurs Mo, n'est jamais chargé.
- Le GIF reste hébergé chez Tenor ; si Google change ses adresses, la carte garde son cadre rayé.
- Un lien Giphy collé dans le même champ est converti en identifiant et rangé dans `giphyIds`.
- Le pied de page affiche « GIF via Tenor » dès qu'un lien est utilisé, et la page Confidentialité mentionne Tenor.

### Images rangées sur le site : quand il n'y a aucun GIF

Pour une team qu'aucun service de GIF ne connaît (Tazos, Les Ripoux…), on colle dans le même champ de la page d'admin le lien d'une image (clic droit, « Copier l'adresse de l'image ») ou le chemin d'un fichier du poste (« Copier en tant que chemin »). À l'enregistrement, `scripts/lib/team-images.ts` :

- télécharge ou lit l'image, vérifie que c'en est une (25 Mo au plus) ;
- la réduit à 480 px de large en WebP dans `public/images/teams/<team>-<empreinte>.webp` ;
- si elle est animée, garde aussi une version animée `….anim.webp` (1,5 Mo au plus, sinon elle reste fixe) ; la version fixe sert pour les animations réduites ;
- range le chemin dans `images` :

```json
"images": ["/images/teams/tazos-18035d40.webp"]
```

L'image est servie par le site lui-même : aucun service tiers, rien à changer dans la page Confidentialité. L'API renvoie `mp4: ""` et l'image dans `webp` ; la carte l'affiche alors en image. Un test vérifie que chaque image listée existe dans `public/`, avec sa version fixe. Les images sont recopiées sur le site : préférer celles qu'on a le droit d'utiliser.

### La page d'admin : `npm run gif-admin`

Pour l'éditeur seulement, sur son PC : la page n'est jamais mise en ligne et n'écoute que sur `127.0.0.1`.

```sh
npm run gif-admin                  # ouvre http://localhost:4850 dans le navigateur
npm run gif-admin -- --no-open     # sans ouvrir le navigateur
```

- **À gauche**, toutes les teams, avec une recherche et des filtres : « À faire » (aucun GIF choisi), « Signalées » (archive des anciens signalements, `data/signalements-en-ligne.json`), « Œuvres françaises » (catégorie `cinefr`, ou une origine citée dans `FRENCH_MARKERS` de `scripts/lib/french-works.ts`), « Avec GIF choisi », « Non publiées », « Toutes ».
- **À droite**, la team choisie : ses GIF choisis (✕ pour en retirer un), une recherche Giphy de 25 résultats (un clic, ou les touches 1 à 9, pour ajouter ou retirer ; « 25 de plus »), un champ pour coller des liens (Tenor, Giphy, image du web ou fichier du poste) et les réglages de la recherche automatique du site (`giphyQuery`, `giphyKeywords`). Chaque résultat indique si le site l'aurait accepté tout seul (« ✓ exact », « ≈ mot ») et s'il avait été signalé.
- **Chaque changement est enregistré aussitôt** dans `content/rivalries.json` (validé, mis en forme par Prettier).
- **Clavier** : ↓/↑ (ou J/K) team suivante ou précédente, `/` recherche dans la liste, `S` recherche Giphy, Échap pour sortir d'un champ.
- **« Publier »** (sur la branche `main` seulement) : commit de `content/rivalries.json` et des nouvelles images de `public/images/teams/`, et seulement eux, puis push. Il reste la mise à jour dans cPanel.

Quota : une recherche Giphy = un appel. Les GIF déjà choisis s'affichent sans appel à l'API (adresse du média déduite de l'identifiant), et une recherche déjà faite pendant la session ne coûte rien. La recherche se lance à l'ouverture d'une team, après une courte pause (case à décocher pour ne chercher que sur Entrée). La page utilise `GIPHY_API_KEY` du `.env` local : une clé de dev, à part de celle du serveur, pour ne pas puiser dans le quota du site en ligne. En haut de la page, un compteur montre les recherches de la dernière heure (gardées dans `data/gif-admin-quota.json`, il survit à un redémarrage). Quand Giphy refuse, un compte à rebours remplace le compteur : la page ne rappelle plus Giphy avant la fin, puis relance la recherche toute seule. « Réessayer maintenant » force un essai. Le délai est estimé : la plus ancienne recherche de l'heure si la page a rempli le quota, sinon 5 minutes, car `npm run dev` puise dans le même quota.

Il n'y a plus de bouton « Mauvais GIF ? » sur le site (supprimé dans la version 1.10.0, décision D44) : les GIF se choisissent ici.

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

Les votes passent par ces barrières, dans cet ordre :

1. **Filtre de requête** (`src/server/votes/guard.ts`) : en-tête `Origin` obligatoire et égal au site, corps JSON, et `User-Agent` d'un vrai navigateur (curl, Python, navigateurs pilotés et robots déclarés sont refusés).
2. **Adresse IP fiable** : derrière le proxy d'o2switch (`TRUST_PROXY=true`), on lit l'adresse ajoutée **à droite** de `X-Forwarded-For` par le proxy lui-même. Celles de gauche peuvent être inventées par le visiteur, et ne servent jamais. Diagnostic : `GET /api/health?ip` avec l'en-tête `Authorization: Bearer <GIF_REPORT_TOKEN>` (le jeton garde son nom d'origine, celui des anciens signalements de GIF).
3. **Limite de débit** par empreinte d'IP du jour : 5 votes d'affilée puis 1 par seconde, 600 par jour.
4. **Un vote par rivalité, par visiteur et par jour.** Les suivants reçoivent les chiffres, mais ne comptent pas.

Limite assumée : un réseau de robots qui imite un navigateur et change d'adresse IP peut encore voter. Contre cela, il faudrait un test anti-robot (type Cloudflare Turnstile), qui ajoute un service tiers.

## Organisation

```
content/            Tous les textes et les rivalités (JSON), modifiables sans toucher au code
docs/               Brief d'origine et décisions techniques (decisions.md)
scripts/            Outils en ligne de commande (mode console, vérification du contenu, admin des GIF)
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
