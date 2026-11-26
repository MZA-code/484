/**
 * npm run dev:sans-giphy : le serveur de développement (comme `npm run dev`), mais sans Giphy.
 *
 * Pour tester le site (et pour Claude, qui n'a pas besoin de voir les GIF) sans consommer le
 * quota de la clé Giphy : la clé n'est jamais envoyée au navigateur, les cartes reçoivent un
 * GIF de remplacement (voir src/server/gif-placeholder.ts) et les vignettes de l'accueil
 * gardent leur icône. Les liens Tenor et les images rangées sur le site restent affichés
 * (aucun appel à l'API Giphy).
 *
 * `npm run dev:sans-giphy -- --sans-gif` : pas non plus de GIF de remplacement, pour voir le site
 * comme quand le quota de la clé Giphy beta est épuisé (cartes en « carton », D45).
 */
import { dev } from 'astro';

const sansGif = process.argv.includes('--sans-gif');
process.env.GIPHY_OFFLINE = sansGif ? 'sans-gif' : 'true';
if (sansGif) console.log('[484] Sans GIF de remplacement : cartes en carton.');
console.log('[484] Mode développement sans Giphy : aucun appel à l’API Giphy.');
await dev({});
