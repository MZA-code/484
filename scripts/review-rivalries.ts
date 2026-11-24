/**
 * Fiche de relecture des rivalités : tout le contenu de `content/rivalries.json`,
 * lisible d'un coup d'œil, dans `docs/relecture-rivalites.md` (fichier généré, non commité).
 *
 *   npm run content:review
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { parseRivalries } from '../src/data/parse';

const { categories, rivalries } = parseRivalries(
  JSON.parse(readFileSync(new URL('../content/rivalries.json', import.meta.url), 'utf8')),
);

const lines = [
  '# Relecture des rivalités',
  '',
  `${rivalries.length} rivalités, générées depuis \`content/rivalries.json\` (npm run content:review).`,
  'Pour corriger : modifier le JSON, puis relancer la commande.',
  '',
];
for (const category of categories) {
  const list = rivalries.filter((r) => r.category === category.id);
  lines.push(`## ${category.label} (${list.length})`, '', `*${category.tagline}*`, '');
  for (const r of list) {
    lines.push(`### ${r.question ?? `Team ${r.a.name} ou team ${r.b.name} ?`}`, '');
    for (const team of [r.a, r.b]) {
      lines.push(`- **${team.name}** — ${team.origin} — ${team.line}`);
      if (team.quip) lines.push(`  - *Si choisi :* ${team.quip}`);
    }
    if (r.bothQuip) lines.push(`- *Les deux :* ${r.bothQuip}`);
    if (r.noneQuip) lines.push(`- *Aucun des deux :* ${r.noneQuip}`);
    lines.push('');
  }
}
const out = new URL('../docs/relecture-rivalites.md', import.meta.url);
writeFileSync(out, lines.join('\n'));
console.log(`Fiche écrite : docs/relecture-rivalites.md (${rivalries.length} rivalités).`);
