/**
 * llms.txt (https://llmstxt.org) : présentation du site pour les assistants IA,
 * en Markdown, avec les liens vers les pages utiles et toutes les catégories.
 */
import type { APIRoute } from 'astro';
import { categories, ui } from '../data/content';
import { categoryPath, rivalriesOf } from '../data/pages';
import { proseVars } from '../data/prose-vars';
import { formatText } from '../lib/format';
import { parseInline } from '../lib/inline';

export const prerender = true;

/** Texte brut d'un texte de contenu : variables remplies, liens réduits à leur libellé. */
const plain = (text: string) =>
  parseInline(text, proseVars)
    .map((s) => s.text)
    .join('');

export const GET: APIRoute = ({ site, url }) => {
  const abs = (path: string) => new URL(path, site ?? url).href;
  const link = (label: string, path: string, about: string) =>
    `- [${label}](${abs(path)}): ${about}`;
  const t = ui.llms;
  const lines = [
    `# ${ui.site.title}`,
    '',
    `> ${ui.site.description}`,
    '',
    t.intro,
    '',
    `## ${t.pagesTitle}`,
    '',
    link(
      ui.debatesPage.title,
      '/debats',
      formatText(ui.debatesPage.description, { rivalries: proseVars.rivalries }),
    ),
    link(ui.pages.about.title, '/a-propos', plain(ui.pages.about.description)),
    link(ui.hallOfFame.title, '/hall-of-fame', ui.hallOfFame.intro),
    link(
      t.fullLinkLabel,
      '/llms-full.txt',
      formatText(t.fullLinkAbout, { rivalries: proseVars.rivalries }),
    ),
    '',
    `## ${t.categoriesTitle}`,
    '',
    ...categories.map((c) =>
      link(
        c.label,
        categoryPath(c.id),
        `${c.tagline} (${formatText(t.debatesCount, { n: rivalriesOf(c.id).length })})`,
      ),
    ),
    '',
    `## ${t.infoTitle}`,
    '',
    link(ui.pages.mentions.title, '/mentions-legales', plain(ui.pages.mentions.description)),
    link(ui.pages.privacy.title, '/confidentialite', plain(ui.pages.privacy.description)),
    link(ui.pages.accessibility.title, '/accessibilite', plain(ui.pages.accessibility.description)),
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
};
