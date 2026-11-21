/**
 * Persistance locale de la partie. Tout accès au stockage est protégé :
 * si `localStorage` est absent, plein ou interdit, le jeu continue en mémoire.
 *
 * Un état relu est toujours vérifié et assaini contre le catalogue courant
 * (un prétendant retiré du JSON ne doit pas casser une partie en cours).
 */
import { z } from 'zod';
import { isKnownTheme, MIXED_THEME, poolFor } from './catalog';
import {
  createGame,
  RETIREMENT_STREAK,
  STATE_VERSION,
  type GameContext,
  type GameState,
} from './game';

export const STORAGE_KEY = '484:game';

/** Le sous-ensemble de `Storage` dont on a besoin. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorage(): KeyValueStorage {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

/**
 * Renvoie le stockage du navigateur s'il fonctionne vraiment (test d'écriture),
 * sinon un stockage en mémoire. Ne lève jamais d'exception.
 */
export function resolveStorage(getStorage: () => KeyValueStorage | undefined): KeyValueStorage {
  try {
    const storage = getStorage();
    if (storage) {
      const probe = `${STORAGE_KEY}:probe`;
      storage.setItem(probe, '1');
      storage.removeItem(probe);
      return storage;
    }
  } catch {
    // Navigation privée, cookies bloqués, quota dépassé… on passe en mémoire.
  }
  return createMemoryStorage();
}

const count = z.number().int().nonnegative();

const StoredStateSchema = z.object({
  version: z.literal(STATE_VERSION),
  theme: z.string(),
  queue: z.array(z.string()),
  left: z.string(),
  right: z.string(),
  champion: z.string().nullable(),
  streak: count,
  duelCount: count,
  wins: z.record(z.string(), count),
  retiredCount: count,
  bestStreak: z.object({ contenderId: z.string(), length: count }).nullable(),
  lastQuipKey: z.string().nullable(),
});

/**
 * Transforme une valeur inconnue (lue du stockage) en état valide, ou null.
 * Les compteurs et records sont gardés ; le duel en cours est refait s'il n'est plus valide.
 */
export function restoreState(raw: unknown, ctx: GameContext): GameState | null {
  const parsed = StoredStateSchema.safeParse(raw);
  if (!parsed.success) return null;
  const stored = parsed.data;
  if (!isKnownTheme(ctx.catalog, stored.theme)) return null;

  const pool = poolFor(ctx.catalog, stored.theme);
  const inPool = new Set(pool);
  const allIds = new Set(poolFor(ctx.catalog, MIXED_THEME));

  const wins = Object.fromEntries(Object.entries(stored.wins).filter(([id]) => allIds.has(id)));
  const bestStreak =
    stored.bestStreak && allIds.has(stored.bestStreak.contenderId) ? stored.bestStreak : null;
  const kept = {
    duelCount: stored.duelCount,
    wins,
    retiredCount: stored.retiredCount,
    bestStreak,
    lastQuipKey: stored.lastQuipKey,
  };

  const duelIsValid =
    inPool.has(stored.left) && inPool.has(stored.right) && stored.left !== stored.right;
  if (!duelIsValid) {
    return { ...createGame(ctx, stored.theme), ...kept };
  }

  const championOnScreen =
    stored.champion !== null && [stored.left, stored.right].includes(stored.champion);
  const streak = championOnScreen ? Math.min(stored.streak, RETIREMENT_STREAK - 1) : 0;
  const queue = [...new Set(stored.queue)].filter(
    (id) => inPool.has(id) && id !== stored.left && id !== stored.right,
  );

  return {
    version: STATE_VERSION,
    theme: stored.theme,
    queue,
    left: stored.left,
    right: stored.right,
    champion: championOnScreen ? stored.champion : null,
    streak,
    ...kept,
  };
}

export function loadState(storage: KeyValueStorage, ctx: GameContext): GameState | null {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw === null ? null : restoreState(JSON.parse(raw), ctx);
  } catch {
    return null;
  }
}

/** Enregistre l'état. Renvoie false si le stockage a refusé (quota, accès interdit…). */
export function saveState(storage: KeyValueStorage, state: GameState): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}
