/**
 * /og/<id>.png : image de partage d'un débat (id d'une rivalité), ou du site (id « site »).
 * Dessinée à la demande puis mise en cache (voir src/server/og.ts).
 */
import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';
import { categories, rivalries, ui } from '../../data/content';
import { renderDebateImage, renderSiteImage, type OgTexts } from '../../server/og';
import { SITE_IMAGE_ID } from '../../lib/og-path';

export const prerender = false;

const byId = new Map(rivalries.map((r) => [r.id, r] as const));
const categoryLabel = new Map(categories.map((c) => [c.id, c.label] as const));

const texts: OgTexts = {
  logo: ui.site.logo,
  name: ui.site.name,
  team: ui.debate.team,
  vs: ui.debate.vs,
  cta: ui.og.cta,
  domain: ui.site.domain,
  heroLines: ui.home.title,
};

export const GET: APIRoute = async ({ params }) => {
  const id = params.id ?? '';
  const rivalry = byId.get(id);
  if (id !== SITE_IMAGE_ID && !rivalry) return new Response('Not found', { status: 404 });

  const cacheDir = getSecret('OG_CACHE_DIR') ?? 'data/og';
  try {
    const png = rivalry
      ? await renderDebateImage(
          {
            id: rivalry.id,
            category: categoryLabel.get(rivalry.category) ?? '',
            a: rivalry.a.name,
            b: rivalry.b.name,
          },
          texts,
          cacheDir,
        )
      : await renderSiteImage(texts, cacheDir);
    return new Response(new Uint8Array(png), {
      headers: {
        'Content-Type': 'image/png',
        // Un jour en cache, puis rafraîchie en arrière-plan : les textes changent rarement.
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[og] rendu impossible :', error);
    return new Response('Image unavailable', { status: 500 });
  }
};
