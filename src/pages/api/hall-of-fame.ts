/**
 * GET /api/hall-of-fame?theme=<id>  (sans thème ou « mix » : tous les thèmes)
 * Classement mondial : top 20, flop 5, duels les plus serrés. Mis en cache 60 s.
 */
import type { APIRoute } from 'astro';
import { HALL_TTL_MS } from '../../server/votes/service';
import { getVoteService, jsonResponse } from '../../server/votes/runtime';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  const service = getVoteService();
  if (!service) return jsonResponse({ error: 'votes-disabled' }, 503);
  try {
    const result = service.hallOfFame(url.searchParams.get('theme'));
    const cache = result.status === 200 ? `public, max-age=${HALL_TTL_MS / 1000}` : 'no-store';
    return jsonResponse(result.body, result.status, cache);
  } catch (error) {
    console.error('[api/hall-of-fame]', (error as Error).message);
    return jsonResponse({ error: 'storage-error' }, 500);
  }
};
