/**
 * GET /api/gif/:rivalryId/:team → ce qu'il faut afficher pour une team (voir src/server/gif-plan.ts).
 *
 * Le serveur n'appelle jamais Giphy (règle de GIPHY pour le web) : il renvoie un plan, que le
 * navigateur exécute (src/lib/giphy.ts).
 * Priorité : GIF choisis à la main (`giphyIds`, liens Tenor `gifUrls` et images du site
 * `images`, tirés au sort ensemble) > recherche validée > GIF d'ambiance de la catégorie > rien.
 *
 * Réponses :
 * - 200 { kind: 'gif', gif }   lien Tenor ou image du site, prêt à afficher
 * - 200 { kind: 'giphy', key, id?, query, keywords, words, mood? }   à demander à Giphy
 * - 404 rivalité ou team inconnue · 503 rien de choisi à la main et clé Giphy absente
 * En mode sans Giphy (GIPHY_OFFLINE, développement), un GIF de remplacement au lieu de Giphy.
 * Le client affiche le cadre rayé dans tous les cas d'erreur : le jeu ne bloque jamais.
 */
import type { APIRoute } from 'astro';
import { categories, rivalries } from '../../../../data/content';
import { teamGifPlan } from '../../../../server/gif-plan';
import { placeholderGif } from '../../../../server/gif-placeholder';
import { getGiphyKey, gifJson as json, giphyOffline } from '../../../../server/giphy-runtime';

export const prerender = false;

const byId = new Map(rivalries.map((r) => [r.id, r]));
/** GIF d'ambiance de chaque catégorie, en dernier recours. */
const moodOf = new Map(
  categories.map((c) => [c.id, { giphyIds: c.giphyIds, giphyQuery: c.giphyQuery }]),
);

export const GET: APIRoute = ({ params }) => {
  const rivalry = byId.get(params.rivalry ?? '');
  const side = params.team;
  if (!rivalry || (side !== 'a' && side !== 'b')) {
    return json({ error: 'unknown-team' }, 404, 'public, max-age=3600');
  }
  const { plan, maxAge } = teamGifPlan(rivalry[side], {
    apiKey: getGiphyKey(),
    mood: moodOf.get(rivalry.category),
  });
  if (!plan && giphyOffline()) {
    const gif = placeholderGif(rivalry[side].name, `${rivalry.id}-${side}`);
    return json({ kind: 'gif', gif }, 200, 'no-store');
  }
  if (!plan) return json({ error: 'giphy-not-configured' }, 503, 'no-store');
  return json(plan, 200, `public, max-age=${maxAge}`);
};
