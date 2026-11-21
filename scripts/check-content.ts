/**
 * Vérifie les fichiers de `content/` et affiche un résumé, sans lancer tout le build.
 *
 *   npm run content:check
 */
import { readFileSync } from 'node:fs';
import { ContentError, parseRivalries, parseUi } from '../src/data/parse';

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'));

try {
  const ui = parseUi(readJson('ui-texts.fr.json'));
  const { categories, rivalries } = parseRivalries(readJson('rivalries.json'));
  console.log('Contenus valides.\n');
  for (const category of categories) {
    const list = rivalries.filter((r) => r.category === category.id);
    const teams = list.flatMap((r) => [r.a, r.b]);
    const curated = teams.filter((t) => t.giphyIds.length > 0).length;
    console.log(
      `  ${category.label.padEnd(22)} ${String(list.length).padStart(3)} rivalités · ${curated}/${teams.length} teams avec GIF choisis`,
    );
  }
  console.log(`\n  Total : ${rivalries.length} rivalités`);
  const quips = Object.values(ui.quips).reduce((n, list) => n + list.length, 0);
  console.log(
    `  ${quips} remarques · ${Object.keys(ui.milestones).length} paliers · ${ui.projects.length} projets`,
  );
} catch (error) {
  if (error instanceof ContentError || error instanceof SyntaxError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
