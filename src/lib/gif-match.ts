/**
 * Validation d'un résultat de recherche Giphy par mots-clés.
 *
 * Un résultat n'est accepté que si son titre, son slug ou le nom de son auteur contient au moins
 * un des mots-clés de la team. La comparaison ignore les accents, la casse et la ponctuation :
 * « Les Trois Frères » correspond au slug « les-trois-freres-abc123 ».
 */

/** Ce que Giphy dit d'un GIF, en texte. */
export interface GifText {
  title?: string | undefined;
  slug?: string | undefined;
  username?: string | undefined;
}

/** Minuscules, sans accents ; tout ce qui n'est ni lettre ni chiffre devient une espace. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

const compact = (value: string) => value.replace(/ /g, '');

/** Le mot-clé apparaît-il en mots entiers dans le texte (« dc » oui dans « dc comics », non dans « dclic ») ? */
function containsWords(haystack: string, keyword: string): boolean {
  return ` ${haystack} `.includes(` ${keyword} `);
}

/**
 * Vrai si au moins un mot-clé apparaît dans le titre, le slug ou le nom d'auteur.
 * Le nom d'auteur s'écrit sans espaces (« lesinconnus ») : il est comparé mots-clés collés.
 */
export function matchesKeywords(gif: GifText, keywords: readonly string[]): boolean {
  const title = normalizeText(gif.title ?? '');
  const slug = normalizeText(gif.slug ?? '');
  const username = compact(normalizeText(gif.username ?? ''));
  return keywords.some((raw) => {
    const keyword = normalizeText(raw);
    if (!keyword) return false;
    return (
      containsWords(title, keyword) ||
      containsWords(slug, keyword) ||
      (username !== '' && username.includes(compact(keyword)))
    );
  });
}

/** Mots trop vagues pour valider un GIF à eux seuls. */
const VAGUE_WORDS = new Set([
  'the',
  'and',
  'with',
  'from',
  'that',
  'this',
  'your',
  'dans',
  'pour',
  'avec',
  'film',
  'movie',
  'show',
  'series',
  'cartoon',
  'anime',
  'funny',
  'meme',
  'reaction',
  'scene',
  'cute',
  'animated',
]);

/**
 * Mots significatifs d'une requête (4 lettres ou plus, hors mots vagues) : la validation
 * « mot à mot », pour les teams qui sont des idées (« contrôler la météo » → « weather control »)
 * plutôt que des noms propres, dont Giphy ne reprend jamais la phrase exacte.
 */
export function queryWords(query: string): string[] {
  const words = normalizeText(query)
    .split(' ')
    .filter((w) => w.length >= 4 && !VAGUE_WORDS.has(w));
  return [...new Set(words)];
}

/** Articles retirés en tête du nom : « Les Jedi » doit accepter un GIF titré « Jedi ». */
const LEADING_ARTICLE = /^(le|la|les|l|un|une|des|du|the)\s+/;

/**
 * Mots-clés d'une team : ceux écrits dans `giphyKeywords`, sinon son nom (sans article)
 * et sa requête de recherche (souvent le nom anglais : « Darth Vader » pour Dark Vador).
 */
export function keywordsFor(team: {
  name: string;
  giphyQuery: string;
  giphyKeywords?: readonly string[] | undefined;
}): string[] {
  if (team.giphyKeywords && team.giphyKeywords.length > 0) return [...team.giphyKeywords];
  const name = normalizeText(team.name).replace(LEADING_ARTICLE, '');
  return [...new Set([name, normalizeText(team.giphyQuery)].filter(Boolean))];
}
