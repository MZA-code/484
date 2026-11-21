import { describe, expect, it } from 'vitest';
import { createGame, vote, type GameState } from './game';
import {
  createMemoryStorage,
  loadState,
  resolveStorage,
  restoreState,
  saveState,
  STORAGE_KEY,
  type KeyValueStorage,
} from './persistence';
import { makeContext } from './test-helpers';

function playedState(): GameState {
  const ctx = makeContext();
  let state = createGame(ctx, 'a');
  for (let i = 0; i < 3; i++) state = vote(state, 'left', ctx).state;
  return state;
}

const brokenStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error('SecurityError');
  },
  setItem: () => {
    throw new Error('QuotaExceededError');
  },
  removeItem: () => {
    throw new Error('SecurityError');
  },
};

describe('resolveStorage', () => {
  it('uses the given storage when it works', () => {
    const storage = createMemoryStorage();
    expect(resolveStorage(() => storage)).toBe(storage);
  });

  it('falls back to memory when the storage throws', () => {
    const storage = resolveStorage(() => brokenStorage);
    expect(storage).not.toBe(brokenStorage);
    storage.setItem('k', 'v');
    expect(storage.getItem('k')).toBe('v');
  });

  it('falls back to memory when accessing the storage itself throws', () => {
    const storage = resolveStorage(() => {
      throw new Error('localStorage is not available');
    });
    expect(storage.getItem('x')).toBeNull();
  });

  it('falls back to memory when there is no storage', () => {
    expect(resolveStorage(() => undefined).getItem('x')).toBeNull();
  });
});

describe('save and load', () => {
  it('round-trips the game state', () => {
    const ctx = makeContext();
    const storage = createMemoryStorage();
    const state = playedState();
    expect(saveState(storage, state)).toBe(true);
    expect(loadState(storage, ctx)).toEqual(state);
  });

  it('never throws with a broken storage', () => {
    const ctx = makeContext();
    expect(saveState(brokenStorage, playedState())).toBe(false);
    expect(loadState(brokenStorage, ctx)).toBeNull();
  });

  it('returns null for missing, corrupted or foreign data', () => {
    const ctx = makeContext();
    const storage = createMemoryStorage();
    expect(loadState(storage, ctx)).toBeNull();
    storage.setItem(STORAGE_KEY, '{not json');
    expect(loadState(storage, ctx)).toBeNull();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99 }));
    expect(loadState(storage, ctx)).toBeNull();
  });
});

describe('restoreState', () => {
  it('rejects an unknown theme', () => {
    const ctx = makeContext();
    expect(restoreState({ ...playedState(), theme: 'gone' }, ctx)).toBeNull();
  });

  it('redraws the duel but keeps counters when a contender no longer exists', () => {
    const ctx = makeContext();
    const state = playedState();
    const restored = restoreState({ ...state, left: 'deleted-contender' }, ctx);
    expect(restored).not.toBeNull();
    expect(restored?.duelCount).toBe(state.duelCount);
    expect(restored?.wins).toEqual(state.wins);
    expect(restored?.left).not.toBe('deleted-contender');
    expect(restored?.streak).toBe(0);
  });

  it('cleans the queue and the wins of unknown ids', () => {
    const ctx = makeContext();
    const state = playedState();
    const restored = restoreState(
      { ...state, queue: ['ghost', ...state.queue, state.left], wins: { ...state.wins, ghost: 4 } },
      ctx,
    );
    expect(restored?.queue).not.toContain('ghost');
    expect(restored?.queue).not.toContain(state.left);
    expect(restored?.wins).not.toHaveProperty('ghost');
  });

  it('drops a champion that is not on screen', () => {
    const ctx = makeContext();
    // b1 appartient à un autre thème : il ne peut pas être à l'écran dans le thème « a ».
    const restored = restoreState({ ...playedState(), champion: 'b1', streak: 4 }, ctx);
    expect(restored?.champion).toBeNull();
    expect(restored?.streak).toBe(0);
  });

  it('caps a stored streak below the retirement threshold', () => {
    const ctx = makeContext();
    const state = playedState();
    const restored = restoreState({ ...state, streak: 42 }, ctx);
    expect(restored?.streak).toBe(9);
  });
});
