import { describe, expect, it } from 'vitest';
import { CARD_COLORS, colorFor, teamColors } from './color';
import { formatText, plural } from './format';

describe('colorFor', () => {
  it('is stable for a given id', () => {
    expect(colorFor('robots-hal-9000')).toBe(colorFor('robots-hal-9000'));
  });

  it('always returns a palette color', () => {
    for (const id of ['a', 'b', 'robots-r2-d2', 'duos-tom-jerry', '']) {
      expect(CARD_COLORS).toContain(colorFor(id));
    }
  });

  it('spreads ids across the palette', () => {
    const used = new Set(Array.from({ length: 200 }, (_, i) => colorFor(`id-${i}`)));
    expect(used.size).toBe(CARD_COLORS.length);
  });
});

describe('teamColors', () => {
  it('gives two different, stable colors for every rivalry', () => {
    for (let i = 0; i < 500; i++) {
      const [a, b] = teamColors(`rivalry-${i}`);
      expect(a).not.toBe(b);
      expect(teamColors(`rivalry-${i}`)).toEqual([a, b]);
    }
  });
});

describe('formatText', () => {
  it('fills placeholders', () => {
    expect(formatText('{name} gagne {n} fois', { name: 'R2-D2', n: 3 })).toBe('R2-D2 gagne 3 fois');
  });

  it('leaves unknown placeholders visible', () => {
    expect(formatText('Bonjour {who}', {})).toBe('Bonjour {who}');
  });
});

describe('plural', () => {
  const forms = { one: '{n} victoire', other: '{n} victoires' };

  it('uses the singular for 0 and 1, as in French', () => {
    expect(plural(forms, 1)).toBe('1 victoire');
    expect(plural(forms, 0)).toBe('0 victoire');
  });

  it('uses the plural from 2', () => {
    expect(plural(forms, 2)).toBe('2 victoires');
  });
});
