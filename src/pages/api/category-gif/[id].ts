/**
 * GET /api/category-gif/:categoryId → quoi demander à Giphy pour la vignette d'une catégorie
 * (accueil) : son GIF d'ambiance choisi à la main (tiré au sort), sinon sa recherche `giphyQuery`.
 * Le navigateur fait l'appel à Giphy lui-même (src/lib/giphy.ts) et prend la version réduite.
 *
 * - 200 { kind: 'giphy', key, id?, query }
 * - 404 catégorie inconnue · 503 clé Giphy absente
 * Le navigateur garde l'icône de la catégorie dans tous les cas d'échec.
 */
import type { APIRoute } from 'astro';
import { categories } from '../../../data/content';
import type { CategoryGiphyPlan } from '../../../lib/giphy';
import { moodPlan } from '../../../server/gif-plan';
import { getGiphyKey, gifJson as json } from '../../../server/giphy-runtime';

export const prerender = false;

const moodOf = new Map(
  categories.map((c) => [c.id, { giphyIds: c.giphyIds, giphyQuery: c.giphyQuery }]),
);

export const GET: APIRoute = ({ params }) => {
  const mood = moodOf.get(params.id ?? '');
  if (!mood) return json({ error: 'unknown-category' }, 404, 'public, max-age=3600');
  const key = getGiphyKey();
  if (!key) return json({ error: 'giphy-not-configured' }, 503, 'no-store');
  const plan: CategoryGiphyPlan = { kind: 'giphy', key, ...moodPlan(mood) };
  // Une vignette d'accueil change rarement : un jour de cache dans le navigateur.
  return json(plan, 200, 'public, max-age=86400');
};
