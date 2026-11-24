import { describe, expect, it } from 'vitest';
import type { DebateRivalry } from './types';
import { customQuip } from './useDebate';

const team = (name: string, quip?: string) => ({ name, origin: 'o', line: 'l', quip });

describe('customQuip', () => {
  const rivalry: DebateRivalry = {
    id: 'heros-a-b',
    category: 'heros',
    a: team('A', 'Team A : bravo.'),
    b: team('B'),
    bothQuip: 'Les deux : bravo.',
  };

  it('renvoie la remarque écrite pour le choix', () => {
    expect(customQuip(rivalry, 'a')).toBe('Team A : bravo.');
    expect(customQuip(rivalry, 'both')).toBe('Les deux : bravo.');
  });

  it('renvoie undefined sans remarque écrite (on retombe sur les génériques)', () => {
    expect(customQuip(rivalry, 'b')).toBeUndefined();
    expect(customQuip(rivalry, 'none')).toBeUndefined();
    expect(customQuip(undefined, 'a')).toBeUndefined();
  });
});
