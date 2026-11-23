/**
 * Moteur des débats « Team X ou Team Y ? » : fonctions pures, sans interface ni réseau.
 *
 * Règles :
 * - chaque catégorie est une liste de rivalités ; « Tout mélangé » est l'union de toutes ;
 * - on tire dans une file mélangée (Fisher-Yates) sans remise ;
 * - une rivalité tranchée (vote) ou passée ne revient jamais : quand il n'en reste plus dans
 *   la catégorie, elle est terminée (`current` vaut null) et seul « Rejouer » la rouvre ;
 * - jamais deux fois la même rivalité d'affilée ;
 * - voter compte un débat tranché ; passer ou changer de catégorie ne compte pas,
 *   et garde le compteur, l'historique et le profil ;
 * - quand le pourcentage mondial arrive, il alimente le profil du visiteur :
 *   d'accord avec la majorité (plus de 50 %), ou choix rebelle (moins de 40 %) ;
 * - l'état garde aussi de quoi calculer les achievements (achievements.ts) : catégories
 *   jouées et meilleure série d'accords avec la majorité.
 */
import { z } from 'zod';
import { pickQuip, quipCategory, type QuipBook, type ShareOutcome } from './quips';
import { shuffle, type Rng } from './random';

/** Identifiant réservé au mode « Tout mélangé » (union de toutes les catégories). */
export const MIXED_CATEGORY = 'mix';
export const DEBATE_STATE_VERSION = 1;
/** Nombre de choix gardés dans l'historique (« Tes teams »). */
export const HISTORY_SIZE = 30;
/** En dessous de ce pourcentage, un choix est « rebelle » (même seuil que les remarques « low »). */
export const REBEL_BELOW = 40;

export type Team = 'a' | 'b';
/** Choix d'un vote : une des deux teams, « aucun des deux » ou « les deux » (comptent comme un débat tranché). */
export type Choice = Team | 'none' | 'both';

export interface CatalogUniverse {
  id: string;
  categories: readonly string[];
}

export interface DebateCatalog {
  /** « Tout mélangé » d'abord, puis les catégories dans l'ordre du fichier. */
  readonly categoryIds: readonly string[];
  /** Univers : chacun regroupe plusieurs catégories et se joue comme une seule. */
  readonly universes: readonly CatalogUniverse[];
  /** Rivalités jouables pour chaque catégorie, chaque univers, et « mix » (toutes). */
  readonly pools: ReadonlyMap<string, readonly string[]>;
}

export function createDebateCatalog(
  categoryIds: readonly string[],
  rivalries: readonly { id: string; category: string }[],
  universes: readonly CatalogUniverse[] = [],
): DebateCatalog {
  const pools = new Map<string, string[]>(categoryIds.map((id) => [id, []]));
  for (const r of rivalries) pools.get(r.category)?.push(r.id);
  for (const universe of universes) {
    pools.set(
      universe.id,
      universe.categories.flatMap((c) => pools.get(c) ?? []),
    );
  }
  pools.set(
    MIXED_CATEGORY,
    rivalries.map((r) => r.id),
  );
  return { categoryIds: [MIXED_CATEGORY, ...categoryIds], universes, pools };
}

/** Univers d'une catégorie (ou l'univers lui-même), pour savoir quels onglets afficher. */
export function universeOf(catalog: DebateCatalog, id: string): CatalogUniverse | undefined {
  return catalog.universes.find((u) => u.id === id || u.categories.includes(id));
}

function poolOf(catalog: DebateCatalog, category: string): readonly string[] {
  const pool = catalog.pools.get(category);
  if (!pool || pool.length === 0) throw new Error(`Unknown or empty category: ${category}`);
  return pool;
}

export interface Verdict {
  rivalryId: string;
  team: Choice;
  /** Part des visiteurs du même avis, quand l'API l'a donnée. */
  percent: number | null;
}

