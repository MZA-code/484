/** Outils partagés par les tests du moteur. */
import { createCatalog } from './catalog';
import type { GameContext } from './game';
import { seededRng } from './random';

/** Petit catalogue : « a » (6 prétendants), « b » (3), « duo » (2, cas limite). */
export function makeContext(seed = 42, milestones: number[] = [10, 25]): GameContext {
  const contenders = [
    ...['a1', 'a2', 'a3', 'a4', 'a5', 'a6'].map((id) => ({ id, theme: 'a' })),
    ...['b1', 'b2', 'b3'].map((id) => ({ id, theme: 'b' })),
    ...['d1', 'd2'].map((id) => ({ id, theme: 'duo' })),
  ];
  return {
    catalog: createCatalog(['a', 'b', 'duo'], contenders),
    rng: seededRng(seed),
    milestones,
  };
}
