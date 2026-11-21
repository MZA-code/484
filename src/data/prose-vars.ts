/** Valeurs des variables des pages d'information ({email}, {rivalries}…), calculées depuis le contenu. */
import { categories, rivalries, ui, universes } from './content';
import type { PROSE_VARIABLES } from './schema';

export const proseVars: Readonly<Record<(typeof PROSE_VARIABLES)[number], string>> = {
  email: ui.site.email,
  domain: ui.site.domain,
  rivalries: new Intl.NumberFormat('fr-FR').format(rivalries.length),
  categories: String(categories.length),
  universes: String(universes.length),
};