export interface DebateState {
  version: typeof DEBATE_STATE_VERSION;
  category: string;
  queue: string[];
  /** Rivalité affichée ; null quand la catégorie est terminée (plus rien à trancher). */
  current: string | null;
  /** Rivalités tranchées ou passées : elles ne reviennent plus (sauf « Rejouer »). */
  done: string[];
  /** Débats tranchés (votes) depuis le début. */
  count: number;
  /** Choix les plus récents d'abord. */
  history: Verdict[];
  /** Votes dont on connaît le pourcentage, dont ceux d'accord avec la majorité, et les rebelles. */
  measured: number;
  agreed: number;
  rebels: number;
  /** Catégories où au moins un débat a été tranché (achievements « Explorateur »). */
  categories: string[];
  /** Accords d'affilée avec la majorité : série en cours, et la meilleure. */
  streak: number;
  bestStreak: number;
  lastQuipKey: string | null;
}

export interface DebateContext {
  catalog: DebateCatalog;
  rng: Rng;
}

export type DebateEvent = { type: 'voted'; rivalryId: string; team: Choice; category: string };

// ─── Tirage ─────────────────────────────────────────────────────────────────

/**
 * Prochaine rivalité de la file, parmi celles qui ne sont pas dans `done`, jamais `avoid` si
 * on peut faire autrement. `id` vaut null quand il ne reste plus rien : catégorie terminée.
 */
function drawNext(
  queue: readonly string[],
  pool: readonly string[],
  done: ReadonlySet<string>,
  avoid: string | null,
  rng: Rng,
): { id: string | null; queue: string[] } {
  const open = (ids: readonly string[]) => ids.filter((id) => !done.has(id));
  let source = open(queue);
  if (source.length === 0) source = shuffle(open(pool), rng);
  let index = source.findIndex((id) => id !== avoid);
  if (index === -1 && source.length > 0) {
    // La file ne contient plus que `avoid` : on remélange ce qui reste à trancher.
    source = shuffle(open(pool), rng);
    index = source.findIndex((id) => id !== avoid);
    if (index === -1) index = 0; // il ne reste que `avoid` : répétition inévitable
  }
  if (index === -1) return { id: null, queue: [] };
  return { id: source[index] as string, queue: source.filter((_, i) => i !== index) };
}

/** `done` avec une rivalité de plus (sans doublon). */
function withDone(done: readonly string[], id: string): string[] {
  return done.includes(id) ? [...done] : [...done, id];
}

// ─── Actions ────────────────────────────────────────────────────────────────

export function createDebate(ctx: DebateContext, category: string): DebateState {
  const pool = poolOf(ctx.catalog, category);
  const first = drawNext(shuffle(pool, ctx.rng), pool, new Set(), null, ctx.rng);
  return {
    version: DEBATE_STATE_VERSION,
    category,
    queue: first.queue,
    current: first.id,
    done: [],
    count: 0,
    history: [],
    measured: 0,
    agreed: 0,
    rebels: 0,
    categories: [],
    streak: 0,
    bestStreak: 0,
    lastQuipKey: null,
  };
}

export function vote(
  state: DebateState,
  team: Choice,
  ctx: DebateContext,
): { state: DebateState; events: DebateEvent[] } {
  const rivalryId = state.current;
  if (rivalryId === null) return { state, events: [] };
  const pool = poolOf(ctx.catalog, state.category);
  const done = withDone(state.done, rivalryId);
  const next = drawNext(state.queue, pool, new Set(done), rivalryId, ctx.rng);
  const count = state.count + 1;
  const events: DebateEvent[] = [{ type: 'voted', rivalryId, team, category: state.category }];
  const played = categoryOfRivalry(ctx.catalog, rivalryId);
  const categories =
    played && !state.categories.includes(played) ? [...state.categories, played] : state.categories;
  return {
    state: {
      ...state,
      queue: next.queue,
      current: next.id,
      done,
      count,
      categories,
      history: [{ rivalryId, team, percent: null }, ...state.history].slice(0, HISTORY_SIZE),
    },
    events,
  };
}

