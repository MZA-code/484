/**
 * Validation + typographie des contenus. Indépendant de Vite et de Node :
 * reçoit les objets JSON bruts, renvoie des contenus sûrs et typés.
 */
import { z } from 'zod';
import { applyTypographyDeep } from '../lib/typography';
import { RivalriesFileSchema, UiTextsSchema, type RivalriesFile, type UiTexts } from './schema';

/** Clés dont les valeurs ne sont pas du texte affiché : jamais retouchées. */
const TECHNICAL_KEYS = new Set([
  'id',
  'theme',
  'category',
  'icon',
  'url',
  'giphyIds',
  'giphyQuery',
  'version',
]);

export class ContentError extends Error {
  constructor(file: string, error: z.ZodError) {
    super(`Contenu invalide dans ${file} :\n${z.prettifyError(error)}`);
    this.name = 'ContentError';
  }
}

function validate<T>(schema: z.ZodType<T>, raw: unknown, file: string): T {
  const result = schema.safeParse(raw);
  if (!result.success) throw new ContentError(file, result.error);
  return result.data;
}

/** Valide `content/ui-texts.fr.json` et applique la typographie française à ses textes. */
export function parseUi(raw: unknown): UiTexts {
  return applyTypographyDeep(
    validate(UiTextsSchema, raw, 'content/ui-texts.fr.json'),
    TECHNICAL_KEYS,
  );
}

/** Valide `content/rivalries.json` et applique la typographie française à ses textes. */
export function parseRivalries(raw: unknown): RivalriesFile {
  return applyTypographyDeep(
    validate(RivalriesFileSchema, raw, 'content/rivalries.json'),
    TECHNICAL_KEYS,
  );
}
