/**
 * GET /api/gif/:rivalryId/:team → le GIF d'une team (URL MP4/WebP/image fixe).
 *
 * Priorité : GIF choisis à la main (`giphyIds`, liens Tenor `gifUrls` et images rangées sur le
 * site `images`, tirés au sort ensemble)
 * > recherche validée > GIF d'ambiance de la catégorie > rien.
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
import { teamImage, tenorGif } from '../../../../server/gif-links';
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

  // GIF choisis à la main : un seul est stable (un jour de cache), plusieurs varient (une heure).
  // Liens Tenor et images du site : rien à demander à Giphy.
  const direct = [...(team.gifUrls ?? []).map(tenorGif), ...(team.images ?? []).map(teamImage)];
  const handPicked = direct.length + team.giphyIds.length;
  const maxAge = handPicked === 1 ? 86400 : 3600;
  const pick = Math.floor(Math.random() * handPicked);
  const link = pick < direct.length ? direct[pick] : null;
  if (link) return json(link, 200, `public, max-age=${maxAge}`);

  const giphy = getGiphyService();
  if (!giphy) return json({ error: 'giphy-not-configured' }, 503, 'no-store');

  try {
    // Un GIF Giphy choisi à la main a été tiré : on le demande, lui (repli sur la recherche).
    const chosen = team.giphyIds[pick - direct.length];
    const giphyIds = chosen ? [chosen] : team.giphyIds;
    const gif = await giphy.gifFor(
      { ...team, giphyIds, fallback: moodOf.get(rivalry.category) },
      rejectedGifs(rivalry.id, side),
    );
    if (!gif) return json(null, 200, 'public, max-age=3600');
    return json(gif, 200, `public, max-age=${handPicked > 0 ? maxAge : 3600}`);
  } catch (error) {
    const status = error instanceof GiphyError ? error.status : 0;
    console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || 'network'})`);
    return json({ error: 'giphy-unavailable' }, 502, 'no-store');
  }
};
