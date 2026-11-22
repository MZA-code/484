import { describe, expect, it } from 'vitest';
import {
  changeCategory,
  createDebate,
  createDebateCatalog,
  debateNumber,
  debateQuip,
  HISTORY_SIZE,
  MIXED_CATEGORY,
  profile,
  recordOutcome,
  restoreDebate,
  skip,
  vote,
  type DebateContext,
  type DebateState,
  categoryOfRivalry,
  focusRivalry,
  universeOf,
} from './debate';
import type { QuipBook } from './quips';
import { seededRng } from './random';

const rivalries = [
  ...['h1', 'h2', 'h3', 'h4', 'h5'].map((id) => ({ id, category: 'heros' })),
  ...['b1', 'b2', 'b3'].map((id) => ({ id, category: 'bouffe' })),
  { id: 'solo', category: 'seule' },
];

function makeCtx(seed = 1): DebateContext {
  return {
    catalog: createDebateCatalog(['heros', 'bouffe', 'seule'], rivalries, [
      { id: 'univers-pop', categories: ['heros', 'seule'] },
    ]),
    rng: seededRng(seed),
  };
}

const pool = (ctx: DebateContext, c: string) => ctx.catalog.pools.get(c) ?? [];
const share = (percent: number) => ({ kind: 'share', percent }) as const;

describe('catalog', () => {
  it('puts « Tout mélangé » first and makes it the union of all categories', () => {
    const ctx = makeCtx();
    expect(ctx.catalog.categoryIds).toEqual([MIXED_CATEGORY, 'heros', 'bouffe', 'seule']);
    expect(pool(ctx, MIXED_CATEGORY)).toHaveLength(rivalries.length);
  });
});

describe('universes', () => {
  it('plays a universe as the union of its categories', () => {
    const ctx = makeCtx();
    expect([...pool(ctx, 'univers-pop')].sort()).toEqual(['h1', 'h2', 'h3', 'h4', 'h5', 'solo']);
    let state = createDebate(ctx, 'univers-pop');
    for (let i = 0; i < 20; i++) {
      expect(pool(ctx, 'univers-pop')).toContain(state.current);
      state = vote(state, 'a', ctx).state;
    }
  });

  it('finds the universe of a category, or of itself', () => {
    const ctx = makeCtx();
    expect(universeOf(ctx.catalog, 'heros')?.id).toBe('univers-pop');
    expect(universeOf(ctx.catalog, 'univers-pop')?.id).toBe('univers-pop');
    expect(universeOf(ctx.catalog, 'bouffe')).toBeUndefined();
  });
});

describe('focusRivalry (shared links)', () => {
  it('opens a rivalry of the current pool and keeps the previous one for later', () => {
    const ctx = makeCtx();
    const state = createDebate(ctx, 'heros');
    const target = pool(ctx, 'heros').find((id) => id !== state.current) as string;
    const next = focusRivalry(state, target, ctx);
    expect(next.current).toBe(target);
    expect(next.queue).not.toContain(target);
    expect(next.queue).toContain(state.current);
    expect(next.category).toBe('heros');
  });

  it('switches to the rivalry’s category when needed, keeping counters', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    state = vote(state, 'a', ctx).state;
    const next = focusRivalry(state, 'b2', ctx);
    expect(next).toMatchObject({ current: 'b2', category: 'bouffe', count: 1 });
    expect(next.queue).not.toContain('b2');
  });

  it('ignores unknown rivalries', () => {
    const ctx = makeCtx();
    const state = createDebate(ctx, 'heros');
    expect(focusRivalry(state, 'nope', ctx)).toBe(state);
    expect(categoryOfRivalry(ctx.catalog, 'b1')).toBe('bouffe');
  });
});

