/**
 * Logique des routes `/api/vote` et `/api/hall-of-fame`, indépendante d'Astro :
 * reçoit des données brutes, renvoie un statut HTTP et un corps JSON.
 */
import { z } from 'zod';
import { rankRivalries, type Rankings } from './ranking';
import { dayOf, hashIp } from './rate-limit';
import type { VoteStore } from './store';

export const MIXED_CATEGORY = 'mix';
/** Durée de cache du Hall of Fame (côté serveur et navigateur). */
export const HALL_TTL_MS = 60_000;

export interface ServiceResponse {
  status: number;
  body: unknown;
}

export interface HallOfFame extends Rankings {
  category: string;
  totalVotes: number;
  generatedAt: string;
}

const VoteBody = z.object({
  rivalryId: z.string().min(1).max(160),
  team: z.enum(['a', 'b']),
  category: z.string().min(1).max(60),
});

export interface VoteServiceOptions {
  store: VoteStore;
  salt: string;
  rivalries: readonly { id: string; category: string }[];
  categoryIds: readonly string[];
  now?: () => number;
}

export function createVoteService({
  store,
  salt,
  rivalries,
  categoryIds,
  now = Date.now,
}: VoteServiceOptions) {
  const categoryOf = new Map(rivalries.map((r) => [r.id, r.category]));
  const categories = new Set(categoryIds);
  const hallCache = new Map<string, { expires: number; value: HallOfFame }>();

  const isCategory = (c: string) => c === MIXED_CATEGORY || categories.has(c);

  return {
    vote(raw: unknown, ip: string): ServiceResponse {
      const parsed = VoteBody.safeParse(raw);
      if (!parsed.success) return { status: 400, body: { error: 'invalid-body' } };
      const { rivalryId, team, category } = parsed.data;
      const rivalryCategory = categoryOf.get(rivalryId);
      if (!rivalryCategory) return { status: 400, body: { error: 'unknown-rivalry' } };
      if (!isCategory(category)) return { status: 400, body: { error: 'unknown-category' } };
      if (category !== MIXED_CATEGORY && category !== rivalryCategory) {
        return { status: 400, body: { error: 'category-mismatch' } };
      }

      const nowMs = now();
      const day = dayOf(nowMs);
      const outcome = store.recordVote({
        rivalryId,
        team,
        ipHash: hashIp(ip, salt, day),
        day,
        nowMs,
      });
      // Même limité, le visiteur reçoit les chiffres de la rivalité (lecture seule, sans risque).
      return outcome.status === 'counted'
        ? { status: 200, body: { counted: true, ...outcome.pair } }
        : { status: 429, body: { counted: false, reason: outcome.reason, ...outcome.pair } };
    },

    hallOfFame(categoryParam: string | null): ServiceResponse {
      const category = categoryParam || MIXED_CATEGORY;
      if (!isCategory(category)) return { status: 400, body: { error: 'unknown-category' } };

      const nowMs = now();
      const hit = hallCache.get(category);
      if (hit && hit.expires > nowMs) return { status: 200, body: hit.value };

      const prefix = category === MIXED_CATEGORY ? null : `${category}-`;
      // Les rivalités retirées du JSON disparaissent du classement.
      const rows = store.rivalryCounts(prefix).filter((r) => categoryOf.has(r.id));
      const value: HallOfFame = {
        category,
        totalVotes: rows.reduce((sum, r) => sum + r.aVotes + r.bVotes, 0),
        ...rankRivalries(rows),
        generatedAt: new Date(nowMs).toISOString(),
      };
      hallCache.set(category, { expires: nowMs + HALL_TTL_MS, value });
      return { status: 200, body: value };
    },
  };
}

export type VoteService = ReturnType<typeof createVoteService>;
