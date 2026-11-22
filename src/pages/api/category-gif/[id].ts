/**
 * GET /api/category-gif/:categoryId → vignette animée d'une catégorie (accueil).
 *
 * C'est le GIF d'ambiance de la catégorie (ses `giphyIds`, sinon le premier résultat de sa
 * recherche `giphyQuery`), en version réduite. Même service et même cache que /api/gif :
 * 20 catégories, une recherche par semaine chacune.
 *
 * - 200 { id, mp4, webp, still } · 200 null si rien n'est trouvé
 * - 404 catégorie inconnue · 503 clé Giphy absente · 502 Giphy en erreur
 * Le navigateur garde l'icône de la catégorie dans tous les cas d'échec.
 */
import type { APIRoute } from 'astro';
import { categories } from '../../../data/content';
import { GiphyError, thumbnailOf } from '../../../server/giphy';
import { getGiphyService, gifJson as json } from '../../../server/giphy-runtime';

export const prerender = false;

const moodOf = new Map(
  categories.map((c) => [c.id, { giphyIds: c.giphyIds, giphyQuery: c.giphyQuery }]),
);

export const GET: APIRoute = async ({ params }) => {
  const mood = moodOf.get(params.id ?? '');
  if (!mood) return json({ error: 'unknown-category' }, 404, 'public, max-age=3600');

  const giphy = getGiphyService();
  if (!giphy) return json({ error: 'giphy-not-configured' }, 503, 'no-store');

  try {
    const gif = await giphy.categoryGif(mood);
    // Une vignette d'accueil change rarement : un jour de cache dans le navigateur.
    return json(gif ? thumbnailOf(gif) : null, 200, 'public, max-age=86400');
  } catch (error) {
    const status = error instanceof GiphyError ? error.status : 0;
    console.warn(`[api/category-gif] ${params.id}: Giphy failure (${status || 'network'})`);
    return json({ error: 'giphy-unavailable' }, 502, 'no-store');
  }
};
