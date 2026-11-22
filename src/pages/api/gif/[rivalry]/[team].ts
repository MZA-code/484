/**
 * GET /api/gif/:rivalryId/:team → ce qu'il faut afficher pour une team (voir src/server/gif-plan.ts).
 *
 * Le serveur n'appelle jamais Giphy (règle de GIPHY pour le web) : il renvoie un plan, que le
 * navigateur exécute (src/lib/giphy.ts).
 * Priorité : GIF choisis à la main (`giphyIds`, liens Tenor `gifUrls` et images du site
 * `images`, tirés au sort ensemble) > recherche validée > GIF d'ambiance de la catégorie > rien.
 * Les résultats de recherche trop signalés (« Mauvais GIF ? ») sont transmis pour être sautés.
 *
 * Réponses :
 * - 200 { kind: 'gif', gif }   lien Tenor ou image du site, prêt à afficher
 * - 200 { kind: 'giphy', key, id?, query, keywords, words, rejected, mood? }   à demander à Giphy
 * - 404 rivalité ou team inconnue · 503 rien de choisi à la main et clé Giphy absente
 * Le client affiche le cadre rayé dans tous les cas d'erreur : le jeu ne bloque jamais.
 */
import type { APIRoute } from 'astro';
import { categories, rivalries } from '../../../../data/content';
import { teamGifPlan } from '../../../../server/gif-plan';
import { getGiphyKey, gifJson as json } from '../../../../server/giphy-runtime';
import { getVoteService } from '../../../../server/votes/runtime';

export const prerender = false;

const byId = new Map(rivalries.map((r) => [r.id, r]));
/** GIF d'ambiance de chaque catégorie, en dernier recours. */
const moodOf = new Map(
  categories.map((c) => [c.id, { giphyIds: c.giphyIds, giphyQuery: c.giphyQuery }]),
);

/** GIF écartés par les signalements ; une base indisponible n'empêche jamais d'afficher un GIF. */
function rejectedGifs(rivalryId: string, side: 'a' | 'b'): ReadonlySet<string> {
  try {
    return getVoteService()?.rejectedGifs(rivalryId, side) ?? new Set();
  } catch (error) {
    console.warn('[api/gif] reports unavailable:', (error as Error).message);
    return new Set();
  }
}

export const GET: APIRoute = ({ params }) => {
  const rivalry = byId.get(params.rivalry ?? '');
  const side = params.team;
  if (!rivalry || (side !== 'a' && side !== 'b')) {
    return json({ error: 'unknown-team' }, 404, 'public, max-age=3600');
  }
  const { plan, maxAge } = teamGifPlan(rivalry[side], {
    apiKey: getGiphyKey(),
    mood: moodOf.get(rivalry.category),
    rejected: rejectedGifs(rivalry.id, side),
  });
  if (!plan) return json({ error: 'giphy-not-configured' }, 503, 'no-store');
  return json(plan, 200, `public, max-age=${maxAge}`);
};
