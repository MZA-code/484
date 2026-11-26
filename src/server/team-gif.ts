/**
 * Plan du GIF d'une team (« rivalité/a » ou « rivalité/b ») : ce que le navigateur doit afficher
 * ou demander à Giphy (voir src/server/gif-plan.ts et src/lib/giphy.ts). Utilisé par
 * /api/gif-plans, qui renvoie les plans de plusieurs teams en une seule réponse.
 */
import { categories, rivalries } from '../data/content';
import type { TeamGifPlan } from '../lib/giphy';
import { teamGifPlan } from './gif-plan';
import { placeholderGif } from './gif-placeholder';
import { getGiphyKey, giphyOffline, placeholdersOff } from './giphy-runtime';

const byId = new Map(rivalries.map((r) => [r.id, r]));
/** GIF d'ambiance de chaque catégorie, en dernier recours. */
const moodOf = new Map(
  categories.map((c) => [c.id, { giphyIds: c.giphyIds, giphyQuery: c.giphyQuery }]),
);

export interface TeamPlanResult {
  /** null : pas de GIF possible (rien de choisi à la main et pas de clé Giphy). */
  plan: TeamGifPlan | null;
  /** Durée de cache conseillée au navigateur, en secondes (0 : ne pas garder). */
  maxAge: number;
}

/** Plan pour une team ; undefined si la team est inconnue. */
export function teamPlanFor(gifKey: string): TeamPlanResult | undefined {
  const [rivalryId, side, ...rest] = gifKey.split('/');
  const rivalry = byId.get(rivalryId ?? '');
  if (!rivalry || rest.length > 0 || (side !== 'a' && side !== 'b')) return undefined;
  const { plan, maxAge } = teamGifPlan(rivalry[side], {
    apiKey: getGiphyKey(),
    mood: moodOf.get(rivalry.category),
  });
  // Mode sans Giphy (développement) : un GIF de remplacement au lieu de Giphy.
  if (!plan && giphyOffline() && !placeholdersOff()) {
    const gif = placeholderGif(rivalry[side].name, `${rivalry.id}-${side}`);
    return { plan: { kind: 'gif', gif }, maxAge: 0 };
  }
  return { plan, maxAge };
}
