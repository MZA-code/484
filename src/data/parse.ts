/**
 * Validation + typographie des contenus. Indépendant de Vite et de Node :
 * reçoit les objets JSON bruts, renvoie des contenus sûrs et typés.
 */
import { z } from 'zod';
import { applyTypographyDeep } from '../lib/typography';
import {
  ContendersFileSchema,
  UiTextsSchema,
  type ContendersFile,
  type UiTexts,
} from './schema';

/** Clés dont les valeurs ne sont pas du texte affiché : jamais retouchées. */
const TECHNICAL_KEYS = new Set(['id', 'theme', 'url', 'giphyIds', 'giphyQuery', 'version']);

export interface Content {
  contenders: ContendersFile;
  ui: UiTexts;
}

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

export function parseContent(rawContenders: unknown, rawUi: unknown): Content {
  const contenders = validate(ContendersFileSchema, rawContenders, 'content/contenders.json');
  const ui = validate(UiTextsSchema, rawUi, 'content/ui-texts.fr.json');
  return {
    contenders: applyTypographyDeep(contenders, TECHNICAL_KEYS),
    ui: applyTypographyDeep(ui, TECHNICAL_KEYS),
  };
}
