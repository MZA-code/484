import { describe, expect, it } from 'vitest';
import { createDebate, MIXED_CATEGORY, seededRng, vote, type DebateContext } from '../../engine';
import { catalogFrom, categoryFromSearch, initialDebate } from './init';

const data = {
  categories: [{ id: 'heros' }, { id: 'bouffe' }],
  rivalries: ['h1', 'h2', 'h3', 'b1', 'b2', 'b3'].map((id) => ({
    id,
    category: id.startsWith('h') ? 'heros' : 'bouffe',
  })),
};

const ctx = (): DebateContext => ({
  catalog: catalogFrom(data),
  rng: seededRng(1),
  milestones: [],
});

describe('categoryFromSearch', () => {
  const catalog = catalogFrom(data);

  it('reads a known category from ?theme=', () => {
    expect(categoryFromSearch('?theme=bouffe', catalog)).toBe('bouffe');
    expect(categoryFromSearch('?theme=mix', catalog)).toBe(MIXED_CATEGORY);
  });

  it('ignores a missing or unknown category', () => {
    expect(categoryFromSearch('', catalog)).toBeNull();
    expect(categoryFromSearch('?theme=pirates', catalog)).toBeNull();
  });
});

describe('initialDebate', () => {
  it('starts a mixed debate by default, or on the URL category', () => {
    expect(initialDebate(ctx(), null, null).category).toBe(MIXED_CATEGORY);
    expect(initialDebate(ctx(), 'bouffe', null).category).toBe('bouffe');
  });

  it('resumes a saved debate as is', () => {
    const c = ctx();
    const saved = vote(createDebate(c, 'heros'), 'a', c).state;
    expect(initialDebate(c, null, saved)).toBe(saved);
  });

  it('lets the URL category win, keeping counters and history', () => {
    const c = ctx();
    const saved = vote(createDebate(c, 'heros'), 'a', c).state;
    const state = initialDebate(c, 'bouffe', saved);
    expect(state.category).toBe('bouffe');
    expect(state.count).toBe(1);
    expect(state.history).toEqual(saved.history);
  });
});
