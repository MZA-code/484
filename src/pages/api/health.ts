import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { sameToken } from '../../server/votes/service';
import { ipDiagnostic, jsonResponse } from '../../server/votes/runtime';

// Route serveur (non pré-rendue) : vérifie que la partie API répond.
export const prerender = false;

/**
 * GET /api/health → { status, time }
 * GET /api/health?ip avec « Authorization: Bearer <GIF_REPORT_TOKEN> » → en plus, l'adresse IP
 * reçue et celle retenue pour la limite de débit (diagnostic du proxy de l'hébergeur).
 */
export const GET: APIRoute = ({ request, url, clientAddress }) => {
  const body: Record<string, unknown> = { status: 'ok', time: new Date().toISOString() };
  const token = getSecret('GIF_REPORT_TOKEN');
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (url.searchParams.has('ip') && token && sameToken(given, token)) {
    body.ip = ipDiagnostic(request, () => clientAddress);
  }
  return jsonResponse(body, 200);
};
