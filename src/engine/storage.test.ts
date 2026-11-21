import { describe, expect, it } from 'vitest';
import {
  createMemoryStorage,
  readJson,
  removeKey,
  resolveStorage,
  writeJson,
  type KeyValueStorage,
} from './storage';

const broken: KeyValueStorage = {
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

  it('falls back to memory when the storage throws, is missing or cannot be reached', () => {
    const fromBroken = resolveStorage(() => broken);
    expect(fromBroken).not.toBe(broken);
    fromBroken.setItem('k', 'v');
    expect(fromBroken.getItem('k')).toBe('v');
    expect(resolveStorage(() => undefined).getItem('x')).toBeNull();
    expect(
      resolveStorage(() => {
        throw new Error('localStorage is not available');
      }).getItem('x'),
    ).toBeNull();
  });
});

describe('JSON helpers', () => {
  it('round-trips a value', () => {
    const storage = createMemoryStorage();
    expect(writeJson(storage, 'k', { a: [1, 2] })).toBe(true);
    expect(readJson(storage, 'k')).toEqual({ a: [1, 2] });
  });

  it('returns null for missing or corrupted data', () => {
    const storage = createMemoryStorage();
    expect(readJson(storage, 'k')).toBeNull();
    storage.setItem('k', '{not json');
    expect(readJson(storage, 'k')).toBeNull();
  });

  it('never throws with a broken storage', () => {
    expect(writeJson(broken, 'k', 1)).toBe(false);
    expect(readJson(broken, 'k')).toBeNull();
    expect(() => removeKey(broken, 'k')).not.toThrow();
  });
});
