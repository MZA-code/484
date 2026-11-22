# Déploiement sur o2switch

Le site tourne comme une application Node.js dans cPanel (« Setup Node.js App », Phusion Passenger).
**Le site n'est pas construit sur le serveur** : l'hébergement mutualisé est trop lent pour générer
plus de 1 000 pages. GitHub le construit (workflow `.github/workflows/deploy.yml`) et publie le
résultat dans la branche `production`, que le serveur se contente de récupérer.

## Vue d'ensemble

| Élément                   | Valeur                                                                                                   |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Dossier public du domaine | `~/484` : `.htaccess` (redirections + bloc Passenger), `.well-known`, `cgi-bin`. **Jamais de code ici.** |
| Application               | `~/team484` : clone Git du dépôt, branche `production`                                                   |
| Version de Node.js        | 24.22.3, mode Production                                                                                 |
| Fichier de démarrage      | `app.cjs` (lance `dist/server/entry.mjs`)                                                                |
| Données                   | `~/team484/data/` : votes, images de partage                                                             |
| Variables (cPanel)        | `GIPHY_API_KEY`, `VOTE_HASH_SALT`, `TRUST_PROXY=true`, `GIF_REPORT_TOKEN`                                |

## Mettre à jour le site

1. Pousser sur `main` : GitHub teste, construit et publie la branche `production` (2 à 3 minutes).
2. Dans le Terminal de cPanel :

   ```sh
   cd ~/team484 && git pull && touch tmp/restart.txt
   ```

3. Si les dépendances ont changé, avant le redémarrage :

   ```sh
   source ~/nodevenv/team484/24/bin/activate && cd ~/team484 && npm install --omit=dev
   ```

## Redirections : toujours `https://team484.fr`

Toutes les adresses mènent à `https://team484.fr`, en gardant la page demandée (redirection
permanente 301) :

| Adresse demandée           | Devient                     |
| -------------------------- | --------------------------- |
| `http://team484.fr/debats` | `https://team484.fr/debats` |
| `http://www.team484.fr/…`  | `https://team484.fr/…`      |
| `https://www.team484.fr/…` | `https://team484.fr/…`      |

Ces règles sont les 5 premières lignes de `~/484/.htaccess`, **au-dessus** du bloc Passenger
(sinon l'application répond avant elles) :

```apache
# Redirections : toujours https://team484.fr (sans www)
RewriteEngine On
RewriteCond %{HTTP_HOST} ^www\. [NC,OR]
RewriteCond %{HTTP:X-Forwarded-Proto} =http
RewriteRule ^ https://team484.fr%{REQUEST_URI} [R=301,L]
```

Un proxy d'o2switch se trouve devant le serveur. La règle s'appuie donc sur l'en-tête
`X-Forwarded-Proto` qu'il transmet, et ne redirige que s'il vaut explicitement `http` : sans cet
en-tête, elle ne fait rien, ce qui exclut toute boucle de redirection. Vérifié le 22/11/2026 :
`http://` est bien redirigé, `https://` s'affiche directement.

**Ne pas utiliser la page « Redirections » de cPanel** pour ce domaine : elle n'écrit pas dans
`~/484/.htaccess`, et une redirection de `team484.fr` vers `https://team484.fr/` peut boucler.

**Si les redirections disparaissent** (par exemple après avoir recréé l'application Node, qui
réécrit le `.htaccess`), les remettre depuis le Terminal de cPanel :

```sh
cd ~/484 && cp .htaccess .htaccess.avant-redirection && { printf '%s\n' '# Redirections : toujours https://team484.fr (sans www)' 'RewriteEngine On' 'RewriteCond %{HTTP_HOST} ^www\. [NC,OR]' 'RewriteCond %{HTTP:X-Forwarded-Proto} =http' 'RewriteRule ^ https://team484.fr%{REQUEST_URI} [R=301,L]' ''; cat .htaccess.avant-redirection; } > .htaccess && cat .htaccess
```

Retour arrière : `cp ~/484/.htaccess.avant-redirection ~/484/.htaccess`.

Vérification depuis n'importe quel poste :

```sh
curl -sI http://www.team484.fr/debats | grep -i location   # → https://team484.fr/debats
```

## Première installation (pour mémoire)

1. Git Version Control : cloner `https://github.com/MZA-code/484.git` dans `team484`.
2. Setup Node.js App : créer l'application (racine `team484`, URL `team484.fr`, démarrage `app.cjs`), puis ajouter les variables et lancer « Run NPM Install ».
3. Terminal : `cd ~/team484 && git fetch origin && git checkout -f production && touch tmp/restart.txt`.

## Pièges connus

- **Recréer l'application Node réécrit `~/484/.htaccess`** : vérifier ensuite que les 5 lignes de redirection sont toujours en haut (voir « Redirections »).

- **Ne pas modifier la racine d'une application** dans cPanel : il déplace les fichiers et casse le `.htaccess` du domaine. Supprimer l'application et la recréer.
- **La racine du document du domaine doit rester `484`** (cPanel → Domaines). Si elle pointe vers `team484`, le code et les données deviennent publics.
- Ne pas lancer le build depuis cPanel (« Run JS script ») : il reste bloqué et verrouille l'application (« Can't acquire lock »). En cas de blocage : `pkill -u $USER -f "astro build"`.

## Sauvegardes

La base des votes est le seul fichier précieux : `~/team484/data/votes.sqlite`.
Les images de partage se reconstruisent toutes seules. (L'ancien cache des GIF, `data/gif-cache.json`, est supprimé au démarrage depuis la version 1.5.0 : GIPHY interdit de garder ses réponses.)
o2switch sauvegarde l'hébergement chaque jour (outil « JetBackup » dans cPanel).
