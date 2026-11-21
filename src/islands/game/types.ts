/**
 * Données passées par la page Astro à l'îlot de jeu. Les textes sont déjà validés
 * et corrigés typographiquement au build : l'îlot ne fait que les afficher.
 */
import type { UiTexts } from '../../data/schema';

export interface GameContender {
  id: string;
  theme: string;
  name: string;
  origin: string;
  line: string;
}

export interface GameData {
  themes: { id: string; label: string }[];
  contenders: GameContender[];
  texts: Pick<UiTexts, 'duel' | 'quips' | 'milestones' | 'panels'> & {
    mixedLabel: string;
    linkedinUrl: string;
  };
}
