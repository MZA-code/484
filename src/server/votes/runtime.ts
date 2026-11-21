/**
 * Instance unique du service de votes pour le serveur Astro (créée au premier appel).
 * Les secrets viennent de `astro:env` : fichier .env en local, variables d'environnement en production.
 */
import { getSecret } from 'astro:env/server';
import { contenders, themes } from '../../data/content';
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
    contenders,
    themeIds: themes.map((t) => t.id),
  });
  return service;
}

/**
 * Adresse du visiteur. Derrière un proxy (hébergement mutualisé), l'adresse directe est celle
 * du proxy : avec TRUST_PROXY=true, on lit la première adresse de X-Forwarded-For.
 */
export function clientIp(request: Request, clientAddress: () => string): string {
  if (getSecret('TRUST_PROXY') === 'true') {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    if (forwarded) return forwarded;
  }
  try {
    return clientAddress();
  } catch {
    return 'unknown';
  }
}

/**
 * Le vote vient-il du site lui-même ? Sans en-tête Origin (ancien navigateur, outil), on laisse
 * passer : la limite de débit s'applique de toute façon. On compare à l'hôte demandé par le
 * navigateur (Host, ou X-Forwarded-Host derrière un proxy), pas à l'URL interne du serveur.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host =
    request.headers.get('x-forwarded-host') ??
    request.headers.get('host') ??
    new URL(request.url).host;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export const jsonResponse = (body: unknown, status: number, cacheControl = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': cacheControl },
  });
