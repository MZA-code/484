/**
 * robots.txt : tout le site est ouvert, y compris aux robots des moteurs IA (GEO),
 * sauf les routes techniques de l'API.
 */
import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = ({ site, url }) => {
  const sitemap = new URL('/sitemap.xml', site ?? url).href;
  const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${sitemap}
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
