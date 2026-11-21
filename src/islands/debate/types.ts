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

export interface DebateData {
  universes: { id: string; label: string; categories: string[] }[];
  categories: { id: string; label: string }[];
  rivalries: DebateRivalry[];
  texts: Pick<UiTexts, 'debate' | 'quips' | 'milestones'> & {
    mixedLabel: string;
    linkedinUrl: string;
  };
}
