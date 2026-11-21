import { describe, expect, it } from 'vitest';
import { MIXED_THEME, poolFor } from './catalog';
import {
  changeTheme,
  championSide,
  createGame,
  duelNumber,
  records,
  RETIREMENT_STREAK,
  skipDuel,
  topContenders,
  vote,
  type GameState,
  type Side,
} from './game';
import { seededRng } from './random';
import { makeContext } from './test-helpers';

describe('drawing', () => {
  it('starts with two different contenders from the theme', () => {
    const ctx = makeContext();
    const state = createGame(ctx, 'a');
    const pool = poolFor(ctx.catalog, 'a');
    expect(pool).toContain(state.left);
    expect(pool).toContain(state.right);
    expect(state.left).not.toBe(state.right);
  });

  it('draws without replacement: every contender shows up before any repeat', () => {
    const ctx = makeContext(5);
    let state = createGame(ctx, 'a');
    const seen = new Set([state.left, state.right]);
    // On garde toujours la gauche : chaque vote fait entrer un nouveau challenger à droite.
    // 6 prétendants : 2 au départ + 4 challengers = tout le monde, sans doublon.
    for (let i = 0; i < 4; i++) {
      state = vote(state, 'left', ctx).state;
      expect(seen.has(state.right)).toBe(false);
      seen.add(state.right);
    }
    expect(seen.size).toBe(6);
  });

  it('reshuffles when the queue is empty and keeps going forever', () => {
    const ctx = makeContext(8);
    let state = createGame(ctx, 'b');
    for (let i = 0; i < 200; i++) {
      state = vote(state, i % 2 ? 'left' : 'right', ctx).state;
      expect(state.left).not.toBe(state.right);
    }
  });

  it('never makes a contender face itself, even with a 2-contender theme', () => {
    const ctx = makeContext(11);
    let state = createGame(ctx, 'duo');
    for (let i = 0; i < 100; i++) {
      const step = i % 3;
      state = step === 2 ? skipDuel(state, ctx) : vote(state, step ? 'left' : 'right', ctx).state;
      expect(state.left).not.toBe(state.right);
    }
  });

  it('avoids an immediate rematch with the loser when possible', () => {
    for (let seed = 0; seed < 50; seed++) {
      const ctx = makeContext(seed);
      let state = createGame(ctx, 'b');
      // Le challenger (à droite) gagne à chaque fois : jamais de retraite, toujours un perdant à gauche.
      for (let i = 0; i < 30; i++) {
        const loser = state.left;
        state = vote(state, 'right', ctx).state;
        expect(state.left).not.toBe(loser);
        state = { ...state, left: state.right, right: state.left };
      }
    }
  });

  it('is reproducible with the same seed', () => {
    const play = () => {
      const ctx = makeContext(123);
      let state = createGame(ctx, MIXED_THEME);
      for (let i = 0; i < 20; i++) state = vote(state, i % 2 ? 'left' : 'right', ctx).state;
      return state;
    };
    expect(play()).toEqual(play());
  });
});

