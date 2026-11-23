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

## D13 — Pivot « Team X ou Team Y ? » (pivot, phase 1)

**Contexte.** Après la phase 4, décision du propriétaire : le site ne propose plus de duels aléatoires « le gagnant reste », mais des **rivalités écrites à la main** (« Tu es plutôt team Batman ou team Superman ? »), dans l'esprit du running gag « Team Edward ou Team Jacob ». Le design doit coller au prototype validé.

**Décisions.**

- **Nouveau fichier `content/rivalries.json`.** Il contient des catégories, et des rivalités qui portent chacune leurs deux teams (nom, origine libre, réplique, GIF), avec une question sur mesure facultative. Les deux teams sont décrites dans la rivalité elle-même, sans fichier de prétendants partagé : une rivalité se relit et se corrige d'un seul bloc.
- **Origine libre** (80 caractères au maximum) : « Œuvre · année » quand ça s'applique, mais une chocolatine n'a pas d'année de sortie.
- **Validation** :
  - identifiants uniques, préfixés par la catégorie ;
  - deux teams de noms différents ;
  - pas de rivalité en double, dans un sens ou dans l'autre ;
  - au moins 3 rivalités par catégorie.
- **Nouveau moteur pur `src/engine/debate.ts`** :
  - tirage sans remise dans une file mélangée, jamais deux fois la même rivalité d'affilée ;
  - un vote compte un débat ; passer ou changer de catégorie ne compte pas, et garde tout ;
  - les pourcentages qui arrivent nourrissent le profil : d'accord avec la majorité si plus de 50 %, choix rebelle sous 40 % (le même seuil que les remarques « low »).

  L'ancien moteur (`game.ts`) reste en place tant que l'interface l'utilise. Il sera supprimé avec les 160 prétendants en phase 2 du pivot.

- **Contenu de départ : 99 rivalités en 7 catégories**, dont beaucoup recyclées depuis les anciens prétendants (Tom ou Jerry, R2-D2 ou C-3PO, DeLorean ou TARDIS…).
- **Paliers** : « 25 duels » devient « 25 débats ».

## D14 — Interface des débats (pivot, phase 2)

- **Design calé sur le prototype validé** :
  - logo « 484 LEQUEL TU PRÉFÈRES ? » en Anton, liens en jaune ;
  - onglets carrés à bordure crème ;
  - cartes à ombre crème de 8 px, avec une étiquette « TEAM » en haut ;
  - pastille VS crème qui oscille ;
  - résultat sur fond #1E1E1E, remarque en Anton capitales ;
  - palier sur fond rose, panneaux titrés en Space Mono jaune ;
  - gros bouton jaune « Retour aux débats → ».
- **Le résultat se colle en bas de l'écran** (`position: sticky`). Dans le prototype, il est sous les cartes : sur un écran de 1280×860 comme sur un téléphone, il était hors de vue, alors que c'est le cœur du jeu. Collé en bas, il reste visible sans défiler, ne décale jamais les cartes, et reprend sa place quand on descend. Le palier, plus rare et plus grand, reste dans le flux, sous les cartes.
- **Sur mobile, les onglets de catégorie défilent sur une seule ligne.** Sur plusieurs lignes, les 8 catégories poussaient la première team sous l'écran.
- **Pas de décalage d'état pendant l'animation.** L'état du moteur change immédiatement, et seule la rivalité _affichée_ attend la fin de la sortie (120 ms). Un pourcentage qui arrive pendant l'animation ne peut donc pas être écrasé.
- **Les deux teams d'une rivalité ont toujours des couleurs différentes** (`teamColors`).
- **« Tes teams »** liste les 5 derniers choix, avec le pourcentage quand il est connu. **« Ton profil »** affiche les débats tranchés, l'accord avec la majorité et les choix rebelles. Le top 5 et les records de l'ancien mode disparaissent.
- **L'ancien moteur de duels et son îlot sont supprimés.** Le stockage local est regroupé dans `engine/storage.ts`, et l'ancienne sauvegarde (`484:game`) est effacée au passage. `contenders.json` reste en place jusqu'à la phase 3, car l'API de votes, l'API GIF et le Hall of Fame s'en servent encore.

## D15 — Votes, GIF et Hall of Fame des débats (pivot, phase 3)

