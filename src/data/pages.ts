/**
 * Données communes aux pages de référencement (liste des débats, catégories, débat) :
 * question d'une rivalité, catégories avec leur univers, adresses des pages.
 */
import { categories, rivalries, ui, universes } from './content';
import { formatText } from '../lib/format';
import type { Rivalry } from './schema';

/** La question affichée pour une rivalité : la sienne, ou « Team A ou team B ? ». */
export function questionOf(rivalry: Rivalry): string {
  return (
    rivalry.question ?? formatText(ui.debate.question, { a: rivalry.a.name, b: rivalry.b.name })
  );
}

export const debatePath = (id: string) => `/debat/${id}`;
export const categoryPath = (id: string) => `/categorie/${id}`;
export const playPath = (categoryId: string) => `/jouer?theme=${categoryId}`;

export const categoryById = new Map(categories.map((c) => [c.id, c] as const));
export const universeOfCategory = new Map(
  universes.flatMap((u) => u.categories.map((id) => [id, u] as const)),
);

export function rivalriesOf(categoryId: string): Rivalry[] {
  return rivalries.filter((r) => r.category === categoryId);
}
