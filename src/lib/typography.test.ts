import { describe, expect, it } from 'vitest';
import { applyTypographyDeep, frenchTypography, NARROW_NBSP as F, NBSP as N } from './typography';

describe('frenchTypography', () => {
  it('puts a narrow no-break space before ; : ! ?', () => {
    expect(frenchTypography('Quoi ? Non ! Si : oui ; bon')).toBe(
      `Quoi${F}? Non${F}! Si${F}: oui${F}; bon`,
    );
  });

  it('adds the space when it is missing', () => {
    expect(frenchTypography('Let’s-a go!')).toBe(`Let’s-a go${F}!`);
  });

  it('keeps grouped punctuation together', () => {
    expect(frenchTypography('Vraiment ?!')).toBe(`Vraiment${F}?!`);
  });

  it('replaces any existing space kind before punctuation', () => {
    expect(frenchTypography(`A${N}? B${String.fromCharCode(0x2009)}! C  :`)).toBe(
      `A${F}? B${F}! C${F}:`,
    );
  });

  it('puts no-break spaces inside French quotes', () => {
    expect(frenchTypography('« Désolé, Dave. »')).toBe(`«${N}Désolé, Dave.${N}»`);
    expect(frenchTypography('«Collé»')).toBe(`«${N}Collé${N}»`);
  });

  it('handles quotes and punctuation together', () => {
    expect(frenchTypography('« EXTERMINER ! »')).toBe(`«${N}EXTERMINER${F}!${N}»`);
  });

  it('turns straight apostrophes into curly ones', () => {
    expect(frenchTypography("L'agent Smith n'aime pas ça")).toBe('L’agent Smith n’aime pas ça');
  });

  it('puts a narrow no-break space before percent signs', () => {
    expect(frenchTypography('Humour réglé à 75 %.')).toBe(`Humour réglé à 75${F}%.`);
    expect(frenchTypography('75%')).toBe(`75${F}%`);
    expect(frenchTypography('{percent} % des visiteurs')).toBe(`{percent}${F}% des visiteurs`);
  });

  it('keeps « n° » attached to its number', () => {
    expect(frenchTypography('Duel n° {n}')).toBe(`Duel n°${N}{n}`);
    expect(frenchTypography('Duel n° 12')).toBe(`Duel n°${N}12`);
  });

  it('leaves URLs untouched', () => {
    const text = 'Va voir https://github.com/MZA-code?tab=repos, vraiment !';
    expect(frenchTypography(text)).toBe(
      `Va voir https://github.com/MZA-code?tab=repos, vraiment${F}!`,
    );
  });

  it('leaves times untouched', () => {
    expect(frenchTypography('Rendez-vous à 12:30 : sois là')).toBe(
      `Rendez-vous à 12:30${F}: sois là`,
    );
  });

  it('does not touch punctuation at the start of a text', () => {
    expect(frenchTypography('? Mystère')).toBe('? Mystère');
  });

  it('is idempotent', () => {
    const samples = [
      '« Danger, Will Robinson ! »',
      'Quoi ?! 75 % : c’est ça',
      "L'autre « truc »; voilà",
      'https://exemple.fr/a:b?c=d !',
    ];
    for (const sample of samples) {
      const once = frenchTypography(sample);
      expect(frenchTypography(once)).toBe(once);
    }
  });
});

describe('applyTypographyDeep', () => {
  it('fixes nested strings but skips protected keys', () => {
    const input = {
      title: 'Prêt ?',
      url: 'https://exemple.fr/?q=1',
      list: ['Oui !', { id: "it's-an-id", text: "C'est ça" }],
      count: 3,
    };
    expect(applyTypographyDeep(input, new Set(['url', 'id']))).toEqual({
      title: `Prêt${F}?`,
      url: 'https://exemple.fr/?q=1',
      list: [`Oui${F}!`, { id: "it's-an-id", text: 'C’est ça' }],
      count: 3,
    });
  });
});
