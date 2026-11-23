import { describe, expect, it } from 'vitest';
import {
  achievementProgress,
  achievementValue,
  nextAchievement,
  unlockedIds,
  type AchievementRule,
} from './achievements';
import {
  changeCategory,
  createDebate,
  createDebateCatalog,
  recordOutcome,
  replayCategory,
  vote,
  type DebateState,
} from './debate';
import { seededRng } from './random';

const catalog = createDebateCatalog(
  ['heros', 'bouffe', 'geek'],
  [
    ...['h1', 'h2', 'h3'].map((id) => ({ id, category: 'heros' })),
    ...['b1', 'b2', 'b3'].map((id) => ({ id, category: 'bouffe' })),
    ...['g1', 'g2', 'g3'].map((id) => ({ id, category: 'geek' })),
  ],
  [
    { id: 'pop', categories: ['heros', 'geek'] },
    { id: 'vie', categories: ['bouffe'] },
  ],
);
const ctx = { catalog, rng: seededRng(1) };

const rules: AchievementRule[] = [
  { id: 'ten', kind: 'debates', goal: 10 },
  { id: 'hundred', kind: 'debates', goal: 100 },
  { id: 'rebel', kind: 'rebels', goal: 2 },
  { id: 'streak', kind: 'streak', goal: 3 },
  { id: 'all-cats', kind: 'categories', goal: 3 },
  { id: 'all-universes', kind: 'universes', goal: 2 },
];

/** Joue `n` débats dans une catégorie, avec le pourcentage donné pour chaque vote. */
function playIn(state: DebateState, category: string, n: number, percent = 60): DebateState {
  let s = changeCategory(state, category, ctx);
  for (let i = 0; i < n; i++) {
    // Catégorie terminée (3 rivalités) : on la rejoue pour continuer à compter.
    if (s.current === null) s = replayCategory(s, ctx);
    s = vote(s, 'a', ctx).state;
    s = recordOutcome(s, s.history[0]!.rivalryId, { kind: 'share', percent });
  }
  return s;
}

describe('achievements', () => {
  it('unlocks nothing at the start', () => {
    expect(unlockedIds(createDebate(ctx, 'heros'), rules, catalog).size).toBe(0);
  });

  it('unlocks the first one at 10 debates', () => {
    let state = createDebate(ctx, 'heros');
    state = playIn(state, 'heros', 9);
    expect(unlockedIds(state, rules, catalog).has('ten')).toBe(false);
    state = playIn(state, 'heros', 1);
    expect(unlockedIds(state, rules, catalog).has('ten')).toBe(true);
  });

  it('counts rebels, the best streak, categories and universes', () => {
    let state = createDebate(ctx, 'heros');
    state = playIn(state, 'heros', 3, 70);
    expect(achievementValue(state, 'streak', catalog)).toBe(3);
    expect(achievementValue(state, 'universes', catalog)).toBe(1);
    state = playIn(state, 'bouffe', 2, 20);
    expect(achievementValue(state, 'rebels', catalog)).toBe(2);
    expect(achievementValue(state, 'universes', catalog)).toBe(2);
    // La série est retombée à zéro, mais la meilleure reste acquise.
    expect(state.streak).toBe(0);
    expect(unlockedIds(state, rules, catalog)).toEqual(
      new Set(['rebel', 'streak', 'all-universes']),
    );
    state = playIn(state, 'geek', 1);
    expect(unlockedIds(state, rules, catalog).has('all-cats')).toBe(true);
  });

  it('caps the progress at the goal', () => {
    const state = playIn(createDebate(ctx, 'heros'), 'heros', 12);
    const ten = achievementProgress(state, rules, catalog).find((p) => p.rule.id === 'ten');
    expect(ten).toMatchObject({ value: 10, done: true });
  });

  it('suggests the closest goal next', () => {
    let state = createDebate(ctx, 'heros');
    state = playIn(state, 'heros', 8, 70);
    // « streak » (3/3) est débloqué ; « ten » (8/10) est le plus avancé des autres.
    expect(nextAchievement(achievementProgress(state, rules, catalog))?.rule.id).toBe('ten');
  });

  it('says when everything is unlocked', () => {
    const done = rules.map((rule) => ({ rule, value: rule.goal, done: true }));
    expect(nextAchievement(done)).toBeNull();
  });
});
