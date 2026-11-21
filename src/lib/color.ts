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

/** Couleurs des deux teams d'une rivalité : stables, et toujours différentes l'une de l'autre. */
export function teamColors(rivalryId: string): [CardColor, CardColor] {
  const n = CARD_COLORS.length;
  const a = hashString(`${rivalryId}:a`) % n;
  let b = hashString(`${rivalryId}:b`) % n;
  if (b === a) b = (b + 1) % n;
  return [CARD_COLORS[a] as CardColor, CARD_COLORS[b] as CardColor];
}
