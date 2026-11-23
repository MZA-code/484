/**
 * npm run dev:sans-giphy : le serveur de développement (comme `npm run dev`), mais sans Giphy.
 *
 * Pour tester le site (et pour Claude, qui n'a pas besoin de voir les GIF) sans consommer le
 * quota de la clé Giphy : la clé n'est jamais envoyée au navigateur, les cartes reçoivent un
 * GIF de remplacement (voir src/server/gif-placeholder.ts) et les vignettes de l'accueil
 * gardent leur icône. Les liens Tenor et les images rangées sur le site restent affichés
 * (aucun appel à l'API Giphy).
 */
import { dev } from 'astro';

process.env.GIPHY_OFFLINE = 'true';
console.log('[484] Mode développement sans Giphy : aucun appel à l’API Giphy.');
await dev({});
