/** Plan du site pour les moteurs de recherche : toutes les pages publiques, en adresses absolues. */
import type { APIRoute } from 'astro';
import { allPublicPaths } from '../data/site-map';

export const prerender = true;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url;
  const urls = allPublicPaths()
    .map((path) => `  <url><loc>${escapeXml(new URL(path, base).href)}</loc></url>`)
    .join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