/** « Passer » : rivalité suivante, sans compter de débat ; la rivalité passée ne revient plus. */
export function skip(state: DebateState, ctx: DebateContext): DebateState {
  if (state.current === null) return state;
  const pool = poolOf(ctx.catalog, state.category);
  const done = withDone(state.done, state.current);
  const next = drawNext(state.queue, pool, new Set(done), state.current, ctx.rng);
  return { ...state, queue: next.queue, current: next.id, done };
}

/**
 * « Rejouer cette catégorie » : ses rivalités tranchées ou passées redeviennent disponibles.
 * Le compteur, l'historique et le profil sont gardés.
 */
export function replayCategory(state: DebateState, ctx: DebateContext): DebateState {
  const pool = poolOf(ctx.catalog, state.category);
  const inPool = new Set(pool);
  const done = state.done.filter((id) => !inPool.has(id));
  const next = drawNext(shuffle(pool, ctx.rng), pool, new Set(done), state.current, ctx.rng);
  return { ...state, queue: next.queue, current: next.id, done };
}

/** Rivalités qui restent à trancher dans une catégorie (ou un univers, ou « Tout mélangé »). */
export function remainingIn(state: DebateState, catalog: DebateCatalog, category: string): number {
  const done = new Set(state.done);
  return (catalog.pools.get(category) ?? []).filter((id) => !done.has(id)).length;
}

/** Change de catégorie : nouvelle file, le compteur, l'historique et le profil sont gardés. */
export function changeCategory(
  state: DebateState,
  category: string,
  ctx: DebateContext,
): DebateState {
  if (category === state.category) return state;
  const pool = poolOf(ctx.catalog, category);
  const next = drawNext(shuffle(pool, ctx.rng), pool, new Set(state.done), state.current, ctx.rng);
  return { ...state, category, queue: next.queue, current: next.id };
}

/** Catégorie d'une rivalité (hors « Tout mélangé » et univers). */
export function categoryOfRivalry(catalog: DebateCatalog, rivalryId: string): string | undefined {
  return catalog.categoryIds.find(
    (id) => id !== MIXED_CATEGORY && catalog.pools.get(id)?.includes(rivalryId),
  );
}

/**
 * Ouvre directement une rivalité (lien partagé), même déjà tranchée. Si elle n'est pas dans la
 * catégorie en cours, on passe dans la sienne. La rivalité qui était affichée retourne dans la file.
 */
export function focusRivalry(
  state: DebateState,
  rivalryId: string,
  ctx: DebateContext,
): DebateState {
  if (state.current === rivalryId) return state;
  let next = state;
  if (!poolOf(ctx.catalog, state.category).includes(rivalryId)) {
    const category = categoryOfRivalry(ctx.catalog, rivalryId);
    if (!category) return state;
    next = changeCategory(state, category, ctx);
    if (next.current === rivalryId) return next;
  }
  return {
    ...next,
    current: rivalryId,
    queue: [
      ...next.queue.filter((id) => id !== rivalryId),
      ...(next.current === null ? [] : [next.current]),
    ],
  };
}

/**
 * Le pourcentage mondial d'un vote est arrivé : on le range dans l'historique et le profil.
 * Sans effet si ce vote a déjà son pourcentage ou n'est plus dans l'historique.
 */
export function recordOutcome(
  state: DebateState,
  rivalryId: string,
  outcome: ShareOutcome,
): DebateState {
  if (outcome.kind !== 'share') return state;
  const index = state.history.findIndex((v) => v.rivalryId === rivalryId && v.percent === null);
  if (index === -1) return state;
  const { percent } = outcome;
  const agreed = percent > 50;
  const streak = agreed ? state.streak + 1 : 0;
  return {
    ...state,
    history: state.history.map((v, i) => (i === index ? { ...v, percent } : v)),
    measured: state.measured + 1,
    agreed: state.agreed + (agreed ? 1 : 0),
    rebels: state.rebels + (percent < REBEL_BELOW ? 1 : 0),
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
  };
}