describe('voting and streaks', () => {
  it('keeps the winner in place and replaces the loser', () => {
    const ctx = makeContext();
    const state = createGame(ctx, 'a');
    const { state: next } = vote(state, 'right', ctx);
    expect(next.right).toBe(state.right);
    expect(next.left).not.toBe(state.left);
  });

  it('starts a streak at 1 for a new champion', () => {
    const ctx = makeContext();
    const { state, events } = vote(createGame(ctx, 'a'), 'left', ctx);
    expect(state.streak).toBe(1);
    expect(state.champion).toBe(state.left);
    expect(events[0]).toMatchObject({ type: 'voted', streak: 1 });
  });

  it('increments the streak when the champion wins again', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    for (let i = 1; i <= 4; i++) {
      state = vote(state, 'left', ctx).state;
      expect(state.streak).toBe(i);
    }
  });

  it('resets the streak to 1 when the challenger wins', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    state = vote(state, 'left', ctx).state;
    state = vote(state, 'left', ctx).state;
    expect(state.streak).toBe(2);
    const challenger = state.right;
    state = vote(state, 'right', ctx).state;
    expect(state.streak).toBe(1);
    expect(state.champion).toBe(challenger);
  });

  it('counts duels and wins during the visit', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    const firstChampion = state.left;
    state = vote(state, 'left', ctx).state;
    state = vote(state, 'left', ctx).state;
    expect(state.duelCount).toBe(2);
    expect(duelNumber(state)).toBe(3);
    expect(state.wins[firstChampion]).toBe(2);
  });

  it('records the best streak', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    for (let i = 0; i < 3; i++) state = vote(state, 'left', ctx).state;
    const hero = state.left;
    state = vote(state, 'right', ctx).state;
    expect(state.bestStreak).toEqual({ contenderId: hero, length: 3 });
  });

  it('tells which side holds the title', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    expect(championSide(state)).toBeNull();
    state = vote(state, 'right', ctx).state;
    expect(championSide(state)).toBe('right');
  });
});

describe('retirement', () => {
  function playStreak(length: number) {
    const ctx = makeContext(3);
    let state = createGame(ctx, 'a');
    const hero = state.left;
    let lastEvents: ReturnType<typeof vote>['events'] = [];
    for (let i = 0; i < length; i++) {
      const result = vote(state, 'left', ctx);
      state = result.state;
      lastEvents = result.events;
    }
    return { state, hero, lastEvents };
  }

  it('does not retire at 9 wins', () => {
    const { state, hero } = playStreak(RETIREMENT_STREAK - 1);
    expect(state.streak).toBe(9);
    expect(state.champion).toBe(hero);
    expect(state.retiredCount).toBe(0);
  });

  it('retires the champion undefeated at 10 wins and draws two new contenders', () => {
    const { state, hero, lastEvents } = playStreak(RETIREMENT_STREAK);
    expect(lastEvents).toContainEqual({ type: 'retired', contenderId: hero, streak: 10 });
    expect(state.retiredCount).toBe(1);
    expect(state.streak).toBe(0);
    expect(state.champion).toBeNull();
    expect([state.left, state.right]).not.toContain(hero);
    expect(state.left).not.toBe(state.right);
    expect(state.bestStreak).toEqual({ contenderId: hero, length: 10 });
  });

  it('starts a fresh streak after a retirement', () => {
    const ctx = makeContext(3);
    let state = createGame(ctx, 'a');
    for (let i = 0; i < RETIREMENT_STREAK; i++) state = vote(state, 'left', ctx).state;
    state = vote(state, 'left', ctx).state;
    expect(state.streak).toBe(1);
  });
});

describe('milestones', () => {
  it('emits a milestone event exactly when the counter reaches a step', () => {
    const ctx = makeContext(1, [3, 5]);
    let state = createGame(ctx, 'a');
    const reached: number[] = [];
    for (let i = 0; i < 6; i++) {
      const result = vote(state, i % 2 ? 'left' : 'right', ctx);
      state = result.state;
      for (const e of result.events) if (e.type === 'milestone') reached.push(e.count);
    }
    expect(reached).toEqual([3, 5]);
  });
});

describe('skipping a duel', () => {
  it('replaces both contenders and resets the streak', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    state = vote(state, 'left', ctx).state;
    state = vote(state, 'left', ctx).state;
    const before = state;
    state = skipDuel(state, ctx);
    expect(state.left).not.toBe(before.left);
    expect(state.right).not.toBe(before.right);
    expect([state.left, state.right]).not.toContain(before.left);
    expect([state.left, state.right]).not.toContain(before.right);
    expect(state.streak).toBe(0);
    expect(state.champion).toBeNull();
  });

  it('keeps the duel counter, wins and records', () => {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    for (let i = 0; i < 3; i++) state = vote(state, 'left', ctx).state;
    const before = state;
    state = skipDuel(state, ctx);
    expect(state.duelCount).toBe(before.duelCount);
    expect(state.wins).toEqual(before.wins);
    expect(state.bestStreak).toEqual(before.bestStreak);
  });
});

