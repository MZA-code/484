# 484 · Lequel tu préfères ?

Des duels infinis entre icônes de la pop culture. Tu choisis, le gagnant reste, un nouveau challenger arrive.

> État : **phase 0** (socle technique). Prototype local, pas encore déployé.

## Prérequis

- Node.js 24 ou plus récent (voir `.nvmrc`)
- npm (livré avec Node)

## Lancer le projet

```sh
npm install
npm run dev        # http://localhost:4840
```

Vérifier que la partie serveur répond : <http://localhost:4840/api/health>.

## Commandes

| Commande         | Rôle                                                       |
| ---------------- | ---------------------------------------------------------- |
| `npm run dev`    | Serveur de développement                                   |
| `npm run build`  | Build de production dans `dist/`                           |
| `npm start`      | Lance le build de production (serveur Node autonome)       |
| `npm run lint`   | ESLint                                                     |
| `npm run format` | Formate tout le code avec Prettier                         |
| `npm run check`  | Vérification des types (TypeScript + Astro)                |
| `npm test`       | Tests unitaires (Vitest)                                   |
| `npm run verify` | Tout ce que fait la CI : lint, format, types, tests, build |

## Organisation

```
content/          Tous les textes et les prétendants (JSON), modifiables sans toucher au code
docs/             Brief d'origine et décisions techniques (decisions.md)
src/pages/        Pages Astro et routes API (src/pages/api/)
.github/workflows CI : lint + types + tests + build à chaque push
```

## Secrets

Copier `.env.example` en `.env` et le remplir. Le fichier `.env` n'est jamais commité.

## À venir

Les sections « Ajouter un prétendant », « Curer les GIF » et « Déployer » seront écrites dans les phases correspondantes.
