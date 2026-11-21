/** Pages publiques du site, pour le plan du site (sitemap.xml) et llms.txt. */
import { categories, rivalries } from './content';
import { categoryPath, debatePath } from './pages';

/** Pages fixes, dans l'ordre d'importance. Le jeu (/jouer) n'y figure pas : son contenu change à chaque visite. */
export const STATIC_PAGES = [
  '/',
  '/debats',
  '/hall-of-fame',
  '/a-propos',
  '/projets',
  '/mentions-legales',
  '/confidentialite',
  '/accessibilite',
] as const;

export function allPublicPaths(): string[] {
  return [
    ...STATIC_PAGES,
    ...categories.map((c) => categoryPath(c.id)),
    ...rivalries.map((r) => debatePath(r.id)),
  ];
}
