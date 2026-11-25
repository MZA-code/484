import { describe, expect, it } from 'vitest';
import { isFrenchWork } from './french-works';

describe('french works', () => {
  it('spots French works in the origin, whatever the accents', () => {
    expect(isFrenchWork('cinefr', 'Luc Besson · 1988')).toBe(true);
    expect(isFrenchWork('duos', 'Goscinny et Uderzo · 1959')).toBe(true);
    expect(isFrenchWork('dessins', 'Herge · 1929')).toBe(true);
    expect(isFrenchWork('duos', 'Eric et Ramzy · 1994')).toBe(true);
    expect(isFrenchWork('heros', 'DC · 1939')).toBe(false);
    expect(isFrenchWork('bouffe', 'Le Sud-Ouest, fièrement')).toBe(false);
  });

  it('matches markers as whole words only', () => {
    expect(isFrenchWork('autos', 'Morris · 1959')).toBe(true);
    expect(isFrenchWork('autos', 'Morrison Motors')).toBe(false);
  });
});