describe('drawing', () => {
  it('starts on a rivalry of the category', () => {
    const ctx = makeCtx();
    const state = createDebate(ctx, 'heros');
    expect(pool(ctx, 'heros')).toContain(state.current);
  });

  it('shows every rivalry once before any repeat (no replacement)', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ctx = makeCtx(seed);
      let state = createDebate(ctx, 'heros');
      const seen = [state.current];
      for (let i = 0; i < 4; i++) {
        state = vote(state, 'a', ctx).state;
        seen.push(state.current);
      }
      expect(new Set(seen).size).toBe(5);
    }
  });

  it('never shows the same rivalry twice in a row, even across reshuffles', () => {
    for (let seed = 0; seed < 30; seed++) {
      const ctx = makeCtx(seed);
      let state = createDebate(ctx, 'bouffe');
      for (let i = 0; i < 60; i++) {
        const before = state.current;
        state = i % 4 === 3 ? skip(state, ctx) : vote(state, i % 2 ? 'a' : 'b', ctx).state;
        expect(state.current).not.toBe(before);
      }
    }
  });

  it('survives a category with a single rivalry', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'seule');
    state = vote(state, 'a', ctx).state;
    expect(state.current).toBe('solo');
  });

  it('is reproducible with the same seed', () => {
    const play = () => {
      const ctx = makeCtx(42);
      let state = createDebate(ctx, MIXED_CATEGORY);
      for (let i = 0; i < 20; i++) state = vote(state, i % 2 ? 'a' : 'b', ctx).state;
      return state;
    };
    expect(play()).toEqual(play());
  });
});

describe('voting', () => {
  it('counts the debate and records the choice first in the history', () => {
    const ctx = makeCtx();
    const start = createDebate(ctx, 'heros');
    const { state, events } = vote(start, 'b', ctx);
    expect(state.count).toBe(1);
    expect(debateNumber(state)).toBe(2);
    expect(state.history[0]).toEqual({ rivalryId: start.current, team: 'b', percent: null });
    expect(events[0]).toEqual({
      type: 'voted',
      rivalryId: start.current,
      team: 'b',
      category: 'heros',
    });
  });

  it('keeps a bounded history, most recent first', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, MIXED_CATEGORY);
    for (let i = 0; i < HISTORY_SIZE + 10; i++) state = vote(state, 'a', ctx).state;
    expect(state.history).toHaveLength(HISTORY_SIZE);
    expect(state.count).toBe(HISTORY_SIZE + 10);
  });

  it('remembers the categories where a debate was decided', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    state = vote(state, 'a', ctx).state;
    state = vote(state, 'b', ctx).state;
    expect(state.categories).toEqual(['heros']);
    state = changeCategory(state, 'bouffe', ctx);
    state = skip(state, ctx);
    expect(state.categories).toEqual(['heros']);
    state = vote(state, 'a', ctx).state;
    expect(state.categories).toEqual(['heros', 'bouffe']);
  });

  it('counts the agreement streak, and keeps the best one', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, MIXED_CATEGORY);
    for (const percent of [60, 70, 80, 30, 55]) {
      state = vote(state, 'a', ctx).state;
      state = recordOutcome(state, state.history[0]!.rivalryId, share(percent));
    }
    expect(state.streak).toBe(1);
    expect(state.bestStreak).toBe(3);
  });

  it('restores older saves without achievements data', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    state = vote(state, 'a', ctx).state;
    const old: Record<string, unknown> = { ...state };
    delete old['categories'];
    delete old['streak'];
    delete old['bestStreak'];
    const restored = restoreDebate(JSON.parse(JSON.stringify(old)), ctx);
    // Les catégories sont retrouvées grâce à l'historique.
    expect(restored).toMatchObject({ categories: ['heros'], streak: 0, bestStreak: 0 });
  });
});

describe('skipping and changing category', () => {
  function played(): { state: DebateState; ctx: DebateContext } {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    for (let i = 0; i < 3; i++) state = vote(state, 'a', ctx).state;
    state = recordOutcome(state, state.history[0]!.rivalryId, share(70));
    return { state, ctx };
  }

  it('skip moves on without counting a debate', () => {
    const { state, ctx } = played();
    const next = skip(state, ctx);
    expect(next.current).not.toBe(state.current);
    expect(next.count).toBe(state.count);
    expect(next.history).toEqual(state.history);
  });

  it('changing category draws from the new one and keeps counters and profile', () => {
    const { state, ctx } = played();
    const next = changeCategory(state, 'bouffe', ctx);
    expect(next.category).toBe('bouffe');
    expect(pool(ctx, 'bouffe')).toContain(next.current);
    expect(next.queue.every((id) => pool(ctx, 'bouffe').includes(id))).toBe(true);
    expect(next.count).toBe(state.count);
    expect(next.history).toEqual(state.history);
    expect(profile(next)).toEqual(profile(state));
  });

  it('does nothing for the same category and rejects an unknown one', () => {
    const { state, ctx } = played();
    expect(changeCategory(state, 'heros', ctx)).toBe(state);
    expect(() => changeCategory(state, 'pirates', ctx)).toThrow();
  });
});

