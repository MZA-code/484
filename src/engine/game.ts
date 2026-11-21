/**
 * Moteur du jeu : fonctions pures qui prennent un état et renvoient le suivant.
 * Aucune dépendance à l'interface, au réseau ni au stockage.
 *
 * Règles (voir le brief, section 4) :
 * - tirage sans remise dans une file mélangée, remélangée quand elle est vide ;
 * - le gagnant garde sa place, un challenger remplace le perdant ;
 * - série : +1 si le gagnant était déjà tenant du titre, sinon il le devient avec 1 ;
 * - à 10 victoires d'affilée, retraite invaincue et deux nouveaux prétendants ;
 * - passer un duel ou changer de thème remet la série à zéro, mais garde
 *   le compteur de duels, les victoires et les records.
 */
import { poolFor, type Catalog } from './catalog';
import { pickQuip, quipCategory, type QuipBook, type ShareOutcome } from './quips';
import { shuffle, type Rng } from './random';

export const RETIREMENT_STREAK = 10;
export const STATE_VERSION = 1;

export type Side = 'left' | 'right';

export interface BestStreak {
  contenderId: string;
  length: number;
}

export interface GameState {
  version: typeof STATE_VERSION;
  theme: string;
  /** File de tirage restante pour le thème courant. */
  queue: string[];
  left: string;
  right: string;
  /** Tenant du titre (gagnant du dernier duel), ou null après un passage / une retraite. */
  champion: string | null;
  streak: number;
  /** Nombre de votes depuis le début de la visite. */
  duelCount: number;
  /** Victoires de chaque prétendant pendant la visite. */
  wins: Record<string, number>;
  retiredCount: number;
  bestStreak: BestStreak | null;
  lastQuipKey: string | null;
}

export interface GameContext {
  catalog: Catalog;
  rng: Rng;
  /** Paliers du compteur de duels (10, 25, 50…). */
  milestones: readonly number[];
}

export type GameEvent =
  | { type: 'voted'; winnerId: string; loserId: string; theme: string; streak: number }
  | { type: 'retired'; contenderId: string; streak: number }
  | { type: 'milestone'; count: number };

export interface Transition {
  state: GameState;
  events: GameEvent[];
}

// ─── Tirage ─────────────────────────────────────────────────────────────────

interface Draw {
  id: string;
  queue: string[];
}

/**
 * Prend le premier prétendant de la file qui n'est pas exclu (déjà à l'écran).
 * Si la file n'en contient aucun, on la remélange entièrement.
 */
function drawOne(
  queue: readonly string[],
  pool: readonly string[],
  exclude: ReadonlySet<string>,
  rng: Rng,
): Draw {
  let source = queue;
  let index = source.findIndex((id) => !exclude.has(id));
  if (index === -1) {
    source = shuffle(pool, rng);
    index = source.findIndex((id) => !exclude.has(id));
  }
  if (index === -1) throw new Error('Not enough contenders to draw from');
  return { id: source[index] as string, queue: source.filter((_, i) => i !== index) };
}

/**
 * Exclusions « souples » : on évite ces prétendants tant qu'il en reste assez
 * dans la réserve pour tirer `needed` autres. Évite par exemple de revoir
 * aussitôt le perdant, sans bloquer les très petits thèmes.
 */
function softExclude(
  poolSize: number,
  hard: readonly string[],
  soft: readonly string[],
  needed: number,
): Set<string> {
  const exclude = new Set(hard);
  for (const id of soft) {
    if (poolSize - (exclude.size + 1) >= needed) exclude.add(id);
  }
  return exclude;
}

function drawPair(
  queue: readonly string[],
  pool: readonly string[],
  avoid: readonly string[],
  rng: Rng,
): { left: string; right: string; queue: string[] } {
  const exclude = softExclude(pool.length, [], avoid, 2);
  const first = drawOne(queue, pool, exclude, rng);
  const second = drawOne(first.queue, pool, new Set([...exclude, first.id]), rng);
  return { left: first.id, right: second.id, queue: second.queue };
}

// ─── Actions ────────────────────────────────────────────────────────────────

export function createGame(ctx: GameContext, theme: string): GameState {
  const pool = poolFor(ctx.catalog, theme);
  const pair = drawPair(shuffle(pool, ctx.rng), pool, [], ctx.rng);
  return {
    version: STATE_VERSION,
    theme,
    queue: pair.queue,
    left: pair.left,
    right: pair.right,
    champion: null,
    streak: 0,
    duelCount: 0,
    wins: {},
    retiredCount: 0,
    bestStreak: null,
    lastQuipKey: null,
  };
}

