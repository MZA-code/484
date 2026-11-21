/**
 * Envoi d'un vote à l'API mondiale, en arrière-plan.
 *
 * L'interface n'attend jamais le réseau pour afficher le duel suivant. Si la réponse arrive
 * en moins de `DISPLAY_TIMEOUT_MS`, on affiche le pourcentage. Sinon, ou si l'API est muette,
 * on renvoie null (remarque neutre). La requête, elle, continue sa route (`keepalive`).
 */
import type { PairResult } from '../../engine';

export const DISPLAY_TIMEOUT_MS = 1500;

export interface VotePayload {
  winnerId: string;
  loserId: string;
  theme: string;
}

const isCount = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0;

/** Lit la réponse de l'API ; 429 (limite atteinte) renvoie aussi les chiffres de la paire. */
export async function readPairResult(response: Response): Promise<PairResult | null> {
  if (response.status !== 200 && response.status !== 429) return null;
  const body = (await response.json()) as { chosenVotes?: unknown; totalVotes?: unknown };
  if (!isCount(body.chosenVotes) || !isCount(body.totalVotes)) return null;
  if (body.chosenVotes > body.totalVotes) return null;
  return { chosenVotes: body.chosenVotes, totalVotes: body.totalVotes };
}

export function sendVote(
  payload: VotePayload,
  doFetch: typeof fetch = fetch,
  timeoutMs = DISPLAY_TIMEOUT_MS,
): Promise<PairResult | null> {
  const request = doFetch('/api/vote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(readPairResult)
    .catch(() => null);
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
  return Promise.race([request, timeout]);
}
