/**
 * GET /api/gif/:rivalryId/:team → le GIF d'une team (URL MP4/WebP/image fixe).
 *
 * Priorité : GIF choisis à la main (`giphyIds`) > recherche validée > GIF d'ambiance de la catégorie > rien.
 * Les résultats de recherche trop signalés (« Mauvais GIF ? ») sont remplacés par le suivant.
 *
 * Réponses :
 * - 200 { id, mp4, webp, still, width, height }
 * - 200 null : aucun GIF pour cette team, même d'ambiance (le client affiche le cadre rayé)
 * - 404 rivalité ou team inconnue
 * - 503 clé Giphy absente · 502 Giphy en erreur
 * Le client affiche le cadre rayé dans tous les cas d'erreur : le jeu ne bloque jamais.
 */
import type { APIRoute } from 'astro';
import { categories, rivalries } from '../../../../data/content';
import { GiphyError } from '../../../../server/giphy';
import { getGiphyService, gifJson as json } from '../../../../server/giphy-runtime';
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

export const GET: APIRoute = async ({ params }) => {
  const rivalry = byId.get(params.rivalry ?? '');
  const side = params.team;
  if (!rivalry || (side !== 'a' && side !== 'b')) {
    return json({ error: 'unknown-team' }, 404, 'public, max-age=3600');
  }
  const team = rivalry[side];

  const giphy = getGiphyService();
  if (!giphy) return json({ error: 'giphy-not-configured' }, 503, 'no-store');

  try {
    const gif = await giphy.gifFor(
      { ...team, fallback: moodOf.get(rivalry.category) },
      rejectedGifs(rivalry.id, side),
    );
    if (!gif) return json(null, 200, 'public, max-age=3600');
    // Seul un GIF choisi à la main, et unique, est stable : il peut rester un jour en cache.
    // Sinon une heure : variété entre plusieurs GIF choisis, ou remplacement d'un GIF signalé.
    const stable = team.giphyIds.length === 1 && team.giphyIds[0] === gif.id;
    const maxAge = stable ? 86400 : 3600;
    return json(gif, 200, `public, max-age=${maxAge}`);
  } catch (error) {
    const status = error instanceof GiphyError ? error.status : 0;
    console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || 'network'})`);
    return json({ error: 'giphy-unavailable' }, 502, 'no-store');
  }
};
