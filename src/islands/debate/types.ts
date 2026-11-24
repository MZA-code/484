/**
 * Données passées par la page Astro à l'îlot de débat. Les textes sont déjà validés
 * et corrigés typographiquement au build : l'îlot ne fait que les afficher.
 */
import type { UiTexts } from '../../data/schema';

export interface DebateTeam {
  name: string;
  origin: string;
  line: string;
  /** Remarque sur mesure quand on choisit cette team. */
  quip?: string | undefined;
}

export interface DebateRivalry {
  id: string;
  category: string;
  question?: string | undefined;
  a: DebateTeam;
  b: DebateTeam;
  /** Remarques sur mesure pour « Les deux » et « Aucun des deux ». */
  bothQuip?: string | undefined;
  noneQuip?: string | undefined;
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
  /** `finishLine` : phrase de l'écran « Catégorie terminée » (sinon le texte générique). */
  categories: { id: string; label: string; finishLine?: string | undefined }[];
  rivalries: DebateRivalry[];
  /** Icônes des boutons sous les cartes. */
  icons: Record<'both' | 'none' | 'skip' | 'share', IconPath>;
  texts: Pick<UiTexts, 'debate' | 'quips'> & {
    achievements: AchievementTexts;
    mixedLabel: string;
    linkedinUrl: string;
  };
}