describe('changing theme', () => {
  function played(): { state: GameState; ctx: ReturnType<typeof makeContext> } {
    const ctx = makeContext();
    let state = createGame(ctx, 'a');
    for (let i = 0; i < 4; i++) state = vote(state, 'left', ctx).state;
    return { state, ctx };
  }

  it('draws a duel from the new theme and resets the streak', () => {
    const { state, ctx } = played();
    const next = changeTheme(state, 'b', ctx);
    const pool = poolFor(ctx.catalog, 'b');
    expect(next.theme).toBe('b');
    expect(pool).toContain(next.left);
    expect(pool).toContain(next.right);
    expect(next.queue.every((id) => pool.includes(id))).toBe(true);
    expect(next.streak).toBe(0);
    expect(next.champion).toBeNull();
  });

  it('keeps the duel counter, wins and records', () => {
    const { state, ctx } = played();
    const next = changeTheme(state, 'b', ctx);
    expect(next.duelCount).toBe(state.duelCount);
    expect(next.wins).toEqual(state.wins);
    expect(next.bestStreak).toEqual(state.bestStreak);
    expect(next.retiredCount).toBe(state.retiredCount);
  });

  it('uses the union of all themes in mixed mode', () => {
    const ctx = makeContext();
    expect(poolFor(ctx.catalog, MIXED_THEME)).toHaveLength(11);
    expect(ctx.catalog.themeIds[0]).toBe(MIXED_THEME);
  });

  it('does nothing when the theme is the same', () => {
    const { state, ctx } = played();
    expect(changeTheme(state, 'a', ctx)).toBe(state);
  });

  it('rejects an unknown theme', () => {
    const { state, ctx } = played();
    expect(() => changeTheme(state, 'nope', ctx)).toThrow();
  });
});

describe('top 5 and records', () => {
  it('ranks contenders by wins, then by id for ties', () => {
    const state = {
      ...createGame(makeContext(), 'a'),
      wins: { a3: 2, a1: 5, a2: 2, a4: 1, a5: 1, a6: 9 },
    };
    expect(topContenders(state)).toEqual([
      { contenderId: 'a6', wins: 9 },
      { contenderId: 'a1', wins: 5 },
      { contenderId: 'a2', wins: 2 },
      { contenderId: 'a3', wins: 2 },
      { contenderId: 'a4', wins: 1 },
    ]);
  });

  it('reports the theme pool size', () => {
    const ctx = makeContext();
    expect(records(createGame(ctx, 'b'), ctx).poolSize).toBe(3);
    expect(records(createGame(ctx, MIXED_THEME), ctx).poolSize).toBe(11);
  });
});

describe('long random sessions', () => {
  it('keeps every invariant over thousands of random actions', () => {
    const ctx = makeContext(2024);
    const pick = seededRng(7);
    let state = createGame(ctx, MIXED_THEME);
    const themes = ctx.catalog.themeIds;
    for (let i = 0; i < 5000; i++) {
      const roll = pick();
      if (roll < 0.03) state = skipDuel(state, ctx);
      else if (roll < 0.05)
        state = changeTheme(state, themes[Math.floor(pick() * themes.length)] as string, ctx);
      else {
        // Le tenant gagne souvent, pour provoquer de vraies retraites.
        const held = championSide(state);
        const side: Side = held && pick() < 0.85 ? held : pick() < 0.5 ? 'left' : 'right';
        state = vote(state, side, ctx).state;
      }
      const pool = poolFor(ctx.catalog, state.theme);
      expect(state.left).not.toBe(state.right);
      expect(pool).toContain(state.left);
      expect(pool).toContain(state.right);
      expect(state.streak).toBeLessThan(RETIREMENT_STREAK);
    }
    expect(state.retiredCount).toBeGreaterThan(0);
  });
});
