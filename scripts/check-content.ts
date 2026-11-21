/**
 * Vérifie les fichiers de `content/` et affiche un résumé, sans lancer tout le build.
 *
 *   npm run content:check
 */
import { readFileSync } from 'node:fs';
import { ContentError, parseContent, parseRivalries } from '../src/data/parse';

const readJson = (file: string): unknown =>
  JSON.parse(readFileSync(new URL(`../content/${file}`, import.meta.url), 'utf8'));

try {
  const { contenders, ui } = parseContent(
    readJson('contenders.json'),
    readJson('ui-texts.fr.json'),
  );
  console.log('Contenus valides.\n');
  for (const theme of contenders.themes) {
    const list = contenders.contenders.filter((c) => c.theme === theme.id);
    const curated = list.filter((c) => c.giphyIds.length > 0).length;
    console.log(
      `  ${theme.label.padEnd(24)} ${String(list.length).padStart(3)} prétendants · ${curated} avec GIF choisis`,
    );
  }
  console.log(`\n  Total : ${contenders.contenders.length} prétendants`);
  const { categories, rivalries } = parseRivalries(readJson('rivalries.json'));
  console.log(`
  Rivalités : ${rivalries.length}`);
  for (const category of categories) {
    const n = rivalries.filter((r) => r.category === category.id).length;
    console.log(`    ${category.label.padEnd(22)} ${String(n).padStart(3)}`);
  }
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
