/**
 * Anti-abus sans cookie.
 *
 * L'IP n'est jamais stockée en clair : on garde une empreinte SHA-256 de (sel secret + jour + IP).
 * Comme le jour entre dans l'empreinte, deux journées d'un même visiteur ne peuvent pas être reliées.
 *
 * Limites : en moyenne 1 vote par seconde (seau de jetons, petites rafales tolérées pour
 * un joueur rapide au clavier) et 2 000 votes par jour.
 */
import { createHash } from 'node:crypto';

export const RATE = {
  /** Rafale maximale : quelques votes rapprochés restent comptés. */
  burst: 5,
  /** Un jeton regagné par seconde, soit 1 vote par seconde en moyenne. */
  refillPerMs: 1 / 1000,
  daily: 2000,
} as const;

/** Jour UTC « AAAA-MM-JJ ». */
export function dayOf(nowMs: number): string {
  return new Date(nowMs).toISOString().slice(0, 10);
}

export function hashIp(ip: string, salt: string, day: string): string {
  return createHash('sha256').update(`${salt}|${day}|${ip}`).digest('hex').slice(0, 32);
}

export interface Bucket {
  tokens: number;
  updatedMs: number;
  count: number;
}

export type TakeResult =
  { allowed: true; next: Bucket } | { allowed: false; reason: 'burst' | 'daily'; next: Bucket };

/** Consomme un jeton si possible. `prev` absent = premier vote de la journée. */
export function takeToken(prev: Bucket | undefined, nowMs: number): TakeResult {
  const elapsed = prev ? Math.max(0, nowMs - prev.updatedMs) : 0;
  const tokens = prev ? Math.min(RATE.burst, prev.tokens + elapsed * RATE.refillPerMs) : RATE.burst;
  const count = prev?.count ?? 0;
  if (count >= RATE.daily) {
    return { allowed: false, reason: 'daily', next: { tokens, updatedMs: nowMs, count } };
  }
  if (tokens < 1) {
    return { allowed: false, reason: 'burst', next: { tokens, updatedMs: nowMs, count } };
  }
  return { allowed: true, next: { tokens: tokens - 1, updatedMs: nowMs, count: count + 1 } };
}
