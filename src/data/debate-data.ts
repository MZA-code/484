/**
 * Données du jeu pour l'îlot de débat, construites au build depuis `content/`.
 * Servies une seule fois en JSON (/data/debate.json), puis gardées en cache par le navigateur :
 * les 750 pages de débat restent légères au lieu d'embarquer chacune toutes les rivalités.
 */
import type { DebateData } from '../islands/debate/types';
import { categories, rivalries, ui, universes } from './content';

const team = ({ name, origin, line }: { name: string; origin: string; line: string }) => ({
  name,
  origin,
  line,
});

export function buildDebateData(): DebateData {
  return {
    universes: universes.map(({ id, label, categories: ids }) => ({ id, label, categories: ids })),
    categories: categories.map(({ id, label }) => ({ id, label })),
    rivalries: rivalries.map((r) => ({
      id: r.id,
      category: r.category,
      question: r.question,
      a: team(r.a),
      b: team(r.b),
    })),
    texts: {
      debate: ui.debate,
      quips: ui.quips,
      milestones: ui.milestones,
      mixedLabel: ui.home.mixedTheme.label,
      linkedinUrl: ui.links.linkedin.url,
    },
  };
}

/** Adresse du fichier de données, versionnée pour que le cache se renouvelle à chaque build. */
export const DEBATE_DATA_URL = `/data/debate.json?v=${rivalries.length}-${Date.now().toString(36)}`;
