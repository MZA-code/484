/**
 * Outils du référencement : adresses absolues, débats voisins, données structurées (schema.org).
 * Fonctions pures, sans dépendance au contenu : testées à part.
 */

/** Adresse absolue d'un chemin du site (« /debats » → « https://team484.fr/debats »). */
export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href;
}

/**
 * Débats voisins d'une rivalité dans sa catégorie : les suivants dans l'ordre du contenu,
 * en repartant du début. Stable d'un build à l'autre, et chaque débat est lié par plusieurs autres.
 */
export function relatedRivalries<T extends { id: string; category: string }>(
  rivalry: T,
  all: readonly T[],
  count: number,
): T[] {
  const same = all.filter((r) => r.category === rivalry.category);
  const index = same.findIndex((r) => r.id === rivalry.id);
  const related: T[] = [];
  for (let step = 1; step < same.length && related.length < count; step++) {
    const next = same[(index + step) % same.length];
    if (next) related.push(next);
  }
  return related;
}

export interface Crumb {
  name: string;
  /** Chemin de la page ; absent pour la page courante. */
  path?: string | undefined;
}

/** Fil d'Ariane au format schema.org (BreadcrumbList). */
export function breadcrumbJsonLd(
  crumbs: readonly Crumb[],
  currentPath: string,
  site: URL | string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path ?? currentPath, site),
    })),
  };
}

/** Liste ordonnée de pages (ItemList), pour les pages qui recensent des débats. */
export function itemListJsonLd(
  name: string,
  items: readonly { name: string; path: string }[],
  site: URL | string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path, site),
    })),
  };
}

/**
 * Sérialise des données structurées pour une balise <script type="application/ld+json">.
 * `<` est échappé : un texte du contenu ne peut pas fermer la balise.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
