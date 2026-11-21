/** Couleurs des cartes (direction artistique du prototype). */
export const CARD_COLORS = [
  '#FFD23F',
  '#FF6FA8',
  '#43C6F0',
  '#66E08A',
  '#FF8A3D',
  '#B69CFF',
  '#F5F1E8',
  '#FF5A4E',
] as const;

export type CardColor = (typeof CARD_COLORS)[number];

/** Hachage FNV-1a 32 bits : rapide, stable d'une version à l'autre. */
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Couleur attribuée de façon stable à un prétendant, d'après son identifiant. */
export function colorFor(contenderId: string): CardColor {
  return CARD_COLORS[hashString(contenderId) % CARD_COLORS.length] as CardColor;
}

/**
 * Brassage final d'un hachage (finaliseur de MurmurHash3) : les bits de poids faible de FNV-1a
 * varient trop peu entre deux textes voisins pour choisir une couleur avec un simple modulo.
 */
function mix(hash: number): number {
  let h = hash;
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 0;
}

/**
 * Couleurs des deux teams d'une rivalité : stables, et toujours différentes l'une de l'autre.
 * Les 56 paires possibles sont toutes utilisées : B est choisie parmi les 7 couleurs restantes.
 */
export function teamColors(rivalryId: string): [CardColor, CardColor] {
  const n = CARD_COLORS.length;
  const h = mix(hashString(rivalryId));
  const a = h % n;
  const b = (a + 1 + (Math.floor(h / n) % (n - 1))) % n;
  return [CARD_COLORS[a] as CardColor, CARD_COLORS[b] as CardColor];
}
