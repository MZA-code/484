/**
 * Outil de curation des GIF.
 *
 * Pour chaque team sans `giphyIds`, propose 6 GIF Giphy dans une page HTML locale.
 * On coche ses préférés (on peut aussi relancer une recherche, ou changer les mots-clés),
 * puis « Enregistrer » réécrit `content/rivalries.json`.
 *
 *   npm run curate                          les 25 premières teams sans GIF choisi
 *   npm run curate -- --category bouffe     une seule catégorie
 *   npm run curate -- --limit 50            plus de teams (attention au quota Giphy)
 *   npm run curate -- --all                 y compris les teams qui ont déjà des GIF choisis
 *
 * Pour traiter d'abord les GIF signalés et les œuvres françaises : `npm run gif-audit`.
 *
 * Il faut une clé dans `.env` : GIPHY_API_KEY=…  (clé gratuite : ~100 appels par heure,
 * une recherche = un appel).
 */
import { parseArgs } from 'node:util';
import { isCurated, requireApiKey, runCuration, teamsOf } from './lib/curation';

const apiKey = requireApiKey();

const { values: args } = parseArgs({
  options: {
    category: { type: 'string' },
    limit: { type: 'string', default: '25' },
    all: { type: 'boolean', default: false },
    port: { type: 'string', default: '4843' },
  },
});

const targets = teamsOf()
  .filter((t) => !args.category || t.category === args.category)
  .filter((t) => args.all || !isCurated(t.team))
  .slice(0, Number(args.limit));

if (targets.length === 0) {
  console.log('Rien à curer : toutes les teams sélectionnées ont déjà des GIF choisis.');
  process.exit(0);
}

await runCuration({
  apiKey,
  targets,
  port: Number(args.port),
  title: 'Curation des GIF',
  intro: 'Teams sans GIF choisi à la main.',
});