describe('profile', () => {
  it('has no agreement rate before any percentage is known', () => {
    const ctx = makeCtx();
    const state = vote(createDebate(ctx, 'heros'), 'a', ctx).state;
    expect(profile(state)).toEqual({ count: 1, agreementRate: null, rebels: 0 });
  });

  it('counts agreement with the majority (> 50 %) and rebel choices (< 40 %)', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, MIXED_CATEGORY);
    for (const percent of [80, 51, 50, 45, 39, 10]) {
      state = vote(state, 'a', ctx).state;
      state = recordOutcome(state, state.history[0]!.rivalryId, share(percent));
    }
    expect(profile(state)).toEqual({ count: 6, agreementRate: 33, rebels: 2 });
    expect(state.history.map((v) => v.percent)).toEqual([10, 39, 45, 50, 51, 80]);
  });

  it('ignores outcomes without a percentage, unknown votes and duplicates', () => {
    const ctx = makeCtx();
    let state = vote(createDebate(ctx, 'heros'), 'a', ctx).state;
    const id = state.history[0]!.rivalryId;
    expect(recordOutcome(state, id, { kind: 'unavailable' })).toBe(state);
    expect(recordOutcome(state, id, { kind: 'first' })).toBe(state);
    expect(recordOutcome(state, 'nope', share(70))).toBe(state);
    state = recordOutcome(state, id, share(70));
    expect(recordOutcome(state, id, share(70))).toBe(state);
    expect(state.measured).toBe(1);
  });

  it('attaches a late percentage to the right vote', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    state = vote(state, 'a', ctx).state;
    const first = state.history[0]!.rivalryId;
    state = vote(state, 'b', ctx).state;
    state = recordOutcome(state, first, share(25));
    expect(state.history[1]).toMatchObject({ rivalryId: first, percent: 25 });
    expect(state.history[0]!.percent).toBeNull();
  });
});

describe('quips', () => {
  const book: QuipBook = {
    high: ['h0', 'h1'],
    mid: ['m0', 'm1'],
    low: ['l0', 'l1'],
    neutral: ['n0', 'n1'],
  };

  it('picks in the right category and never repeats twice in a row', () => {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    let last = '';
    for (let i = 0; i < 40; i++) {
      const q = debateQuip(state, book, share(80), ctx.rng);
      expect(q.text).toMatch(/^h/);
      expect(q.text).not.toBe(last);
      last = q.text;
      state = q.state;
    }
  });
});

describe('restoreDebate', () => {
  function saved(): { state: DebateState; ctx: DebateContext } {
    const ctx = makeCtx();
    let state = createDebate(ctx, 'heros');
    for (let i = 0; i < 3; i++) state = vote(state, 'a', ctx).state;
    return { state, ctx };
  }

  it('round-trips through JSON', () => {
    const { state, ctx } = saved();
    expect(restoreDebate(JSON.parse(JSON.stringify(state)), ctx)).toEqual(state);
  });

  it('rejects garbage and unknown categories', () => {
    const { state, ctx } = saved();
    expect(restoreDebate(null, ctx)).toBeNull();
    expect(restoreDebate({ version: 99 }, ctx)).toBeNull();
    expect(restoreDebate({ ...state, category: 'pirates' }, ctx)).toBeNull();
  });

  it('drops deleted rivalries but keeps the counters', () => {
    const { state, ctx } = saved();
    const restored = restoreDebate(
      {
        ...state,
        current: 'deleted',
        queue: ['ghost', ...state.queue],
        history: [{ rivalryId: 'ghost', team: 'a', percent: 50 }, ...state.history],
      },
      ctx,
    );
    expect(restored).not.toBeNull();
    expect(pool(ctx, 'heros')).toContain(restored?.current);
    expect(restored?.queue).not.toContain('ghost');
    expect(restored?.history.map((v) => v.rivalryId)).not.toContain('ghost');
    expect(restored?.count).toBe(3);
  });

  it('keeps profile counters consistent', () => {
    const { state, ctx } = saved();
    const restored = restoreDebate({ ...state, measured: 2, agreed: 9, rebels: 9 }, ctx);
    expect(restored).toMatchObject({ measured: 2, agreed: 2, rebels: 2 });
  });
});
