/**
 * Données du jeu pour l'îlot de débat, construites au build depuis `content/`.
 * Servies une seule fois en JSON (/data/debate.json), puis gardées en cache par le navigateur :
 * les 750 pages de débat restent légères au lieu d'embarquer chacune toutes les rivalités.
 */
import type { DebateData, DebateTeam } from '../islands/debate/types';
import { iconSvg } from '../lib/icons';
import { categories, rivalries, ui, universes } from './content';

const team = ({ name, origin, line, quip }: DebateTeam) => ({ name, origin, line, quip });

export function buildDebateData(): DebateData {
  return {
    universes: universes.map(({ id, label, categories: ids }) => ({ id, label, categories: ids })),
    categories: categories.map(({ id, label, finish }) => ({
      id,
      label,
      finishLine: finish?.line,
    })),
    rivalries: rivalries.map((r) => ({
      id: r.id,
      category: r.category,
      question: r.question,
      a: team(r.a),
      b: team(r.b),
      bothQuip: r.bothQuip,
      noneQuip: r.noneQuip,
    })),
    icons: {
      both: iconSvg('handshake'),
      none: iconSvg('ban'),
      skip: iconSvg('forward'),
      share: iconSvg('share-nodes'),
    },
    texts: {
      debate: ui.debate,
      quips: ui.quips,
      achievements: {
        ...ui.achievements,
        list: ui.achievements.list.map((a) => ({ ...a, svg: iconSvg(a.icon) })),
      },
      mixedLabel: ui.home.mixedTheme.label,
      linkedinUrl: ui.links.linkedin.url,
    },
  };
}

/** Adresse du fichier de données, versionnée pour que le cache se renouvelle à chaque build. */
export const DEBATE_DATA_URL = `/data/debate.json?v=${rivalries.length}-${Date.now().toString(36)}`;
