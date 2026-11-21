# Déploiement sur o2switch

Le site tourne comme une application Node.js dans cPanel (« Setup Node.js App », Phusion Passenger).
**Le site n'est pas construit sur le serveur** : l'hébergement mutualisé est trop lent pour générer
plus de 1 000 pages. GitHub le construit (workflow `.github/workflows/deploy.yml`) et publie le
résultat dans la branche `production`, que le serveur se contente de récupérer.

## Vue d'ensemble

| Élément                   | Valeur                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Dossier public du domaine | `~/484` : `.htaccess` (bloc Passenger), `.well-known`, `cgi-bin`. **Jamais de code ici.** |
| Application               | `~/team484` : clone Git du dépôt, branche `production`                                    |
| Version de Node.js        | 24.22.3, mode Production                                                                  |
| Fichier de démarrage      | `app.cjs` (lance `dist/server/entry.mjs`)                                                 |
| Données                   | `~/team484/data/` : votes, cache des GIF, images de partage                               |
| Variables (cPanel)        | `GIPHY_API_KEY`, `VOTE_HASH_SALT`, `TRUST_PROXY=true`                                     |

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

## Première installation (pour mémoire)

1. Git Version Control : cloner `https://github.com/MZA-code/484.git` dans `team484`.
2. Setup Node.js App : créer l'application (racine `team484`, URL `team484.fr`, démarrage `app.cjs`), puis ajouter les variables et lancer « Run NPM Install ».
3. Terminal : `cd ~/team484 && git fetch origin && git checkout -f production && touch tmp/restart.txt`.

## Pièges connus

- **Ne pas modifier la racine d'une application** dans cPanel : il déplace les fichiers et casse le `.htaccess` du domaine. Supprimer l'application et la recréer.
- **La racine du document du domaine doit rester `484`** (cPanel → Domaines). Si elle pointe vers `team484`, le code et les données deviennent publics.
- Ne pas lancer le build depuis cPanel (« Run JS script ») : il reste bloqué et verrouille l'application (« Can't acquire lock »). En cas de blocage : `pkill -u $USER -f "astro build"`.

## Sauvegardes

La base des votes est le seul fichier précieux : `~/team484/data/votes.sqlite`.
Le cache des GIF et les images de partage se reconstruisent tout seuls.
o2switch sauvegarde l'hébergement chaque jour (outil « JetBackup » dans cPanel).
