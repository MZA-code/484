import { describe, expect, it } from 'vitest';
import { pickQuip, quipCategory, shareOutcome, type QuipBook } from './quips';
import { seededRng } from './random';

const book: QuipBook = {
  high: ['h0', 'h1', 'h2'],
  mid: ['m0', 'm1'],
  low: ['l0', 'l1'],
  neutral: ['n0', 'n1'],
};

const share = (percent: number) => ({ kind: 'share', percent }) as const;

describe('quipCategory', () => {
  it('is high from 60 %', () => {
    expect(quipCategory(share(60))).toBe('high');
    expect(quipCategory(share(100))).toBe('high');
  });

  it('is mid between 40 and 59 %', () => {
    expect(quipCategory(share(59))).toBe('mid');
    expect(quipCategory(share(40))).toBe('mid');
  });

  it('is low under 40 %', () => {
    expect(quipCategory(share(39))).toBe('low');
    expect(quipCategory(share(0))).toBe('low');
  });

  it('is neutral without a percentage', () => {
    expect(quipCategory({ kind: 'unavailable' })).toBe('neutral');
    expect(quipCategory({ kind: 'first' })).toBe('neutral');
  });
});

describe('shareOutcome', () => {
  it('is unavailable when the API did not answer', () => {
    expect(shareOutcome(null)).toEqual({ kind: 'unavailable' });
  });

  it('is a first vote under 5 votes on the pair', () => {
    expect(shareOutcome({ chosenVotes: 0, totalVotes: 0 })).toEqual({ kind: 'first' });
    expect(shareOutcome({ chosenVotes: 3, totalVotes: 4 })).toEqual({ kind: 'first' });
  });

  it('gives a rounded percentage from 5 votes', () => {
    expect(shareOutcome({ chosenVotes: 3, totalVotes: 5 })).toEqual(share(60));
    expect(shareOutcome({ chosenVotes: 2, totalVotes: 3 * 1000 })).toEqual(share(0));
    expect(shareOutcome({ chosenVotes: 119, totalVotes: 200 })).toEqual(share(60));
  });

  it('uses the rounded percentage for the category, so what you see matches the quip', () => {
    // 59,5 % s'affiche « 60 % » : la remarque doit être celle de la majorité.
    expect(quipCategory(shareOutcome({ chosenVotes: 119, totalVotes: 200 }))).toBe('high');
  });
});

describe('pickQuip', () => {
  it('picks from the right category', () => {
    const quip = pickQuip(book, 'mid', null, seededRng(1));
    expect(['m0', 'm1']).toContain(quip.text);
    expect(quip.key).toMatch(/^mid:\d$/);
  });

  it('never repeats the same quip twice in a row', () => {
    const rng = seededRng(4);
    let last: string | null = null;
    for (let i = 0; i < 500; i++) {
      const quip = pickQuip(book, 'high', last, rng);
      expect(quip.key).not.toBe(last);
      last = quip.key;
    }
  });

  it('still uses every quip of the category', () => {
    const rng = seededRng(9);
    const seen = new Set<string>();
    let last: string | null = null;
    for (let i = 0; i < 100; i++) {
      const quip = pickQuip(book, 'high', last, rng);
      seen.add(quip.text);
      last = quip.key;
    }
    expect(seen).toEqual(new Set(['h0', 'h1', 'h2']));
  });

  it('works with a single quip in a category', () => {
    const single: QuipBook = { ...book, low: ['only'] };
    const first = pickQuip(single, 'low', null, seededRng(1));
    expect(pickQuip(single, 'low', first.key, seededRng(1)).text).toBe('only');
  });
});
