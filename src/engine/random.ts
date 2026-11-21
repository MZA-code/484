/**
 * Hasard injectable : le moteur ne lit jamais `Math.random` directement,
 * ce qui rend les tests reproductibles (même graine = même partie).
 */

/** Renvoie un nombre dans [0, 1). */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/** Générateur déterministe « mulberry32 », suffisant pour un jeu et des tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Entier aléatoire dans [0, max). */
export function randomInt(max: number, rng: Rng): number {
  return Math.floor(rng() * max);
}

/** Mélange de Fisher-Yates. Renvoie une nouvelle liste, l'originale n'est pas modifiée. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}
