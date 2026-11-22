/**
 * Instance unique du service de votes pour le serveur Astro (créée au premier appel).
 * Les secrets viennent de `astro:env` : fichier .env en local, variables d'environnement en production.
 */
import { getSecret } from 'astro:env/server';
import { categories, rivalries, universes } from '../../data/content';
import { checkWriteRequest, pickClientIp, trustedHops } from './guard';
import { createVoteService, type VoteService } from './service';
import { openSqliteStore } from './store';

let service: VoteService | null | undefined;

/** null si le sel n'est pas configuré : les votes sont alors désactivés (le jeu continue). */
export function getVoteService(): VoteService | null {
  if (service !== undefined) return service;
  const salt = getSecret('VOTE_HASH_SALT');
  if (!salt) {
    console.warn('[votes] VOTE_HASH_SALT is missing: global votes are disabled.');
    service = null;
    return service;
  }
  service = createVoteService({
    store: openSqliteStore(getSecret('VOTES_DB_FILE') ?? 'data/votes.sqlite'),
    salt,
    rivalries,
    categoryIds: categories.map((c) => c.id),
    universes,
  });
  return service;
}

/** Adresse directe de la connexion (le proxy, derrière un hébergement mutualisé). */
function directAddress(clientAddress: () => string): string {
  try {
    return clientAddress();
  } catch {
    return 'unknown';
  }
}

/**
 * Adresse du visiteur. Derrière un proxy (hébergement mutualisé), l'adresse directe est celle
 * du proxy : avec TRUST_PROXY=true, on lit X-Forwarded-For, en partant de la droite (voir guard.ts).
 */
export function clientIp(request: Request, clientAddress: () => string): string {
  return pickClientIp(
    request.headers.get('x-forwarded-for'),
    directAddress(clientAddress),
    trustedHops(getSecret('TRUST_PROXY')),
  );
}

/** Filtre anti-abus des routes qui écrivent : null si la requête passe, sinon la réponse de refus. */
export function rejectWrite(request: Request): Response | null {
  const rejection = checkWriteRequest(request.headers, request.url);
  return rejection ? jsonResponse({ error: rejection.error }, rejection.status) : null;
}

/**
 * Diagnostic de l'adresse IP (GET /api/health?ip avec le jeton GIF_REPORT_TOKEN) : montre ce que
 * le serveur reçoit et l'adresse qu'il retient, pour vérifier que X-Forwarded-For est bien lu.
 */
export function ipDiagnostic(request: Request, clientAddress: () => string) {
  return {
    direct: directAddress(clientAddress),
    forwardedFor: request.headers.get('x-forwarded-for'),
    trustProxy: getSecret('TRUST_PROXY') ?? null,
    chosen: clientIp(request, clientAddress),
  };
}

export const jsonResponse = (body: unknown, status: number, cacheControl = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