- **Un compteur par rivalité** : `rivalry_votes(rivalry_id, a_votes, b_votes)`. La migration n° 2 supprime les tables de l'ancien mode (`contenders`, `pairs`) et garde `rate_limits`. Il n'y avait que des votes de test en local, donc rien à reprendre. La limite de débit, les empreintes d'IP et la vérification d'origine sont inchangées.
- **`POST /api/vote { rivalryId, team, category }`.** La rivalité doit exister, `team` vaut `a` ou `b`, et la catégorie est `mix` ou celle de la rivalité. La réponse donne la part de la team choisie : le bandeau affiche « Tu es team X · Y % des visiteurs aussi », puis une **barre à deux camps** avec les deux pourcentages et les deux noms.
- **Un GIF par team** : `GET /api/gif/:rivalryId/:team`, avec le même service Giphy et le même cache qu'avant. Les GIF de la rivalité en cours et de la suivante sont préchargés.
- **Hall of Fame des débats** :
  - **les plus votés**, avec un podium et un commentaire par place ;
  - **les plus serrés**, triés par écart relatif le plus faible ;
  - **les plus écrasants**, par écart le plus fort, sans reprendre les plus serrés.

  Il faut au moins 10 votes pour juger un débat serré ou écrasant. Le tout est filtrable par catégorie et mis en cache 60 s.

- **Les 160 anciens prétendants (`contenders.json`) sont supprimés**, avec leur schéma et leurs tests. L'outil de curation travaille désormais par team (« rivalité/a ») et réécrit `rivalries.json`.
- **Bandeau de résultat plus compact** : sur ordinateur, sa taille d'origine cachait le nom et la réplique des cartes suivantes.

## D16 — Animations et interrupteur « Animations » (pivot, après la phase 3)

**Constat.** Sur une machine où Windows a désactivé les « effets d'animation », le navigateur signale `prefers-reduced-motion: reduce`. Le site coupait alors toutes les animations et affichait les GIF en image fixe : il paraissait figé.

**Décisions.**

- **Un interrupteur « Animations : activées / réduites » dans l'en-tête.**
  - Par défaut, il suit le réglage du système, comme le demande le brief.
  - Un clic force les animations, ou les coupe. Le choix est gardé dans le stockage local, et posé sur `<html data-motion>` par un petit script en ligne exécuté avant l'affichage (pas de clignotement).
  - Le CSS et les îlots lisent la préférence via `src/lib/motion.ts` (`prefersReducedMotion`, `useReducedMotion`, événement `484:motionchange`).
- **Animations ajoutées** (toutes coupées quand les animations sont réduites) :
  - **Navigation** : fondu entre les pages, avec les View Transitions entre documents (`@view-transition`, aucun JavaScript).
  - **Accueil** : les trois lignes du titre arrivent l'une après l'autre (la rose avec un rebond), puis le chapeau, puis les cartes de catégorie en cascade.
  - **Débat, à chaque nouvelle rivalité** : la team A entre par la gauche, la team B par la droite, la pastille VS rebondit, la question glisse et le numéro bascule.
  - **Débat, au vote** :
    - la team choisie grossit avec un tampon ✓, et l'autre tombe ;
    - le bandeau de résultat monte depuis le bas ;
    - le pourcentage défile de 0 à sa valeur (les lecteurs d'écran n'entendent que la valeur finale) ;
    - le nouveau choix entre dans « Tes teams ».
  - **Débat, au survol d'une carte** : le GIF zoome et l'étiquette « TEAM » penche.
  - **Paliers** : le bandeau se secoue et lâche une gerbe de confettis aux couleurs du site.
  - **Hall of Fame** : le podium tombe en cascade, et les barres se remplissent.
- **Durées.** La transition de vote dure 130 ms en sortie et 170 ms en entrée : moins de 300 ms en tout, comme le demande le brief.
- **Remplissage `backwards`** pour les entrées, et non `both`. Une animation qui garde son état final bloquait les effets de survol (`transform`) des cartes.
- **Le palier passe dans le bandeau collé en bas de l'écran.** Sous les cartes, il était hors de vue, alors qu'il porte le message aux recruteurs au palier 25.

## D17 — Univers : les catégories regroupées (phase 5)

