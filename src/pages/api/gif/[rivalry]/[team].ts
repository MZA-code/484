/**
 * GET /api/gif/:rivalryId/:team → le GIF d'une team (URL MP4/WebP/image fixe).
 *
 * Priorité : GIF choisis à la main (`giphyIds`) > recherche validée par mots-clés > rien.
 *
 * Réponses :
 * - 200 { id, mp4, webp, still, width, height }
 * - 200 null : aucun GIF sûr pour cette team (le client affiche le cadre rayé avec le nom)
 * - 404 rivalité ou team inconnue
 * - 503 clé Giphy absente · 502 Giphy en erreur
 * Le client affiche le cadre rayé dans tous les cas d'erreur : le jeu ne bloque jamais.
 */
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { rivalries } from '../../../../data/content';
import { createFileCache } from '../../../../server/gif-cache';
import { createGiphyService, GiphyError, type GiphyService } from '../../../../server/giphy';

export const prerender = false;

const byId = new Map(rivalries.map((r) => [r.id, r]));

let service: GiphyService | null = null;
function getService(apiKey: string): GiphyService {
  service ??= createGiphyService({
    apiKey,
    cache: createFileCache(getSecret('GIF_CACHE_FILE') ?? 'data/gif-cache.json'),
  });
  return service;
}

const json = (body: unknown, status: number, cacheControl: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });

export const GET: APIRoute = async ({ params }) => {
  const rivalry = byId.get(params.rivalry ?? '');
  const side = params.team;
  if (!rivalry || (side !== 'a' && side !== 'b')) {
    return json({ error: 'unknown-team' }, 404, 'public, max-age=3600');
  }
  const team = rivalry[side];

  const apiKey = getSecret('GIPHY_API_KEY');
  if (!apiKey) return json({ error: 'giphy-not-configured' }, 503, 'no-store');

  try {
    const gif = await getService(apiKey).gifFor(team);
    if (!gif) return json(null, 200, 'public, max-age=3600');
    // Un GIF choisi à la main peut changer d'une visite à l'autre : cache navigateur plus court.
    const maxAge = team.giphyIds.length > 1 ? 3600 : 86400;
    return json(gif, 200, `public, max-age=${maxAge}`);
  } catch (error) {
    const status = error instanceof GiphyError ? error.status : 0;
    console.warn(`[api/gif] ${rivalry.id}/${side}: Giphy failure (${status || 'network'})`);
    return json({ error: 'giphy-unavailable' }, 502, 'no-store');
  }
};
