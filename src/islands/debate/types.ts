/**
 * Données passées par la page Astro à l'îlot de débat. Les textes sont déjà validés
 * et corrigés typographiquement au build : l'îlot ne fait que les afficher.
 */
import type { UiTexts } from '../../data/schema';

export interface DebateTeam {
  name: string;
  origin: string;
  line: string;
}

export interface DebateRivalry {
  id: string;
  category: string;
  question?: string | undefined;
  a: DebateTeam;
  b: DebateTeam;
}

/** Dessin SVG d'une icône, préparé au build (l'îlot n'embarque pas toute la bibliothèque). */
export interface IconPath {
  viewBox: string;
  path: string;
}

/** Textes des achievements, chacun avec le dessin de son icône. */
export type AchievementTexts = Omit<UiTexts['achievements'], 'list'> & {
  list: (UiTexts['achievements']['list'][number] & { svg: IconPath })[];
};

export interface DebateData {
  universes: { id: string; label: string; categories: string[] }[];
  categories: { id: string; label: string }[];
  rivalries: DebateRivalry[];
  texts: Pick<UiTexts, 'debate' | 'quips'> & {
    achievements: AchievementTexts;
    mixedLabel: string;
    linkedinUrl: string;
  };
}