export function vote(state: GameState, side: Side, ctx: GameContext): Transition {
  const pool = poolFor(ctx.catalog, state.theme);
  const winnerId = side === 'left' ? state.left : state.right;
  const loserId = side === 'left' ? state.right : state.left;

  const streak = state.champion === winnerId ? state.streak + 1 : 1;
  const duelCount = state.duelCount + 1;
  const best =
    !state.bestStreak || streak > state.bestStreak.length
      ? { contenderId: winnerId, length: streak }
      : state.bestStreak;

  const base: GameState = {
    ...state,
    duelCount,
    wins: { ...state.wins, [winnerId]: (state.wins[winnerId] ?? 0) + 1 },
    bestStreak: best,
  };
  const events: GameEvent[] = [{ type: 'voted', winnerId, loserId, theme: state.theme, streak }];

  let next: GameState;
  if (streak >= RETIREMENT_STREAK) {
    // Retraite invaincue : deux nouveaux prétendants, la série repart de zéro.
    const pair = drawPair(state.queue, pool, [winnerId, loserId], ctx.rng);
    next = {
      ...base,
      ...pair,
      champion: null,
      streak: 0,
      retiredCount: state.retiredCount + 1,
    };
    events.push({ type: 'retired', contenderId: winnerId, streak });
  } else {
    // Le gagnant reste à sa place, un challenger remplace le perdant.
    const exclude = softExclude(pool.length, [winnerId], [loserId], 1);
    const challenger = drawOne(state.queue, pool, exclude, ctx.rng);
    next = {
      ...base,
      queue: challenger.queue,
      left: side === 'left' ? winnerId : challenger.id,
      right: side === 'right' ? winnerId : challenger.id,
      champion: winnerId,
      streak,
    };
  }

  if (ctx.milestones.includes(duelCount)) events.push({ type: 'milestone', count: duelCount });
  return { state: next, events };
}

/** « Je ne connais aucun des deux » : deux nouveaux prétendants, série remise à zéro. */
export function skipDuel(state: GameState, ctx: GameContext): GameState {
  const pool = poolFor(ctx.catalog, state.theme);
  const pair = drawPair(state.queue, pool, [state.left, state.right], ctx.rng);
  return { ...state, ...pair, champion: null, streak: 0 };
}

/** Change de thème : nouvelle file, nouveau duel, série remise à zéro, le reste est gardé. */
export function changeTheme(state: GameState, theme: string, ctx: GameContext): GameState {
  if (theme === state.theme) return state;
  const pool = poolFor(ctx.catalog, theme);
  const pair = drawPair(shuffle(pool, ctx.rng), pool, [state.left, state.right], ctx.rng);
  return { ...state, ...pair, theme, champion: null, streak: 0 };
}

/** Tire la remarque à afficher après un vote et mémorise-la pour ne pas la répéter. */
export function nextQuip(
  state: GameState,
  book: QuipBook,
  outcome: ShareOutcome,
  rng: Rng,
): { state: GameState; text: string } {
  const quip = pickQuip(book, quipCategory(outcome), state.lastQuipKey, rng);
  return { state: { ...state, lastQuipKey: quip.key }, text: quip.text };
}

// ─── Lectures ───────────────────────────────────────────────────────────────

/** Numéro du duel affiché (« Duel n° X »). */
export function duelNumber(state: GameState): number {
  return state.duelCount + 1;
}

/** Côté du tenant du titre, s'il est à l'écran. */
export function championSide(state: GameState): Side | null {
  if (!state.champion) return null;
  if (state.champion === state.left) return 'left';
  if (state.champion === state.right) return 'right';
  return null;
}

/** « Ton top 5 » : les prétendants classés par victoires pendant la visite. */
export function topContenders(
  state: GameState,
  limit = 5,
): { contenderId: string; wins: number }[] {
  return Object.entries(state.wins)
    .map(([contenderId, wins]) => ({ contenderId, wins }))
    .sort((a, b) => b.wins - a.wins || a.contenderId.localeCompare(b.contenderId))
    .slice(0, limit);
}

export interface Records {
  bestStreak: BestStreak | null;
  retiredCount: number;
  poolSize: number;
}

export function records(state: GameState, ctx: GameContext): Records {
  return {
    bestStreak: state.bestStreak,
    retiredCount: state.retiredCount,
    poolSize: poolFor(ctx.catalog, state.theme).length,
  };
}
