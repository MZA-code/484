/**
 * GET /api/finish-gif/:id → le GIF de l'écran « Catégorie terminée » d'une catégorie, d'un
 * univers ou de « Tout mélangé » (`mix`) : un GIF choisi à la main (tiré au sort), sinon la
 * recherche `finish.giphyQuery` de la catégorie ; univers et « Tout mélangé » ont une recherche
 * générique. Comme pour /api/category-gif, c'est le navigateur qui appelle Giphy.
 *
 * - 200 { kind: 'giphy', key, id?, query } · 200 { kind: 'gif', gif } en mode sans Giphy
 * - 404 identifiant inconnu · 503 clé Giphy absente
 * L'écran de fin reste complet sans GIF.
 */
import type { APIRoute } from 'astro';
import { categories, ui, universes } from '../../../data/content';
import { MIXED_CATEGORY } from '../../../engine';
import type { CategoryGiphyPlan } from '../../../lib/giphy';
import { placeholderGif } from '../../../server/gif-placeholder';
import { moodPlan } from '../../../server/gif-plan';
import {
  getGiphyKey,
  gifJson as json,
  giphyOffline,
  placeholdersOff,
} from '../../../server/giphy-runtime';

export const prerender = false;

/** Recherche des écrans de fin sans GIF propre (univers, « Tout mélangé », catégorie sans `finish`). */
const GENERIC_QUERY = 'victory dance';

const finishOf = new Map<string, { label: string; giphyQuery: string; giphyIds?: string[] }>([
  [MIXED_CATEGORY, { label: ui.home.mixedTheme.label, giphyQuery: GENERIC_QUERY }],
  ...universes.map((u) => [u.id, { label: u.label, giphyQuery: GENERIC_QUERY }] as const),
  ...categories.map(
    (c) =>
      [
        c.id,
        {
          label: c.label,
          giphyQuery: c.finish?.giphyQuery ?? GENERIC_QUERY,
          ...(c.finish?.giphyIds ? { giphyIds: c.finish.giphyIds } : {}),
        },
      ] as const,
  ),
]);

export const GET: APIRoute = ({ params }) => {
  const finish = finishOf.get(params.id ?? '');
  if (!finish) return json({ error: 'unknown-category' }, 404, 'public, max-age=3600');
  if (giphyOffline() && !placeholdersOff()) {
    const gif = placeholderGif(finish.label, `finish-${params.id ?? ''}`);
    return json({ kind: 'gif', gif }, 200, 'no-store');
  }
  const key = getGiphyKey();
  if (!key) return json({ error: 'giphy-not-configured' }, 503, 'no-store');
  const plan: CategoryGiphyPlan = { kind: 'giphy', key, ...moodPlan(finish) };
  return json(plan, 200, 'public, max-age=86400');
};
