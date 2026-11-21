import { describe, expect, it } from 'vitest';
import { createGame, MIXED_THEME, seededRng, vote, type GameContext } from '../../engine';
import { catalogFrom, initialState, themeFromSearch } from './init';

const data = {
  themes: [
    { id: 'robots', label: 'Robots' },
    { id: 'duos', label: 'Duos' },
  ],
  contenders: ['r1', 'r2', 'r3', 'd1', 'd2', 'd3'].map((id) => ({
    id,
    theme: id.startsWith('r') ? 'robots' : 'duos',
  })),
};

const ctx = (): GameContext => ({ catalog: catalogFrom(data), rng: seededRng(1), milestones: [] });

describe('themeFromSearch', () => {
  const catalog = catalogFrom(data);

  it('reads a known theme', () => {
    expect(themeFromSearch('?theme=robots', catalog)).toBe('robots');
    expect(themeFromSearch('?theme=mix', catalog)).toBe(MIXED_THEME);
  });

  it('ignores a missing or unknown theme', () => {
    expect(themeFromSearch('', catalog)).toBeNull();
    expect(themeFromSearch('?theme=pirates', catalog)).toBeNull();
  });
});

describe('initialState', () => {
  it('starts a mixed game by default', () => {
    expect(initialState(ctx(), null, null).theme).toBe(MIXED_THEME);
  });

  it('starts on the theme from the URL', () => {
    expect(initialState(ctx(), 'duos', null).theme).toBe('duos');
  });

  it('resumes a saved game as is', () => {
    const c = ctx();
    const saved = vote(createGame(c, 'robots'), 'left', c).state;
    expect(initialState(c, null, saved)).toBe(saved);
  });

  it('lets the URL theme win over the saved one, keeping the counters', () => {
    const c = ctx();
    const saved = vote(createGame(c, 'robots'), 'left', c).state;
    const state = initialState(c, 'duos', saved);
    expect(state.theme).toBe('duos');
    expect(state.duelCount).toBe(1);
    expect(state.wins).toEqual(saved.wins);
  });
});
