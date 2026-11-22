/**
 * POST /api/gif-report  { teamId: "rivalité/a", gifId }   bouton « Mauvais GIF ? »
 *
 * - 200 { counted: true }
 * - 200 { counted: false, reason: 'duplicate' }   déjà signalé aujourd'hui par ce visiteur
 * - 429 { counted: false, reason }   limite de débit atteinte (3 d'affilée, 1 par minute, 30 par jour)
 * - 400 requête invalide · 403 autre origine ou outil automatisé · 415 pas du JSON · 413 trop gros · 503 désactivé (pas de sel)
 *
 * GET /api/gif-report  (en-tête Authorization: Bearer <GIF_REPORT_TOKEN>)
 * - 200 { reports: [{ rivalryId, team, gifId, reports, lastReport }] }   pour `npm run gif-audit`
 * - 401 mauvais jeton · 404 pas de jeton configuré sur le serveur
 */
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { clientIp, getVoteService, jsonResponse, rejectWrite } from '../../server/votes/runtime';

export const prerender = false;

const MAX_BODY = 512;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const rejected = rejectWrite(request);
  if (rejected) return rejected;

  const service = getVoteService();
  if (!service) return jsonResponse({ error: 'reports-disabled' }, 503);

  const text = await request.text();
  if (text.length > MAX_BODY) return jsonResponse({ error: 'body-too-large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonResponse({ error: 'invalid-json' }, 400);
  }

  try {
    const result = service.reportGif(
      body,
      clientIp(request, () => clientAddress),
    );
    return jsonResponse(result.body, result.status);
  } catch (error) {
    console.error('[api/gif-report]', (error as Error).message);
    return jsonResponse({ error: 'storage-error' }, 500);
  }
};

export const GET: APIRoute = ({ request }) => {
  const service = getVoteService();
  if (!service) return jsonResponse({ error: 'reports-disabled' }, 503);
  const result = service.gifReports(
    request.headers.get('authorization'),
    getSecret('GIF_REPORT_TOKEN'),
  );
  return jsonResponse(result.body, result.status);
};