**Contexte.** Avec une vingtaine de catégories prévues, les onglets et les cartes de l'accueil devenaient illisibles.

**Décisions.**

- **`universes` dans `content/rivalries.json`.** Chaque univers a un identifiant (préfixé `univers-`), un libellé, une accroche et sa liste de catégories. La validation exige que chaque catégorie appartienne à exactement un univers, et qu'un univers ne porte pas l'identifiant d'une catégorie.
- **Un univers se joue comme une catégorie** (`?theme=univers-ecrans`) : sa file contient toutes les rivalités de ses catégories. L'API de votes accepte un univers comme contexte, et le Hall of Fame se filtre par univers.
- **Page de débat : deux rangées d'onglets.**
  - La première : « Tout mélangé » et les univers.
  - La seconde, plus discrète : « Tout l'univers » et les catégories de l'univers en cours.
  - En mode mélangé, ou sur un univers, le nom de la catégorie s'affiche au-dessus de la question.
- **Accueil** : une grande carte « Tout mélangé », puis une section par univers (titre, accroche, lien « Tout l'univers → N rivalités »), avec ses cartes de catégorie.
- **Hall of Fame** : filtré par « Tout mélangé » et par univers. Il n'y a plus de filtre par catégorie, qui aurait fait 20 boutons.

## D18 — Quota Giphy : disjoncteur, et clé de production avant la mise en ligne (phase 5)

**Constat.** La clé « beta » de Giphy est limitée à 100 appels par heure. Les parties, les 200 nouvelles teams du lot 1 (sans GIF en cache) et mes tests de bout en bout, qui utilisaient la vraie clé, l'ont épuisée.

**Décisions.**

- **Disjoncteur dans le service Giphy.** Après une réponse 429, le serveur n'appelle plus Giphy pendant 15 minutes (`QUOTA_PAUSE_MS`), et les cartes gardent le cadre rayé. Les échecs ne sont toujours pas mis en cache : les GIF reviennent d'eux-mêmes ensuite.
- **Les tests de bout en bout simulent Giphy** et n'utilisent plus la vraie clé.
- **Clé de production à demander en phase 6**, une fois le site en ligne sur team484.fr. Elle est gratuite et sans limite horaire, et Giphy l'accorde sur une application en ligne qui affiche l'attribution « Powered by GIPHY ».

## D19 — Une adresse par débat, pour le partage (phase 5)

- **`/debat/<id>` : une page statique par rivalité** (749 pages, environ 11 Ko chacune). Chaque page a son titre (« Team Edward ou team Jacob ? »), sa description et ses balises Open Graph. L'adresse du site est déclarée dans la configuration (`site: 'https://team484.fr'`), et l'adresse canonique n'a ni paramètres ni barre oblique finale.
- **Les rivalités sont servies dans un seul fichier, `/data/debate.json`**, généré au build et versionné dans l'adresse pour renouveler le cache. Si chaque page avait embarqué toutes les rivalités, le site aurait pesé environ 150 Mo. L'îlot affiche un squelette le temps du chargement, et un message si le fichier ne vient pas.
- **L'adresse suit le jeu** : `/debat/<rivalité affichée>?theme=<catégorie>`, mise à jour avec `history.replaceState` (le bouton « retour » quitte le jeu au lieu de remonter 50 débats). Copier l'adresse, c'est partager le débat en cours ; recharger la page le réaffiche. Le titre de l'onglet suit aussi la question.
- **Le moteur sait ouvrir une rivalité précise** (`focusRivalry`). Il change de catégorie si besoin, et la rivalité qui était affichée retourne dans la file.
- **Bouton « Partager ce débat »** : partage natif quand le téléphone le propose (API Web Share), sinon copie du lien, confirmée par un message.

## D20 — Icônes des catégories (phase 5)

- **Font Awesome Free 7** (`@fortawesome/free-solid-svg-icons`) : icônes sous licence CC BY 4.0, code sous licence MIT. L'attribution figure dans `src/lib/icons.ts` et dans le README.
- **SVG en ligne, générés au build** (`src/components/Icon.astro`) : pas de police d'icônes ni de script, aucune requête en plus, et seules les icônes listées dans `src/lib/icons.ts` sont embarquées.
- **L'icône est une donnée du contenu** (champ `icon` des catégories, des univers et de « Tout mélangé »), validée contre la liste disponible : une icône inconnue fait échouer le build, avec la liste des noms possibles.
- **Sur l'accueil** : icône en filigrane dans le coin de chaque carte (elle gigote au survol), et en jaune devant chaque titre d'univers.
- Le paquet est une **dépendance de production**, car le serveur valide le contenu au démarrage.

## D21 — Conformité : mentions légales, RGPD, cookies, RGAA (phase 6)

- **Éditeur anonyme** : site non professionnel, l'éditeur garde l'anonymat permis par la LCEN ; ses coordonnées sont connues de l'hébergeur. Contact public : `contact@team484.fr` (`ui.site.email`).
- **Hébergeur** : o2switch, coordonnées vérifiées le 21/11/2026 (siège transféré chemin des Pardiaux en 2022 ; l'ancienne adresse du boulevard Gustave Flaubert est périmée).
- **Pas de bandeau cookies** : aucun cookie, aucune mesure d'audience. Le stockage local (progression, préférence d'animations) sert des fonctions demandées par l'utilisateur : exempté de consentement (art. 82 loi Informatique et Libertés).
- **GIPHY** : seul tiers. Le serveur fait les recherches ; le navigateur télécharge les vidéos depuis le CDN de GIPHY, qui ne pose aucun cookie (vérifié le 21/11/2026 ; seul giphy.com en pose, et il n'est jamais chargé).
- **RGAA** : déclaration « partiellement conforme » (auto-évaluation) : axe-core sans erreur sur les pages types, clavier, contrastes, zoom 200 %, animations réduites. Tests lecteurs d'écran à faire.
- Les cartes de team tirent leur nom accessible de leur texte visible (WCAG 2.5.3) ; le nom suit l'étiquette « TEAM » dans le code et le CSS (`order`) rétablit l'ordre visuel.
- Pages d'information construites depuis `ui.pages` (`src/layouts/InfoPage.astro`), avec une syntaxe minimale `[libellé](adresse)` et des variables (`{email}`, `{rivalries}`…) validées par le schéma.

## D22 — SEO et GEO (phase 6)

- **Contenu lisible sans JavaScript** : sur `/debat/<id>`, le contenu d'attente de l'îlot est la version statique du débat (catégorie, question en `h1`, deux teams avec origine et réplique). Moteurs et robots IA, qui souvent n'exécutent pas JavaScript, lisent le débat complet.
- **Maillage interne** : accueil → `/debats` → `/categorie/<id>` (les 50 débats) → `/debat/<id>` (fil d'Ariane, 8 débats voisins, lien vers la catégorie). Les pages fixes sont liées depuis le pied de page.
- **Données structurées** : `WebSite` (accueil), `BreadcrumbList` (fil d'Ariane), `ItemList` (liste des débats, catégories). Sérialisées avec `<` échappé.
- **`sitemap.xml`, `robots.txt`, `llms.txt`** générés au build depuis le contenu. Tous les robots sont admis (y compris les robots IA, condition du GEO), sauf `/api/`. `/jouer` n'est pas dans le plan du site : son contenu change à chaque visite.
- **Images de partage** (`/og/<id>.png`, 1200 × 630) : satori + resvg en WebAssembly (aucun binaire natif à installer chez l'hébergeur). Dessinées à la demande, rangées sur disque sous l'empreinte de leur mise en page (`OG_CACHE_DIR`), gardées en mémoire (64 dernières). Une image par débat, une image générale pour le reste du site.
- **Couleurs des teams** : `teamColors` utilisait seulement 8 des 56 paires possibles (la couleur B dépendait entièrement de A) ; un brassage du hachage les répartit désormais sur toutes les paires.

## D23 — GIF fiables : validation par mots-clés, signalements, audit (phase 6)

**Constat.** La recherche Giphy renvoyait des GIF hors sujet, surtout pour les œuvres françaises (« Les Trois Frères » donnait des frères quelconques). Le premier résultat était pris sans contrôle.

**Décisions.**

- **Ordre strict** : GIF choisis (`giphyIds`) > recherche validée > cadre rayé (`null`). Un résultat de recherche non validé n'est jamais affiché.
- **Validation** (`src/server/gif-match.ts`) : titre, slug ou auteur du GIF doit contenir un mot-clé de la team, sans accents ni casse, en mots entiers (l'auteur, écrit sans espaces, est comparé mots-clés collés). Mots-clés : `giphyKeywords` s'il existe, sinon le nom sans article et `giphyQuery`. Sans valeur par défaut, les 2 000 teams (aucune n'a de `giphyIds`) auraient toutes perdu leur GIF d'un coup. La recherche demande 25 résultats (`lang=fr`) pour en trouver un valide, en un seul appel.
- **Signalements** dans la base SQLite des votes (migration 3), pas dans un service externe : mêmes garanties que les votes (compteurs, empreinte d'IP quotidienne). Limite séparée et plus stricte (3, puis 1 par minute, 30 par jour). La page Confidentialité le mentionne.
- **Export protégé par jeton** (`GET /api/gif-report`, `GIF_REPORT_TOKEN`) pour que `npm run gif-audit` lise les signalements de production sans accès au serveur. Sans jeton configuré, la route répond 404.
- **Bouton à côté de la carte, pas dedans** : la carte est un `<button>`, qui ne peut pas en contenir un autre. Après l'envoi, le focus passe au message de remerciement.
- **Œuvres françaises** repérées par catégorie (`cinefr`) et par une liste de marqueurs (auteurs, séries, chaînes) dans l'origine : les origines sont du texte libre, aucune règle automatique ne les distingue de façon fiable.

## D24 — Remplacement automatique des GIF signalés, protection anti-robots

**Constats.** Un GIF signalé restait affiché indéfiniment. Surtout, `clientIp` lisait la **première** adresse de `X-Forwarded-For` : un script pouvait en inventer une nouvelle à chaque requête et contourner toute limite de débit. Et un même visiteur pouvait voter jusqu'à 2 000 fois par jour pour la même team.

**Décisions.**

- **Candidats en cache** : une recherche garde jusqu'à 5 GIF validés (`MAX_CANDIDATES`) au lieu d'un seul. Le premier qui n'est pas écarté est servi ; écarter un GIF ne coûte aucun appel à Giphy. Ancien format de cache (`q:`) ignoré, il expire seul.
- **Écarté à 3 signalements** (`GIF_REJECT_THRESHOLD`), comptés une fois par visiteur et par jour : un seul visiteur ne peut pas faire disparaître un bon GIF. Seuls les résultats de recherche sont concernés, jamais les GIF choisis à la main.
- **Un vote par rivalité et par jour** et **un signalement par GIF et par jour** pour une même empreinte (tables `vote_seen` et `gif_report_seen`, migration 4, effacées chaque jour). Elles ne contiennent jamais la team choisie. Plafond quotidien des votes ramené de 2 000 à 600. Inconvénient accepté : des visiteurs derrière la même adresse IP (bureau, opérateur mobile) ne comptent qu'une fois par débat et par jour.
- **IP : l'adresse la plus à droite** de `X-Forwarded-For` (`TRUST_PROXY=true` = 1 proxy, ou un nombre de proxys), la seule écrite par le proxy de l'hébergeur. Diagnostic protégé par le jeton : `GET /api/health?ip`.
- **Filtre de requête** : `Origin` obligatoire, JSON obligatoire, `User-Agent` d'outil automatisé refusé. Facile à contourner pour un robot déterminé, mais cela écarte les scripts naïfs et les formulaires d'autres sites.
- **Pas de CAPTCHA** pour l'instant : ce serait un service tiers de plus (cookies, transfert de données), disproportionné tant qu'aucune attaque n'est observée.

## D25 — Un GIF sur chaque carte, cartes symétriques

**Constats.** La validation par phrase exacte (D23) laissait sans GIF les teams « idées » : leur nom est en français et leur requête est une phrase que Giphy ne reprend jamais telle quelle (« ignored genius »). Sur un échantillon d'une team par catégorie : 13 sur 20 avaient un GIF, 6 de plus en auraient eu un bon avec une correspondance mot à mot, 1 n'avait aucun résultat valable. Par ailleurs, une carte dont le nom tient sur deux lignes était plus haute que l'autre.

**Décisions.**

- **Validation à deux niveaux**, sur la même recherche (aucun appel en plus) : correspondance exacte d'abord, puis mot significatif de la requête. Des `giphyKeywords` écrits à la main restent stricts (pas de mot à mot).
- **GIF d'ambiance par catégorie** en dernier recours (`giphyQuery` obligatoire, `giphyIds` facultatifs sur chaque catégorie) : une seule recherche par catégorie, 5 GIF répartis entre les teams selon leur nom. C'est un GIF générique, jamais présenté comme le personnage : l'esprit de D23 (pas de GIF trompeur) est respecté.
- **Arène en grille** `1fr auto 1fr` : les deux cartes ont toujours la hauteur de la plus haute, et elles ne passent plus l'une sous l'autre entre 720 et 800 px.

## D26 — Vignettes animées sur l'accueil, nombres retirés

- **Le GIF d'ambiance de chaque catégorie (D25) devient sa vignette sur l'accueil**, dans un cadre 16:9 rayé qui garde l'icône Font Awesome en attendant (et en cas d'échec). Même service, même cache : aucun appel Giphy en plus de celui des replis.
- **Version réduite** de Giphy (`fixed_height_small`, environ 14 Ko par vidéo) gardée dans le cache à côté du rendu normal ; chargement à l'approche de l'écran (`IntersectionObserver`), image fixe si les animations sont réduites.
- **Un seul service Giphy pour tout le serveur** (`src/server/giphy-runtime.ts`) : deux routes avec chacune son cache auraient écrit le même fichier et effacé les entrées l'une de l'autre.
- **Les nombres de rivalités disparaissent de l'accueil** (cartes et univers) : l'information n'intéresse pas le visiteur. Textes `themeCount` et `universeCount` supprimés.

## D27 — Achievements, mode admin, indicateur de chargement des GIF

- **Les paliers deviennent des achievements** (`content/ui-texts.fr.json` → `achievements`) : nom, icône, description, et un panneau qui montre aussi ceux à venir, pour donner envie de continuer. Cinq types : débats, rebelles, meilleure série d'accords, catégories, univers. Rien n'est stocké en plus : un achievement est débloqué quand sa valeur atteint l'objectif, et toutes les valeurs ne font que monter. L'état de partie gagne `categories`, `streak` et `bestStreak` (valeurs par défaut pour les anciennes sauvegardes ; catégories retrouvées depuis l'historique). Les icônes sont dessinées au build et envoyées avec les données du jeu, pour ne pas embarquer toute la bibliothèque dans l'îlot.
- **Mode admin par jeton, pas par adresse IP** : l'IP de l'éditeur change (box, 4G). Le jeton `GIF_REPORT_TOKEN` est donné une fois par appareil dans le fragment `#admin=…` (jamais envoyé au serveur dans l'URL), gardé en stockage local, puis envoyé dans l'en-tête `x-484-admin`. Un signalement admin ignore les limites et écarte le GIF aussitôt ; la carte se recharge (`cache: 'reload'`) pour montrer le suivant.
- **Indicateur de chargement** (trois points, sans rotation) seulement après 300 ms d'attente et seulement si un GIF est en route : quand Giphy est à court de quota, le serveur répond immédiatement « indisponible », et aucun indicateur n'apparaît pour rien.

## D28 — « Aucun des deux », un vrai troisième choix (version 1.2.0)

- **Compté sur le serveur** (migration 5 : colonne `none_votes`), comme un vote : même dédoublonnage (un choix par débat, par visiteur et par jour), mêmes limites. L'API renvoie les trois compteurs (`aVotes`, `bVotes`, `noneVotes`) en plus de `chosenVotes` et `totalVotes`.
- **Le pourcentage affiché inclut les trois choix** : « Team A 45 %, aucun des deux 12 %, team B 43 % ». La barre a trois parts ; « aucun » est une part neutre et rayée, au milieu.
- **Hall of Fame** : les débats « serrés » et « écrasants » sont jugés sur l'écart entre les deux teams seulement (beaucoup de « aucun des deux » ne rend pas un débat serré) ; « les plus votés » compte tous les votes.
- **Pour le visiteur, c'est un débat tranché** : il compte pour le numéro de débat et les achievements, et apparaît dans « Tes teams ». Clavier : ↓. Le bouton « Je ne connais aucun des deux » reste un simple passage, sans vote.

## D29 — Liens Tenor choisis à la main (version 1.3.0)

**Constat.** Giphy n'a presque rien sur les œuvres françaises que Tenor connaît (Eddy Mitchell). Mais l'API Tenor est fermée aux sites extérieurs depuis le 30 juin 2026 (annonce de Google du 13 janvier 2026) : plus de recherche automatique possible. Klipy, présenté comme remplaçant, n'a pas non plus ces GIF.

**Décisions.**

- **Liens choisis à la main** (`gifUrls`) : l'éditeur copie l'adresse d'une image sur tenor.com et la colle dans la page de curation. Tirés au sort avec les `giphyIds`, avant toute recherche.
- **Seulement `media.tenor.com`**, validé par le schéma : jamais n'importe quel site. Le GIF reste hébergé chez Tenor ; rien n'est copié sur le serveur du site.
- **Versions déduites du lien** : le code de format de 5 caractères après l'identifiant désigne une version du GIF (`AAAAC` original de plusieurs Mo, `AAAPo` MP4 d'environ 200 Ko, `AAAAe` aperçu fixe d'une seule image). Vérifié le 22/11/2026 sur de vrais GIF, aux deux formes d'adresse. Le navigateur reçoit le même format que pour Giphy (MP4 + image fixe) : rien à changer dans les cartes. Schéma non documenté : s'il change, la carte garde son cadre rayé.
- **Confidentialité** : les serveurs d'images de Tenor ne posent aucun cookie (vérifié) et autorisent CORS. La page Confidentialité mentionne Tenor (Google) ; le pied de page affiche « GIF via Tenor » seulement si un lien est utilisé.

## D30 — Images rangées sur le site, quand aucun GIF n'existe (version 1.4.0)

**Constat.** Certaines teams n'ont de GIF ni chez Giphy ni chez Tenor (Tazos, Les Ripoux). L'éditeur trouve en revanche des images ailleurs (YouTube, Etsy, ses propres fichiers).

**Décisions.**

- **Copiées sur le site, pas liées** : afficher directement l'image d'un site quelconque ajouterait un service tiers inconnu (adresse IP du visiteur transmise, page Confidentialité à changer) et casserait dès que le site d'origine bouge ou bloque. La page de curation télécharge l'image et la range dans `public/images/teams/` ; elle part en production avec le reste du dépôt.
- **Réduite à l'import** : WebP de 480 px de large (la largeur des cartes), quelques dizaines de Ko. Une image animée garde son animation (`.anim.webp`, 1,5 Mo au plus) et une version fixe pour les animations réduites.
- **Nom avec empreinte** (`<team>-<8 caractères du SHA-256>`) : la même image importée deux fois donne le même fichier ; l'identifiant `img<empreinte>` sert pour « Mauvais GIF ? » comme ceux de Giphy et Tenor.
- **Même format côté navigateur** : l'API renvoie `mp4` vide ; la carte affiche alors l'image (`webp`) au lieu d'une vidéo. Rien d'autre ne change dans les cartes.
- **Droits** : les images sont recopiées sur le site ; la procédure rappelle de préférer celles qu'on a le droit d'utiliser.

## D31 — Marque officielle « Powered by GIPHY » (version 1.4.3)

GIPHY exige d'afficher ses marques d'attribution officielles là où l'API est utilisée : condition pour obtenir la clé de production. Le simple texte du pied de page est remplacé par le badge officiel (`public/images/giphy/powered-by-giphy.gif`, 200 × 42, tiré du kit de GIPHY, original dans `docs/giphy/`), lien vers giphy.com. Le badge est animé ; quand les animations sont réduites (réglage du système ou interrupteur de l'en-tête), une version fixe (première image, `powered-by-giphy.png`) s'affiche à la place. Le texte `footer.giphy.label` sert de texte alternatif.

## D32 — Giphy appelé par le navigateur, selon les règles de GIPHY (version 1.5.0)

**Constat.** La documentation de GIPHY pour les développeurs (« Prohibited Integration Practices », lue le 22/11/2026) interdit trois choses que le site faisait ou allait faire : mettre en cache les réponses de l'API ou les adresses des médias (« Do not cache API responses or media URLs »), passer par un serveur intermédiaire (« Do not proxy requests to GIPHY […] All requests to GIPHY should be made directly from the client side »), et modifier les adresses renvoyées (« Do not strip or modify URLs returned by the API »). C'est ce que GIPHY vérifie avant d'accorder une clé de production. L'idée de déduire l'adresse d'un GIF de son identifiant, sans appel à l'API, est donc abandonnée.

**Décisions.**

- **Le serveur prépare, le navigateur appelle.** `/api/gif` et `/api/category-gif` renvoient un plan (GIF choisi tiré au sort, recherche, mots-clés, GIF écartés, GIF d'ambiance) ; `src/lib/giphy.ts` l'exécute dans le navigateur. Toute la logique de choix reste la même ; les liens Tenor et les images du site restent servis tels quels.
- **Aucun cache de Giphy** : ni fichier, ni mémoire côté serveur. `data/gif-cache.json` est supprimé au démarrage. Dans le navigateur, une carte garde le GIF choisi pendant la visite, et la vidéo du prochain challenger est préchargée par un lecteur caché (cache HTTP ordinaire du navigateur), plus par une copie `blob:`.
- **Adresses intactes** : les cartes affichent les adresses renvoyées par Giphy, paramètres compris.
- **Clé publique** : la clé du site part dans le plan. C'est le cas de toute clé web Giphy ; il vaut mieux une autre clé pour `npm run gif-audit`, pour que la curation n'entame pas le quota du site.
- **Quota** : après un 429, le navigateur n'appelle plus Giphy jusqu'à la fin de la visite. Avec une clé beta (100 appels par heure pour tout le site), le quota s'épuise vite : cette version suppose la clé de production.
- **Confidentialité** : GIPHY reçoit désormais, depuis le navigateur du visiteur, le nom de la team cherchée ou le numéro du GIF. La page Confidentialité le dit ; aucun cookie (vérifié).
- **Non fait** : les appels d'analyse recommandés par GIPHY (« onload », « onclick ») demandent un identifiant de visiteur ; le site n'en a pas et n'en veut pas.

## D33 — Pied de page en trois étages (version 1.5.0)

Le pied de page mélangeait les liens de l'auteur, la phrase d'humour, les mentions légales, la version et les attributions. Il est rangé en trois étages : la phrase d'humour seule ; une ligne avec le Hall of Fame et « Voir mes autres projets » à gauche, les badges officiels « Powered by GIPHY » et « powered by tenor » à droite ; sous un filet, les liens d'information et la version. Le logo Tenor est la version blanche officielle (`PB_tenor_logo_white_horizontal.svg`, kit d'attribution de Tenor), posée sur un fond noir de la hauteur du badge GIPHY ; il n'apparaît que si des liens Tenor sont utilisés.

## D34 — « Les deux », boutons rangés, barre du résultat aux couleurs des cartes (version 1.6.0)

- **Quatrième choix « Les deux »** (flèche ↑) : un vrai vote, compté à part (`both_votes`, migration 6 de la base, ajoutée toute seule au démarrage). Il compte comme un débat tranché, apparaît dans « Tes teams » et dans le Hall of Fame (part grise unie ; « aucun des deux » reste rayé). Comme « aucun des deux », il ne rend pas un débat serré ou écrasant.
- **Boutons en deux rangées** : « Les deux » | « Aucun des deux » (des votes), puis « Passer » | « Partager » (pas des votes, un cran plus discrets). « Je ne connais aucun des deux » devient « Passer ».
- **Barre du résultat** : les couleurs des deux cartes, collées, avec leur pourcentage écrit dedans ; c'est le duel, parmi ceux qui ont choisi une team. « Les deux » et « aucun des deux » sont écrits dessous, en part de tous les votes. Au-dessus, « Comme X % des autres » reste la part de tous les votes du même choix : il peut différer du chiffre de la barre (choix validé).
- **Durée de vie du bandeau** : 10 s une fois la remarque affichée (5 à 6 s suffisent à le lire), avec un filet jaune qui se vide, puis une sortie en douceur. Le décompte s'arrête au survol, au clavier dans le bandeau et quand l'onglet est caché. Le bandeau reste collé en bas pour tous les choix, plus seulement pour une team.
