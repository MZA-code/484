/**
 * GET /api/category-gifs → quoi demander à Giphy pour les vignettes de toutes les catégories
 * (accueil) : pour chacune, son GIF d'ambiance choisi à la main (tiré au sort), sinon sa
 * recherche `giphyQuery`. Le navigateur demande d'un coup tous les GIF choisis à la main, en un
 * seul appel à Giphy (D45), et ne lance une recherche que pour une catégorie sans GIF choisi.
 *
 * - 200 { kind: 'giphy', key, plans: { [categorie]: { id?, query } } }
 * - 503 clé Giphy absente (ou mode sans Giphy) : l'accueil garde les icônes des catégories
 */
import type { APIRoute } from 'astro';
import { categories } from '../../data/content';
import type { CategoryGiphyPlans } from '../../lib/giphy';
import { moodPlan } from '../../server/gif-plan';
import { getGiphyKey, gifJson as json } from '../../server/giphy-runtime';

export const prerender = false;

export const GET: APIRoute = () => {
  const key = getGiphyKey();
  if (!key) return json({ error: 'giphy-not-configured' }, 503, 'no-store');
  const plans = Object.fromEntries(
    categories.map((c) => [c.id, moodPlan({ giphyIds: c.giphyIds, giphyQuery: c.giphyQuery })]),
  );
  const body: CategoryGiphyPlans = { kind: 'giphy', key, plans };
  // Les vignettes de l'accueil changent rarement : un jour de cache dans le navigateur.
  return json(body, 200, 'public, max-age=86400');
};