/** Remarque après un vote, sans répéter la précédente. */
export function debateQuip(
  state: DebateState,
  book: QuipBook,
  outcome: ShareOutcome,
  rng: Rng,
): { state: DebateState; text: string } {
  const quip = pickQuip(book, quipCategory(outcome), state.lastQuipKey, rng);
  return { state: { ...state, lastQuipKey: quip.key }, text: quip.text };
}

// ─── Lectures ───────────────────────────────────────────────────────────────

/** Numéro affiché (« Débat n° X »). */
export function debateNumber(state: DebateState): number {
  return state.count + 1;
}

export interface Profile {
  count: number;
  /** Part des votes d'accord avec la majorité, ou null tant qu'aucun pourcentage n'est connu. */
  agreementRate: number | null;
  rebels: number;
}

export function profile(state: DebateState): Profile {
  return {
    count: state.count,
    agreementRate: state.measured ? Math.round((state.agreed / state.measured) * 100) : null,
    rebels: state.rebels,
  };
}

// ─── Persistance ────────────────────────────────────────────────────────────

export const DEBATE_STORAGE_KEY = '484:debate';

const count = z.number().int().nonnegative();
const StoredDebateSchema = z.object({
  version: z.literal(DEBATE_STATE_VERSION),
  category: z.string(),
  queue: z.array(z.string()),
  current: z.string().nullable(),
  // Absent des sauvegardes d'avant la fin des catégories : retrouvé dans l'historique.
  done: z.array(z.string()).optional(),
  count,
  history: z.array(
    z.object({
      rivalryId: z.string(),
      team: z.enum(['a', 'b', 'none', 'both']),
      percent: z.number().min(0).max(100).nullable(),
    }),
  ),
  measured: count,
  agreed: count,
  rebels: count,
  // Absents des sauvegardes d'avant les achievements : valeurs par défaut.
  categories: z.array(z.string()).default([]),
  streak: count.default(0),
  bestStreak: count.default(0),
  lastQuipKey: z.string().nullable(),
});

/**
 * Transforme une valeur lue du stockage en état valide, ou null.
 * Les rivalités supprimées du JSON disparaissent ; compteur et profil sont gardés.
 */
export function restoreDebate(raw: unknown, ctx: DebateContext): DebateState | null {
  const parsed = StoredDebateSchema.safeParse(raw);
  if (!parsed.success) return null;
  const stored = parsed.data;
  if (!ctx.catalog.pools.has(stored.category)) return null;

  const pool = new Set(poolOf(ctx.catalog, stored.category));
  const known = new Set(poolOf(ctx.catalog, MIXED_CATEGORY));
  const measured = Math.max(stored.measured, 0);
  const history = stored.history.filter((v) => known.has(v.rivalryId)).slice(0, HISTORY_SIZE);
  const done = [...new Set(stored.done ?? stored.history.map((v) => v.rivalryId))].filter((id) =>
    known.has(id),
  );
  const doneSet = new Set(done);
  // Catégories jouées : celles gardées, plus celles de l'historique (sauvegardes plus anciennes).
  const categories = [
    ...new Set([
      ...stored.categories,
      ...history.map((v) => categoryOfRivalry(ctx.catalog, v.rivalryId) ?? ''),
    ]),
  ].filter((id) => id !== MIXED_CATEGORY && ctx.catalog.pools.has(id));
  const restored: DebateState = {
    ...stored,
    queue: [...new Set(stored.queue)].filter(
      (id) => pool.has(id) && id !== stored.current && !doneSet.has(id),
    ),
    done,
    history,
    measured,
    agreed: Math.min(stored.agreed, measured),
    rebels: Math.min(stored.rebels, measured),
    categories,
    streak: Math.min(stored.streak, measured),
    bestStreak: Math.min(Math.max(stored.bestStreak, stored.streak), measured),
  };
  if (stored.current !== null && pool.has(stored.current)) return restored;
  // Rivalité supprimée du JSON, ou catégorie terminée (de nouvelles rivalités ont pu arriver).
  const next = drawNext(restored.queue, [...pool], doneSet, null, ctx.rng);
  return { ...restored, current: next.id, queue: next.queue };
}
