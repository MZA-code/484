# Brief — « Lequel tu préfères ? » (site perso 484)

> À donner à Claude Code avec les deux fichiers joints : `contenders.json` (160 prétendants) et `ui-texts.fr.json` (tous les textes de l'interface).

## 1. Ta mission

Tu construis mon site perso, un vrai projet versionné, testé et déployable, pas une maquette. Le site est un jeu : des **duels infinis entre icônes de la pop culture**. Le visiteur choisit son préféré entre deux, le gagnant reste, un nouveau challenger arrive, et ça ne s'arrête jamais. Mes projets sont accessibles par un simple lien en bas de page.

Le site doit faire rire, et il doit prouver par sa finition que je sais livrer un produit soigné.

Un prototype validé existe déjà. Ce brief le décrit entièrement : reproduis-en le fonctionnement et l'esprit, puis va plus loin là où ce brief le demande.

**Avant d'écrire du code :** lis tout le brief, puis propose-moi un plan découpé selon les phases de la section 10. Attends ma validation avant chaque phase.

## 2. Ce qui ne se négocie pas

- **Humour avant tout.** Un humour intelligent, absurde, pop culture et internet, jamais méchant ni vulgaire. Chaque micro-texte doit être soigné : boutons, erreurs, page 404, états vides.
- **Les textes sont séparés du code.** Tous les textes vivent dans `content/` (JSON), jamais en dur dans les composants, pour que je puisse les relire et les modifier sans toucher au code.
- **Typographie française partout dans l'interface :**
  - espace fine insécable (U+202F) avant `; : ! ?` ;
  - espaces insécables (U+00A0) à l'intérieur des guillemets « » ;
  - apostrophe courbe ’.

  Écris une fonction utilitaire testée qui applique ces règles aux textes au moment du build, pour ne pas dépendre de la saisie.
- **Conventions :** identifiants, noms de fichiers et messages de commit en anglais ; commentaires et documentation en français.
- **Je ne parle pas de moi sur la page d'accueil.** Pas de CV, pas de parcours, pas de « je suis développeur ». Seules exceptions : le palier des 25 duels et la page Projets (voir plus bas).
- **Aucune image protégée hébergée chez nous.** Les visuels des personnages viennent uniquement de Giphy, via son API (section 6). Aucun personnage n'est dessiné ni recréé, et aucun logo de studio n'apparaît dans l'identité du site.
- **Aucun cookie, aucun traceur, aucune mesure d'audience tierce.**
- **Performance et accessibilité :**
  - Lighthouse ≥ 95 sur les quatre axes, sur mobile ;
  - tout se joue au clavier ;
  - `prefers-reduced-motion` est respecté.

## 3. Écrans et parcours

### 3.1 Accueil `/`

- **En-tête :** un logo « 484 » (pavé jaune) suivi de « LEQUEL TU PRÉFÈRES ? », qui ramène à l'accueil. À droite, deux liens : GitHub et LinkedIn.
- **Titre géant sur trois lignes :** « Il aurait pu faire / un portfolio sérieux. / Il a préféré ça. ». La troisième ligne est en rose.
- **Chapeau :** voir `ui-texts.fr.json → home.intro`.
- **Cinq cartes de thème :** « Tout mélangé » d'abord, puis un thème par entrée de `contenders.json → themes`. Chaque carte affiche :
  - le nombre de prétendants (« 160 PRÉTENDANTS · ∞ DUELS ») ;
  - le nom du thème ;
  - sa phrase d'accroche ;
  - « Jouer → ».

  Un clic lance les duels sur `/jouer?theme=<id>`.
- **Petite phrase en bas :** `home.footnote`.

### 3.2 Duels `/jouer?theme=<id>`

**Le haut de page.**
- **Onglets de thème** (dont « Tout mélangé ») : on change de thème à tout moment, sans recharger la page.
- **« Duel n° X »** en grand, avec la phrase `duel.subtitle` à côté.

**Les deux cartes.** Côte à côte avec une pastille « VS » animée au milieu ; sur mobile, elles s'empilent. Chaque carte est un `<button>` entier qui contient :
- le GIF ;
- l'origine (« Star Wars · 1977 ») ; en mode « Tout mélangé », elle est précédée du nom du thème en capitales ;
- le nom en très grand ;
- la réplique ou description en italique.

Au clavier : ← choisit la carte de gauche, → celle de droite, Échap ramène à l'accueil.

**Le bouton « Je ne connais aucun des deux ».** Il remplace les deux cartes et remet la série à zéro.

**Le bandeau de résultat après chaque vote :**
- « Tu as choisi X · Y % des visiteurs aussi » ;
- une barre de proportion à la couleur du gagnant ;
- une remarque drôle tirée de `quips` (section 4).

**Le bandeau de palier.** Il s'affiche pendant un duel quand le compteur atteint un palier de `milestones`. Le palier 25 (et 484) affiche en plus un bouton LinkedIn.

**Le bandeau de retraite.** Il s'affiche quand un tenant du titre atteint 10 victoires d'affilée (`duel.retired`).

**Deux panneaux sous les duels :**
- « Ton top 5 » : prétendants classés par nombre de victoires pendant la visite ;
- « Records » : plus longue série, nombre de retraités invaincus, nombre de prétendants dans le thème.

### 3.3 Mes autres projets `/projets`

Une grille de cartes colorées construite à partir de `ui-texts.fr.json → projects`, avec un bouton « Retour aux duels ». On y accède uniquement par le lien du pied de page (« Voir mes autres projets → »), présent sur tous les écrans, et par le lien direct.

### 3.4 Hall of Fame `/hall-of-fame` (nouveau)

Le classement mondial des prétendants, établi d'après les votes de tous les visiteurs :
- un filtre par thème ;
- le top 20, le flop 5 (« Les mal-aimés ») et les duels les plus serrés.

Le ton reste drôle, par exemple un commentaire différent pour chaque place du podium.

### 3.5 Page 404

Elle est drôle et cohérente avec le jeu, par exemple : « Cette page a perdu son duel. » Elle propose un retour aux duels.

## 4. Règles du moteur (à coder dans un module pur, testé)

- **Réserve.** Chaque thème est une liste de prétendants ; « Tout mélangé » est l'union de tous. On tire dans une file mélangée (Fisher-Yates) sans remise. Quand la file est vide, on la remélange. Un prétendant ne peut jamais affronter lui-même.
- **Vote.** Le gagnant garde sa place (gauche ou droite) et un nouveau challenger remplace le perdant.
- **Série.** Si le gagnant était déjà le tenant du titre, `streak + 1` ; sinon `streak = 1` et il devient le tenant. Le tenant porte le badge « N VICTOIRES D'AFFILÉE · EN TÊTE » (au singulier pour 1).
- **Retraite.** À `streak = 10`, le tenant prend sa retraite invaincu, on tire deux nouveaux prétendants et la série repart de zéro. On incrémente le compteur de retraités et on mémorise la meilleure série (nom + longueur).
- **Changer de thème ou passer le duel** remet la série à zéro, mais garde le compteur de duels, le top 5 et les records.
- **Remarques après un vote.** Elles dépendent du pourcentage de visiteurs qui ont fait le même choix :
  - `high` si ≥ 60 % ;
  - `mid` si entre 40 et 59 % ;
  - `low` si < 40 %.

  On choisit dans la catégorie sans répéter la même remarque deux fois de suite.
- **Pourcentages.** Ils viennent des vrais votes (section 5).
  - S'il y a moins de 5 votes sur la paire, on affiche `duel.firstVote` à la place du pourcentage.
  - Si l'API ne répond pas, on n'affiche pas de pourcentage et on montre une remarque neutre. Le jeu ne doit jamais bloquer.
- **Persistance locale.** Compteur, victoires, records, thème courant et file de tirage sont gardés en `localStorage`, toujours dans un `try/catch`. Si le stockage est indisponible, le jeu tourne en mémoire sans erreur.

Écris des tests unitaires (Vitest) pour :
- le tirage ;
- la série ;
- la retraite ;
- le passage d'un duel ;
- le changement de thème ;
- les catégories de remarques ;
- la typographie française.

## 5. Votes mondiaux (backend léger)

Stack proposée : **Cloudflare Pages + Pages Functions + D1**. Tu peux en proposer une autre si tu la justifies, mais elle doit rester gratuite à faible trafic et sans serveur à maintenir.

- **`POST /api/vote`** reçoit `{ winnerId, loserId, theme }`.
  - On valide les identifiants contre la liste connue.
  - La paire est stockée triée : `pairs(a_id, b_id, a_wins, b_wins)`, plus `contenders(id, wins, losses)`.
  - La réponse donne les pourcentages de la paire et le total des votes.
- **`GET /api/hall-of-fame?theme=`** renvoie les classements, mis en cache 60 s.
- **Anti-abus simple**, sans cookie :
  - limite de débit par empreinte d'IP hachée et salée, non stockée en clair ;
  - au maximum 1 vote par seconde et 2 000 par jour.
- **Côté client :** le vote est envoyé en arrière-plan, de façon optimiste. L'interface n'attend jamais le réseau pour afficher le duel suivant.

## 6. GIF (Giphy)

- Chaque prétendant a :
  - `giphyIds` : une liste de GIF choisis à la main, vide au départ ;
  - `giphyQuery` : une recherche de secours.
- Un endpoint `GET /api/gif/:contenderId` :
  - renvoie un GIF de la liste choisie s'il y en a, sinon le premier résultat de la recherche Giphy avec `rating=g` ;
  - met le résultat en cache ;
  - garde la clé API côté serveur, jamais exposée au client.
- **Format.** On sert le rendu MP4/WebP léger de Giphy plutôt que le GIF brut. Le cadre est en 16:9, avec `object-fit: cover`.
- **Préchargement.** On précharge le GIF du prochain challenger pour que l'enchaînement soit instantané.
- **Attribution.** La mention « Powered by GIPHY » est obligatoire et discrète, dans le pied de page.
- **Repli.** Tant que le GIF charge, ou s'il échoue, on affiche le cadre rayé du prototype avec le nom du prétendant.
- **Outil de curation.** Écris un script (`scripts/curate-gifs`) qui, pour chaque prétendant sans `giphyIds`, propose 6 résultats dans une page HTML locale. Je coche mes préférés et le script réécrit `contenders.json`.

## 7. Contenu

- `contenders.json` contient déjà **160 prétendants** (4 thèmes × 40). Schéma : `id, theme, name, origin, line, giphyIds, giphyQuery`. Valide-le avec un schéma (Zod) au build.
- **Objectif : 100 prétendants par thème**, plus de nouveaux thèmes, par exemple :
  - Méchants ;
  - Génériques de dessins animés ;
  - Objets cultes ;
  - Mascottes de pub ;
  - Héros de jeux vidéo ;
  - Créatures et monstres.

  Tu peux proposer des ajouts en respectant le ton existant : une origine « Œuvre · année » et une ligne courte, drôle et factuellement juste. Les citations restent très courtes (quelques mots), jamais des paroles de chanson. Je relis tout avant intégration.
- Tous les textes de l'interface viennent de `ui-texts.fr.json`. Tu peux l'enrichir, par exemple avec de nouvelles remarques ou de nouveaux paliers, toujours dans le même ton.

## 8. Direction artistique (reprise du prototype)

**Couleurs.**
- Fond `#121212`, texte `#F5F1E8`, texte secondaire `#CFCAC0`.
- Couleurs des cartes : `#FFD23F` `#FF6FA8` `#43C6F0` `#66E08A` `#FF8A3D` `#B69CFF` `#F5F1E8` `#FF5A4E`. La couleur est attribuée de façon stable à chaque prétendant (hash de l'identifiant).

**Typographies.** Auto-hébergées, avec seulement les sous-ensembles utiles :
- Anton pour les titres, noms et chiffres, en capitales ;
- Space Grotesk pour le texte courant ;
- Space Mono pour les étiquettes, compteurs et liens.

**Cartes.**
- Texte noir sur la couleur.
- Ombre portée pleine décalée (`8px 8px 0 #F5F1E8`).
- Au survol, la carte remonte de 6 px avec une rotation de −1°.
- Focus visible avec un contour blanc de 4 px.

**Animations.**
- Pastille « VS » ronde qui oscille (±6°).
- Effet « pop » (scale + rotation) à l'apparition des badges, bandeaux et paliers.
- Transition rapide (moins de 300 ms) quand le perdant est remplacé : sortie du perdant, entrée du challenger.

**Contrainte.** Tout doit marcher sur un écran de 360 px de large. Les zones cliquables font au moins 44 px.

## 9. Technique

- **Front.** Astro pour les pages statiques (accueil, projets, 404) et un îlot Preact (ou Svelte, propose) pour le jeu, en TypeScript strict. Le moteur du jeu est un module sans dépendance au framework.
- **Qualité.**
  - Lint et format (ESLint + Prettier) ;
  - Vitest pour la logique ;
  - Playwright pour un parcours de bout en bout : accueil → thème → 12 duels → palier 10 → page Projets.
- **SEO et partage.**
  - Balises meta et Open Graph ;
  - une image OG générée (« Lequel tu préfères ? — 484 ») ;
  - `robots.txt` et sitemap.
- **Bonus de phase 6.** Un bouton « Partager mon top 5 » qui génère une image et utilise l'API Web Share, avec copie du texte en repli.
- **Déploiement.** GitHub → Cloudflare Pages, avec un environnement de prévisualisation par branche. Les secrets (clé Giphy, sel de hachage) passent par les variables d'environnement, jamais dans le dépôt.
- **Documentation.**
  - `README.md` en français : lancer le projet, ajouter un prétendant, curer les GIF, déployer ;
  - `docs/decisions.md` pour les choix techniques.

## 10. Phases (avec validation à chaque étape)

| Phase | Contenu | J'ai validé quand… |
|---|---|---|
| 0 | Mise en place du dépôt, de la stack, de la CI (lint + tests), d'un déploiement vide | l'URL de prévisualisation répond |
| 1 | Moteur de jeu + tests + chargement et validation des JSON | les tests passent et un mode console permet de jouer |
| 2 | Interface fidèle au prototype (accueil, duels, projets, 404), sans backend ni GIF | je joue sur mobile et sur ordinateur, au clavier compris |
| 3 | GIF Giphy + endpoint + préchargement + script de curation | les duels enchaînent sans attente visible |
| 4 | Votes mondiaux + Hall of Fame | les pourcentages réels s'affichent et le jeu survit à une API coupée |
| 5 | Contenu : 100 par thème + nouveaux thèmes (je relis) | les JSON sont validés |
| 6 | Finitions : partage, OG, Lighthouse ≥ 95, Playwright | tout est vert et le site est déployé en production |

À la fin de chaque phase, donne-moi :
- un résumé de ce qui est fait ;
- ce qui reste ;
- les décisions prises ;
- comment je teste.

## 11. À compléter par moi

- `[URL LINKEDIN]` ;
- le nom de domaine ;
- la clé API Giphy ;
- mes GIF préférés (via le script de curation).

## 12. Définition de « terminé »

Un inconnu arrive sur le site, rit dès l'accueil et enchaîne vingt duels sans s'en rendre compte. Les GIF arrivent sans attente, les pourcentages sont réels, et il finit par cliquer sur « Voir mes autres projets ». Le code est propre, testé, documenté et déployé automatiquement.
