import { describe, expect, it } from 'vitest';
import { seededRng, shuffle } from './random';

describe('seededRng', () => {
  it('is deterministic for a given seed', () => {
    const a = seededRng(7);
    const b = seededRng(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('stays within [0, 1)', () => {
    const rng = seededRng(1);
    for (let i = 0; i < 10_000; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('shuffle (Fisher-Yates)', () => {
  it('returns a permutation without touching the input', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const output = shuffle(input, seededRng(3));
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...output].sort((x, y) => x - y)).toEqual(input);
  });

  it('is roughly uniform', () => {
    // Chaque élément doit apparaître à chaque position environ 1/4 du temps.
    const rng = seededRng(99);
    const runs = 20_000;
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < runs; i++) {
      const first = shuffle([0, 1, 2, 3], rng)[0] as number;
      counts[first] = (counts[first] ?? 0) + 1;
    }
    for (const c of counts) expect(c / runs).toBeCloseTo(0.25, 1);
  });

  it('handles empty and single-item lists', () => {
    expect(shuffle([], seededRng(1))).toEqual([]);
    expect(shuffle(['x'], seededRng(1))).toEqual(['x']);
  });
});
