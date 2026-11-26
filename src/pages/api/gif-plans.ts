/**
 * GET /api/gif-plans?teams=rivalite/a,rivalite/b,… → les plans de GIF de plusieurs teams en une
 * réponse (voir src/server/team-gif.ts) : le navigateur prépare les prochains duels d'un coup,
 * puis demande à Giphy tous les GIF choisis à la main du lot en un seul appel (D45).
 *
 * Le serveur n'appelle jamais Giphy (règle de GIPHY pour le web) : il renvoie des plans, que le
 * navigateur exécute (src/lib/giphy.ts).
 * Priorité : GIF choisis à la main (`giphyIds`, liens Tenor `gifUrls` et images du site
 * `images`, tirés au sort ensemble) > recherche validée > GIF d'ambiance de la catégorie > rien.
 *
 * - 200 { plans: { "rivalite/a": plan | null, … } }   teams inconnues absentes ;
 *   null = rien de choisi à la main et clé Giphy absente
 * - 400 liste vide ou trop longue
 * Le client affiche le cadre sans GIF dans tous les cas d'erreur : le jeu ne bloque jamais.
 */
import type { APIRoute } from 'astro';
import type { TeamGifPlan } from '../../lib/giphy';
import { gifJson as json } from '../../server/giphy-runtime';
import { teamPlanFor } from '../../server/team-gif';

export const prerender = false;

/** Teams par requête au plus (le navigateur en demande 48 : voir PLANS_PER_REQUEST). */
const MAX_TEAMS = 60;

export const GET: APIRoute = ({ url }) => {
  const keys = [...new Set((url.searchParams.get('teams') ?? '').split(',').filter(Boolean))];
  if (keys.length === 0 || keys.length > MAX_TEAMS) {
    return json({ error: 'bad-teams' }, 400, 'no-store');
  }
  const plans: Record<string, TeamGifPlan | null> = {};
  let maxAge = 86400;
  for (const key of keys) {
    const result = teamPlanFor(key);
    if (!result) continue;
    plans[key] = result.plan;
    maxAge = Math.min(maxAge, result.plan ? result.maxAge : 0);
  }
  return json({ plans }, 200, maxAge > 0 ? `public, max-age=${maxAge}` : 'no-store');
};
