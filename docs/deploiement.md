# Déploiement sur o2switch

Le site tourne comme une application Node.js dans cPanel (« Setup Node.js App », Phusion Passenger).
Tout se fait depuis l'interface de cPanel : aucune ligne de commande n'est obligatoire.

## Vue d'ensemble

| Élément              | Valeur                                                                              |
| -------------------- | ----------------------------------------------------------------------------------- |
| Version de Node.js   | 24.22.3                                                                             |
| Code                 | cloné depuis GitHub dans `~/team484` (outil « Git Version Control »)                |
| Fichier de démarrage | `app.cjs` (lance `dist/server/entry.mjs`)                                           |
| Domaine              | `team484.fr`                                                                        |
| Données              | `~/team484/data/` : votes, cache des GIF, images de partage (hors de `public_html`) |

## Première installation

1. **Récupérer le code** : cPanel → « Git Version Control » → « Create ».
   - Clone a Repository : activé.
   - Clone URL : `https://github.com/MZA-code/484.git`
   - Repository Path : `team484`
   - Repository Name : `484`
2. **Créer l'application** : cPanel → « Setup Node.js App » → « Create Application ».
   - Version de Node.js : 24.22.3.
   - Mode d'application : Production.
   - Racine de l'application : `team484`.
   - URL de l'application : `team484.fr` (chemin vide).
   - Fichier de démarrage : `app.cjs`.
3. **Variables d'environnement** (même écran, « Add Variable ») :
   - `GIPHY_API_KEY` : la clé Giphy.
   - `VOTE_HASH_SALT` : une longue chaîne aléatoire, propre à la production.
   - `TRUST_PROXY` : `true`.
4. **Installer et construire** : « Run NPM Install », puis « Run JS script » → `build`.
5. **Démarrer** : « Restart ».

## Mettre à jour le site

1. cPanel → « Git Version Control » → « Manage » sur `484` → onglet « Pull or Deploy » → « Update from Remote ».
2. cPanel → « Setup Node.js App » → crayon sur `team484.fr` :
   - « Run NPM Install » si les dépendances ont changé ;
   - « Run JS script » → `build` ;
   - « Restart ».

## Sauvegardes

La base des votes est le seul fichier précieux : `~/team484/data/votes.sqlite`.
Le cache des GIF et les images de partage se reconstruisent tout seuls.
o2switch sauvegarde l'hébergement chaque jour (outil « JetBackup » dans cPanel).
