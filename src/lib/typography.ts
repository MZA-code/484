/**
 * Typographie française appliquée automatiquement aux textes au moment du build,
 * pour ne pas dépendre de la saisie dans les fichiers JSON.
 *
 * Règles :
 * - espace fine insécable (U+202F) avant `; : ! ?` et avant `%` ;
 * - espace insécable (U+00A0) à l'intérieur des guillemets « » ;
 * - apostrophe courbe ’ à la place de l'apostrophe droite '.
 *
 * La fonction est idempotente : l'appliquer deux fois donne le même résultat.
 * Les URL présentes dans le texte ne sont jamais modifiées, ni les heures (12:30).
 */

export const NARROW_NBSP = String.fromCharCode(0x202f);
export const NBSP = String.fromCharCode(0xa0);

/** Espaces qu'on remplace : espace normale, insécable, fine insécable, fine. */
const SPACES = '[ \\u00A0\\u202F\\u2009]';

const URL_PATTERN = /https?:\/\/\S+/g;

function fixSegment(text: string): string {
  return (
    text
      // Apostrophe droite → courbe.
      .replace(/'/g, '’')
      // Guillemets : insécable après « et avant ».
      .replace(new RegExp(`«${SPACES}*`, 'g'), `«${NBSP}`)
      .replace(new RegExp(`${SPACES}*»`, 'g'), `${NBSP}»`)
      // Ponctuation haute : une fine insécable avant le groupe (« ?! » reste collé).
      // Le lookbehind exige un caractère visible avant, pour ne pas toucher un début de ligne.
      .replace(
        new RegExp(`(?<=\\S)${SPACES}*([;:!?]+)`, 'g'),
        (match, punct: string, offset: number, whole: string) => {
          // Heures et ratios (« 12:30 ») : on ne touche à rien.
          const before = whole[offset - 1] ?? '';
          const after = whole[offset + match.length] ?? '';
          if (punct === ':' && match === ':' && /\d/.test(before) && /\d/.test(after)) {
            return match;
          }
          return `${NARROW_NBSP}${punct}`;
        },
      )
      // Pourcentages : « 75 % », y compris après un marqueur (« {percent} % »).
      .replace(new RegExp(`(?<=[\\d}])${SPACES}*%`, 'g'), `${NARROW_NBSP}%`)
  );
}

/** Applique les règles de typographie française à un texte. */
export function frenchTypography(text: string): string {
  let result = '';
  let cursor = 0;
  for (const match of text.matchAll(URL_PATTERN)) {
    const start = match.index;
    result += fixSegment(text.slice(cursor, start)) + match[0];
    cursor = start + match[0].length;
  }
  return result + fixSegment(text.slice(cursor));
}

/**
 * Applique `frenchTypography` à toutes les chaînes d'une structure JSON,
 * sauf aux valeurs des clés listées (identifiants, URL, requêtes techniques…).
 */
export function applyTypographyDeep<T>(value: T, skipKeys: ReadonlySet<string>): T {
  const walk = (node: unknown): unknown => {
    if (typeof node === 'string') return frenchTypography(node);
    if (Array.isArray(node)) return node.map(walk);
    if (node !== null && typeof node === 'object') {
      return Object.fromEntries(
        Object.entries(node).map(([key, child]) => [key, skipKeys.has(key) ? child : walk(child)]),
      );
    }
    return node;
  };
  return walk(value) as T;
}
