/**
 * POST /api/vote  { rivalryId, team: 'a' | 'b' | 'none', category }
 *
 * - 200 { counted: true, chosenVotes, totalVotes, aVotes, bVotes, noneVotes }
 * - 200 { counted: false, reason: 'duplicate', … }   déjà voté pour cette rivalité aujourd'hui
 * - 429 { counted: false, reason, chosenVotes, totalVotes }   limite de débit atteinte
 * - 400 requête invalide · 403 autre origine ou outil automatisé · 415 pas du JSON · 413 trop gros · 503 votes désactivés
 *
 * Le client envoie le vote en arrière-plan et n'attend jamais cette réponse pour continuer.
 */
import type { APIRoute } from 'astro';
import { clientIp, getVoteService, jsonResponse, rejectWrite } from '../../server/votes/runtime';

export const prerender = false;

const MAX_BODY = 1024;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Seul le site lui-même vote (pas de formulaire posté depuis un autre domaine).
  const rejected = rejectWrite(request);
  if (rejected) return rejected;

  const service = getVoteService();
  if (!service) return jsonResponse({ error: 'votes-disabled' }, 503);

  const text = await request.text();
  if (text.length > MAX_BODY) return jsonResponse({ error: 'body-too-large' }, 413);
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    return jsonResponse({ error: 'invalid-json' }, 400);
  }

  try {
    const result = service.vote(
      body,
      clientIp(request, () => clientAddress),
    );
    return jsonResponse(result.body, result.status);
  } catch (error) {
    console.error('[api/vote]', (error as Error).message);
    return jsonResponse({ error: 'storage-error' }, 500);
  }
};
