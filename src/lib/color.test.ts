import { describe, expect, it } from 'vitest';
import { CARD_COLORS, teamColors } from './color';

describe('teamColors', () => {
  it('is stable and always gives two different colors', () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = teamColors(`cat-rivalry-${i}`);
      expect(a).not.toBe(b);
      expect(teamColors(`cat-rivalry-${i}`)).toEqual([a, b]);
    }
  });

  it('spreads rivalries over (almost) every possible pair', () => {
    const pairs = new Set<string>();
    for (let i = 0; i < 1000; i++) pairs.add(teamColors(`cat-team-${i}-vs-${i * 7}`).join('/'));
    const possible = CARD_COLORS.length * (CARD_COLORS.length - 1);
    expect(pairs.size).toBeGreaterThanOrEqual(possible - 2);
  });
});
