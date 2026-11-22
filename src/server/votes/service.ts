/**
 * Logique des routes `/api/vote`, `/api/hall-of-fame` et `/api/gif-report`, indépendante d'Astro :
 * reçoit des données brutes, renvoie un statut HTTP et un corps JSON.
 */
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { rankRivalries, type Rankings } from './ranking';
import { dayOf, hashIp } from './rate-limit';
import type { VoteStore } from './store';

export const MIXED_CATEGORY = 'mix';
/**
 * Un GIF trouvé par la recherche est écarté (remplacé par le suivant) après ce nombre de
 * signalements. Chaque visiteur ne compte qu'une fois par jour et par GIF : il faut donc
 * au moins 3 visiteurs, ou 3 jours, pour écarter un GIF.
 */
export const GIF_REJECT_THRESHOLD = 3;

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
  team: z.enum(['a', 'b', 'none']),
  category: z.string().min(1).max(60),
});

const GifReportBody = z.object({
  /** « rivalité/a » ou « rivalité/b », comme la route /api/gif. */
  teamId: z.string().regex(/^[a-z0-9-]{1,160}\/[ab]$/),
  /** Identifiant Giphy : lettres et chiffres. */
  gifId: z.string().regex(/^[A-Za-z0-9]{1,64}$/),
});

/** Comparaison en temps constant : la durée ne trahit pas le jeton attendu. */
export function sameToken(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface VoteServiceOptions {
  store: VoteStore;
  salt: string;
  rivalries: readonly { id: string; category: string }[];
  categoryIds: readonly string[];
  /** Univers : regroupements de catégories, jouables et filtrables comme une catégorie. */
  universes?: readonly { id: string; categories: readonly string[] }[];
  now?: () => number;
}

export function createVoteService({
  store,
  salt,
  rivalries,
  categoryIds,
  universes = [],
  now = Date.now,
}: VoteServiceOptions) {
  const categoryOf = new Map(rivalries.map((r) => [r.id, r.category]));
  /** Catégories couvertes par chaque filtre possible : une catégorie, un univers, ou tout. */
  const scopes = new Map<string, ReadonlySet<string>>([
    ...categoryIds.map((c) => [c, new Set([c])] as const),
    ...universes.map((u) => [u.id, new Set(u.categories)] as const),
    [MIXED_CATEGORY, new Set(categoryIds)],
  ]);
  const hallCache = new Map<string, { expires: number; value: HallOfFame }>();

  const isCategory = (c: string) => scopes.has(c);

  return {
    vote(raw: unknown, ip: string): ServiceResponse {
      const parsed = VoteBody.safeParse(raw);
      if (!parsed.success) return { status: 400, body: { error: 'invalid-body' } };
      const { rivalryId, team, category } = parsed.data;
      const rivalryCategory = categoryOf.get(rivalryId);
      if (!rivalryCategory) return { status: 400, body: { error: 'unknown-rivalry' } };
      if (!isCategory(category)) return { status: 400, body: { error: 'unknown-category' } };
      if (!scopes.get(category)?.has(rivalryCategory)) {
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
      // Même limité ou en double, le visiteur reçoit les chiffres de la rivalité (lecture seule).
      if (outcome.status === 'counted') {
        return { status: 200, body: { counted: true, ...outcome.pair } };
      }
      if (outcome.status === 'duplicate') {
        return { status: 200, body: { counted: false, reason: 'duplicate', ...outcome.pair } };
      }
      return { status: 429, body: { counted: false, reason: outcome.reason, ...outcome.pair } };
    },

    /**
     * « Mauvais GIF ? » : un signalement de plus pour ce GIF de cette team.
     * En mode admin (`admin`), pas de limite, et le GIF est écarté tout de suite.
     */
    reportGif(raw: unknown, ip: string, admin = false): ServiceResponse {
      const parsed = GifReportBody.safeParse(raw);
      if (!parsed.success) return { status: 400, body: { error: 'invalid-body' } };
      const [rivalryId, team] = parsed.data.teamId.split('/') as [string, 'a' | 'b'];
      if (!categoryOf.has(rivalryId)) return { status: 400, body: { error: 'unknown-rivalry' } };

      const nowMs = now();
      const day = dayOf(nowMs);
      const outcome = store.recordGifReport({
        rivalryId,
        team,
        gifId: parsed.data.gifId,
        ipHash: hashIp(ip, salt, day),
        day,
        nowMs,
        ...(admin ? { trusted: { weight: GIF_REJECT_THRESHOLD } } : {}),
      });
      if (outcome.status === 'counted') {
        return { status: 200, body: admin ? { counted: true, rejected: true } : { counted: true } };
      }
      // Déjà signalé aujourd'hui : on remercie quand même, sans compter une deuxième fois.
      if (outcome.status === 'duplicate') {
        return { status: 200, body: { counted: false, reason: 'duplicate' } };
      }
      return { status: 429, body: { counted: false, reason: outcome.reason } };
    },

    /** GIF de cette team écartés par les signalements (à remplacer par le suivant). */
    rejectedGifs(rivalryId: string, team: 'a' | 'b'): Set<string> {
      if (!categoryOf.has(rivalryId)) return new Set();
      return new Set(store.reportedGifIds(rivalryId, team, GIF_REJECT_THRESHOLD));
    },

    /**
     * Liste des signalements pour `npm run gif-audit`, protégée par un jeton.
     * Sans jeton configuré côté serveur, la liste n'existe pas (404).
     */
    gifReports(authorization: string | null, token: string | undefined): ServiceResponse {
      if (!token) return { status: 404, body: { error: 'not-found' } };
      const given = authorization?.replace(/^Bearer\s+/i, '') ?? '';
      if (!sameToken(given, token)) return { status: 401, body: { error: 'unauthorized' } };
      // Les rivalités retirées du JSON n'intéressent plus personne.
      const reports = store.gifReports().filter((r) => categoryOf.has(r.rivalryId));
      return { status: 200, body: { reports } };
    },

    hallOfFame(categoryParam: string | null): ServiceResponse {
      const category = categoryParam || MIXED_CATEGORY;
      if (!isCategory(category)) return { status: 400, body: { error: 'unknown-category' } };

      const nowMs = now();
      const hit = hallCache.get(category);
      if (hit && hit.expires > nowMs) return { status: 200, body: hit.value };

      // Les rivalités retirées du JSON disparaissent du classement.
      const scope = scopes.get(category) as ReadonlySet<string>;
      const rows = store.rivalryCounts(null).filter((r) => {
        const rivalryCategory = categoryOf.get(r.id);
        return rivalryCategory !== undefined && scope.has(rivalryCategory);
      });
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
