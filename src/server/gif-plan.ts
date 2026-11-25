/**
 * Ce que le navigateur doit afficher ou demander à Giphy pour une team (voir src/lib/giphy.ts).
 * Le serveur n'appelle jamais Giphy : il tire au sort parmi les GIF choisis à la main, et
 * transmet la recherche, les mots-clés et le GIF d'ambiance de la catégorie.
 */
import type { Team } from '../data/schema';
import { keywordsFor, queryWords } from '../lib/gif-match';
import type { MoodPlan, TeamGifPlan } from '../lib/giphy';
import { teamImage, tenorGif } from './gif-links';

/** GIF d'ambiance d'une catégorie : choisis à la main, sinon une recherche générique. */
export interface CategoryMood {
  giphyIds?: readonly string[] | undefined;
  giphyQuery: string;
}

export interface PlannedGif {
  /** null : pas de GIF possible (aucun choisi à la main et pas de clé Giphy). */
  plan: TeamGifPlan | null;
  /** Durée de cache du plan dans le navigateur : un jour s'il n'y a qu'un GIF choisi, sinon une heure. */
  maxAge: number;
}

const pick = <T>(list: readonly T[], random: () => number): T | undefined =>
  list[Math.floor(random() * list.length)];

/** Le GIF d'ambiance à demander : un choisi à la main tiré au sort, sinon la recherche. */
export function moodPlan(mood: CategoryMood, random: () => number = Math.random): MoodPlan {
  return { id: pick(mood.giphyIds ?? [], random), query: mood.giphyQuery };
}

/**
 * Plan pour une team : GIF choisis à la main (liens Tenor, images du site, GIF Giphy) tirés au
 * sort ensemble ; sinon la recherche validée, puis le GIF d'ambiance de la catégorie.
 */
export function teamGifPlan(
  team: Team,
  options: {
    apiKey: string | undefined;
    mood?: CategoryMood | undefined;
    random?: () => number;
  },
): PlannedGif {
  const random = options.random ?? Math.random;
  // Liens Tenor et images du site : prêts à afficher, rien à demander à Giphy.
  const direct = [...(team.gifUrls ?? []).map(tenorGif), ...(team.images ?? []).map(teamImage)];
  const handPicked = direct.length + team.giphyIds.length;
  const maxAge = handPicked === 1 ? 86400 : 3600;
  const index = Math.floor(random() * handPicked);
  const ready = index < direct.length ? direct[index] : null;
  if (ready) return { plan: { kind: 'gif', gif: ready }, maxAge };

  if (!options.apiKey) return { plan: null, maxAge: 3600 };
  // Avec des mots-clés écrits à la main, eux seuls valident : pas de validation mot à mot.
  const words = team.giphyKeywords?.length ? [] : queryWords(team.giphyQuery);
  return {
    plan: {
      kind: 'giphy',
      key: options.apiKey,
      name: team.name,
      id: team.giphyIds[index - direct.length],
      query: team.giphyQuery,
      keywords: keywordsFor(team),
      words,
      mood: options.mood ? moodPlan(options.mood, random) : undefined,
    },
    maxAge: handPicked > 0 ? maxAge : 3600,
  };
}
