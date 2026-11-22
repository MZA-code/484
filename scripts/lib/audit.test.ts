import { describe, expect, it } from 'vitest';
import { isFrenchWork, reportsByTeam, sortByReports } from './audit';

describe('gif audit', () => {
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

  it('adds up reports per team and sorts the most reported first', () => {
    const reports = reportsByTeam([
      { rivalryId: 'r1', team: 'a', gifId: 'g1', reports: 2 },
      { rivalryId: 'r1', team: 'a', gifId: 'g2', reports: 1 },
      { rivalryId: 'r2', team: 'b', gifId: 'g3', reports: 5 },
    ]);
    expect(reports.get('r1/a')).toEqual({
      total: 3,
      gifs: new Map([
        ['g1', 2],
        ['g2', 1],
      ]),
    });
    const order = sortByReports(
      [{ key: 'r0/a' }, { key: 'r1/a' }, { key: 'r2/b' }, { key: 'r3/a' }],
      reports,
    );
    expect(order.map((t) => t.key)).toEqual(['r2/b', 'r1/a', 'r0/a', 'r3/a']);
  });
});
