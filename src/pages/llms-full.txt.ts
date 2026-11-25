/**
 * llms-full.txt (https://llmstxt.org) : toutes les rivalités en Markdown, catégorie par catégorie,
 * pour qu'un assistant IA puisse citer un débat précis sans parcourir les 1 000 pages du site.
 * Les remarques révélées après le vote n'y figurent pas : elles restent la surprise du jeu.
 */
import type { APIRoute } from 'astro';
import { categories, ui } from '../data/content';
import { categoryPath, debatePath, questionOf, rivalriesOf } from '../data/pages';

export const prerender = true;

export const GET: APIRoute = ({ site, url }) => {
  const abs = (path: string) => new URL(path, site ?? url).href;
  const t = ui.llms;
  const team = (x: { name: string; origin: string; line: string }) =>
    `${x.name} (${x.origin}) : ${x.line}`;
  const lines = [`# ${t.fullTitle}`, '', `> ${ui.site.description}`, '', t.fullIntro, ''];
  for (const c of categories) {
    lines.push(`## [${c.label}](${abs(categoryPath(c.id))})`, '', c.tagline, '');
    for (const r of rivalriesOf(c.id)) {
      lines.push(`- [${questionOf(r)}](${abs(debatePath(r.id))}) — ${team(r.a)} / ${team(r.b)}`);
    }
    lines.push('');
  }
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
