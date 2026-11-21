import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  breadcrumbJsonLd,
  itemListJsonLd,
  relatedRivalries,
  serializeJsonLd,
} from './seo';

const SITE = 'https://team484.fr';
const r = (id: string, category = 'cat') => ({ id, category });

describe('absoluteUrl', () => {
  it('resolves a path against the site', () => {
    expect(absoluteUrl('/debats', SITE)).toBe('https://team484.fr/debats');
  });
});

describe('relatedRivalries', () => {
  const all = [r('a'), r('x', 'other'), r('b'), r('c'), r('d')];

  it('takes the next rivalries of the same category, wrapping around', () => {
    expect(relatedRivalries(r('c'), all, 3).map((x) => x.id)).toEqual(['d', 'a', 'b']);
  });

  it('never returns the rivalry itself, even when asking for too many', () => {
    expect(relatedRivalries(r('a'), all, 10).map((x) => x.id)).toEqual(['b', 'c', 'd']);
  });
});

describe('structured data', () => {
  it('builds a breadcrumb with absolute URLs, the last one being the current page', () => {
    const data = breadcrumbJsonLd(
      [{ name: 'Accueil', path: '/' }, { name: 'Débat' }],
      '/debat/x',
      SITE,
    );
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://team484.fr/' },
      { '@type': 'ListItem', position: 2, name: 'Débat', item: 'https://team484.fr/debat/x' },
    ]);
  });

  it('builds an item list', () => {
    const data = itemListJsonLd('Liste', [{ name: 'Un', path: '/debat/un' }], SITE);
    expect(data.numberOfItems).toBe(1);
    expect(data.itemListElement[0]?.url).toBe('https://team484.fr/debat/un');
  });

  it('escapes < so content cannot close the script tag', () => {
    expect(serializeJsonLd({ name: '</script><b>' })).not.toContain('</script>');
  });
});
