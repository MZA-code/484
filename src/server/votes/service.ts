/**
 * Logique des routes `/api/vote` et `/api/hall-of-fame`, indépendante d'Astro :
 * reçoit des données brutes, renvoie un statut HTTP et un corps JSON.
 */
import { z } from 'zod';
import { closestDuels, rankContenders, type CloseDuel, type RankedContender } from './ranking';
import { dayOf, hashIp } from './rate-limit';
import type { VoteStore } from './store';

export const MIXED_THEME = 'mix';
/** Durée de cache du Hall of Fame (côté serveur et navigateur). */
export const HALL_TTL_MS = 60_000;

export interface ServiceResponse {
  status: number;
  body: unknown;
}

export interface HallOfFame {
  theme: string;
  totalVotes: number;
  top: RankedContender[];
  flop: RankedContender[];
  close: CloseDuel[];
  generatedAt: string;
}

const VoteBody = z.object({
  winnerId: z.string().min(1).max(120),
  loserId: z.string().min(1).max(120),
  theme: z.string().min(1).max(60),
});

export interface VoteServiceOptions {
  store: VoteStore;
  salt: string;
  contenders: readonly { id: string; theme: string }[];
  themeIds: readonly string[];
  now?: () => number;
}

export function createVoteService({
  store,
  salt,
  contenders,
  themeIds,
  now = Date.now,
}: VoteServiceOptions) {
  const themeOf = new Map(contenders.map((c) => [c.id, c.theme]));
  const themes = new Set(themeIds);
  const hallCache = new Map<string, { expires: number; value: HallOfFame }>();

  const isTheme = (theme: string) => theme === MIXED_THEME || themes.has(theme);

  return {
    vote(raw: unknown, ip: string): ServiceResponse {
      const parsed = VoteBody.safeParse(raw);
      if (!parsed.success) return { status: 400, body: { error: 'invalid-body' } };
      const { winnerId, loserId, theme } = parsed.data;
      const winnerTheme = themeOf.get(winnerId);
      const loserTheme = themeOf.get(loserId);
      if (!winnerTheme || !loserTheme) return { status: 400, body: { error: 'unknown-contender' } };
      if (winnerId === loserId) return { status: 400, body: { error: 'same-contender' } };
      if (!isTheme(theme)) return { status: 400, body: { error: 'unknown-theme' } };
      if (theme !== MIXED_THEME && (winnerTheme !== theme || loserTheme !== theme)) {
        return { status: 400, body: { error: 'theme-mismatch' } };
      }

      const nowMs = now();
      const day = dayOf(nowMs);
      const outcome = store.recordVote({
        winnerId,
        loserId,
        ipHash: hashIp(ip, salt, day),
        day,
        nowMs,
      });
      // Même limité, le visiteur reçoit les chiffres de la paire (lecture seule, sans risque).
      return outcome.status === 'counted'
        ? { status: 200, body: { counted: true, ...outcome.pair } }
        : { status: 429, body: { counted: false, reason: outcome.reason, ...outcome.pair } };
    },

    hallOfFame(themeParam: string | null): ServiceResponse {
      const theme = themeParam || MIXED_THEME;
      if (!isTheme(theme)) return { status: 400, body: { error: 'unknown-theme' } };

      const nowMs = now();
      const hit = hallCache.get(theme);
      if (hit && hit.expires > nowMs) return { status: 200, body: hit.value };

      const prefix = theme === MIXED_THEME ? null : `${theme}-`;
      // Les prétendants retirés du JSON disparaissent du classement.
      const rows = store.contenderCounts(prefix).filter((r) => themeOf.has(r.id));
      const pairs = store
        .pairCounts(prefix, 1)
        .filter((p) => themeOf.has(p.aId) && themeOf.has(p.bId));
      const value: HallOfFame = {
        theme,
        totalVotes: rows.reduce((sum, r) => sum + r.wins, 0),
        ...rankContenders(rows),
        close: closestDuels(pairs),
        generatedAt: new Date(nowMs).toISOString(),
      };
      hallCache.set(theme, { expires: nowMs + HALL_TTL_MS, value });
      return { status: 200, body: value };
    },
  };
}

export type VoteService = ReturnType<typeof createVoteService>;
