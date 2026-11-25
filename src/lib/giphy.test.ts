import { describe, expect, it, vi } from 'vitest';
import { keywordsFor, matchesKeywords, normalizeText, queryWords } from './gif-match';
import {
  createGiphyClient,
  GiphyError,
  SEARCH_LIMIT,
  stableIndex,
  thumbnailOf,
  toGif,
  type TeamGiphyPlan,
} from './giphy';

const KEY = 'web-key-123';

function giphyObject(
  id: string,
  title = `${id} GIF`,
  extra: { slug?: string; username?: string } = {},
) {
  return {
    id,
    title,
    ...extra,
    images: {
      fixed_height: {
        mp4: `https://media.giphy.com/media/${id}/200.mp4`,
        webp: `https://media.giphy.com/media/${id}/200.webp`,
        width: '356',
        height: '200',
      },
      fixed_height_still: { url: `https://media.giphy.com/media/${id}/200_s.gif` },
    },
  };
}

/** Plan d'une team dont le nom est un mot-clé : les résultats « x GIF » passent si q = x. */
const plan = (query: string, extra: Partial<TeamGiphyPlan> = {}): TeamGiphyPlan => ({
  kind: 'giphy',
  key: KEY,
  name: query,
  query,
  keywords: keywordsFor({ name: query, giphyQuery: query }),
  words: queryWords(query),
  ...extra,
});

/** Faux Giphy : répond selon le chemin et garde la trace des appels. */
function fakeFetch(handler: (url: URL) => { status?: number; body?: unknown }) {
  const calls: URL[] = [];
  const fn = vi.fn(async (input: string) => {
    const url = new URL(input);
    calls.push(url);
    const { status = 200, body = {} } = handler(url);
    return new Response(JSON.stringify(body), { status });
  });
  return { fetch: fn, calls };
}

const client = (giphy: ReturnType<typeof fakeFetch>) =>
  createGiphyClient({ apiKey: KEY, fetch: giphy.fetch });
const byPath = (url: URL) => ({
  body: { data: giphyObject(url.pathname.split('/').pop() as string) },
});

describe('toGif', () => {
  it('keeps only the light renditions', () => {
    expect(toGif(giphyObject('abc'))).toEqual({
      id: 'abc',
      mp4: 'https://media.giphy.com/media/abc/200.mp4',
      webp: 'https://media.giphy.com/media/abc/200.webp',
      still: 'https://media.giphy.com/media/abc/200_s.gif',
      width: 356,
      height: 200,
    });
  });

  it('keeps the small rendition for thumbnails when Giphy has one', () => {
    const raw = giphyObject('abc');
    const withSmall = {
      ...raw,
      images: {
        ...raw.images,
        fixed_height_small: { mp4: 'small.mp4', webp: 'small.webp' },
        fixed_height_small_still: { url: 'small_s.gif' },
      },
    };
    const gif = toGif(withSmall);
    expect(gif?.small).toEqual({ mp4: 'small.mp4', webp: 'small.webp', still: 'small_s.gif' });
    expect(thumbnailOf(gif as NonNullable<typeof gif>)).toEqual({
      id: 'abc',
      mp4: 'small.mp4',
      webp: 'small.webp',
      still: 'small_s.gif',
    });
    // Sans petit rendu (ancien cache), la vignette reprend le rendu normal.
    const plain = toGif(raw);
    expect(thumbnailOf(plain as NonNullable<typeof plain>).mp4).toBe(plain?.mp4);
  });

  it('returns null when a rendition is missing', () => {
    expect(toGif(undefined)).toBeNull();
    expect(toGif({ id: 'x', images: {} })).toBeNull();
  });
});

describe('keyword validation', () => {
  it('normalizes accents, case, ligatures and punctuation', () => {
    expect(normalizeText('  Les Trois Frères !')).toBe('les trois freres');
    expect(normalizeText('L’Œuvre — Dîner_de-cons')).toBe('l oeuvre diner de cons');
  });

  it('matches a keyword in the title, slug or username', () => {
    const keywords = ['Les Trois Frères'];
    expect(matchesKeywords({ title: 'LES TROIS FRERES GIF' }, keywords)).toBe(true);
    expect(matchesKeywords({ slug: 'les-trois-freres-abc123' }, keywords)).toBe(true);
    expect(matchesKeywords({ username: 'lestroisfreres' }, keywords)).toBe(true);
    expect(
      matchesKeywords({ title: 'Brothers', slug: 'brothers-xyz', username: 'bros' }, keywords),
    ).toBe(false);
  });

  it('needs only one of the keywords', () => {
    expect(
      matchesKeywords({ title: 'Les Inconnus sketch' }, ['Les Trois Frères', 'Les Inconnus']),
    ).toBe(true);
  });

  it('matches whole words only in titles and slugs', () => {
    expect(matchesKeywords({ title: 'DC Comics' }, ['DC'])).toBe(true);
    expect(matchesKeywords({ title: 'Déclic' }, ['DC'])).toBe(false);
    expect(matchesKeywords({ title: 'Superman flies' }, ['Superman'])).toBe(true);
    expect(matchesKeywords({ title: 'Supermanga' }, ['Superman'])).toBe(false);
  });

  it('rejects everything when there is nothing to compare', () => {
    expect(matchesKeywords({}, ['Batman'])).toBe(false);
    expect(matchesKeywords({ title: 'Batman' }, [])).toBe(false);
    expect(matchesKeywords({ title: 'Batman' }, ['  ', '!!'])).toBe(false);
  });

  it('defaults to the name without its article, and the search query', () => {
    expect(keywordsFor({ name: 'Les Jedi', giphyQuery: 'Jedi lightsaber' })).toEqual([
      'jedi',
      'jedi lightsaber',
    ]);
    expect(keywordsFor({ name: 'Dark Vador', giphyQuery: 'Darth Vader' })).toEqual([
      'dark vador',
      'darth vader',
    ]);
    expect(keywordsFor({ name: 'L’Arme fatale', giphyQuery: 'Lethal Weapon' })).toContain(
      'arme fatale',
    );
  });

  it('extracts the meaningful words of a query', () => {
    expect(queryWords('weather control')).toEqual(['weather', 'control']);
    expect(queryWords('Taxi film Marseille')).toEqual(['taxi', 'marseille']);
    expect(queryWords('PUBG pan')).toEqual(['pubg']);
    expect(queryWords('the cute cat')).toEqual([]);
  });

  it('uses only the hand-written keywords when there are some', () => {
    expect(
      keywordsFor({ name: 'Taxi', giphyQuery: 'Taxi film', giphyKeywords: ['Samy Naceri'] }),
    ).toEqual(['Samy Naceri']);
  });
});

describe('giphy client (browser)', () => {
  it('searches in French with rating=g, straight from the browser, and keeps URLs intact', async () => {
    const raw = giphyObject('x1', 'Batman');
    raw.images.fixed_height.mp4 += '?cid=abc&rid=200.mp4';
    const giphy = fakeFetch(() => ({ body: { data: [raw] } }));
    const gif = await client(giphy).teamGif(plan('Batman'));
    const [url] = giphy.calls;
    expect(`${url?.origin}${url?.pathname}`).toBe('https://api.giphy.com/v1/gifs/search');
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({
      api_key: KEY,
      q: 'Batman',
      limit: String(SEARCH_LIMIT),
      rating: 'g',
      lang: 'fr',
    });
    // Adresses telles que Giphy les renvoie, paramètres compris (règle de GIPHY).
    expect(gif?.mp4).toBe('https://media.giphy.com/media/x1/200.mp4?cid=abc&rid=200.mp4');
  });

  it('never returns a search result that matches no keyword', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('off', 'Cute cat')] } }));
    expect(await client(giphy).teamGif(plan('Batman'))).toBeNull();
  });

  it('asks first for the hand-picked GIF drawn by the server, without searching', async () => {
    const giphy = fakeFetch(byPath);
    expect((await client(giphy).teamGif(plan('Batman', { id: 'pick1' })))?.id).toBe('pick1');
    expect(giphy.calls.map((u) => u.pathname)).toEqual(['/v1/gifs/pick1']);
  });

  it('falls back to the search when a hand-picked GIF has disappeared', async () => {
    const giphy = fakeFetch((url) =>
      url.pathname.endsWith('/search')
        ? { body: { data: [giphyObject('s1', 'Batman')] } }
        : { status: 404, body: {} },
    );
    expect((await client(giphy).teamGif(plan('Batman', { id: 'gone' })))?.id).toBe('s1');
  });

  it('prefers whole keywords, then meaningful words of the query', async () => {
    const giphy = fakeFetch(() => ({
      body: { data: [giphyObject('w1', 'Dark knight rises'), giphyObject('k1', 'Batman')] },
    }));
    const p = plan('Batman dark knight', { keywords: ['batman'] });
    expect((await client(giphy).teamGif(p))?.id).toBe('k1');
    // Sans mot-clé entier, le mot à mot de la recherche valide le résultat.
    expect((await client(giphy).teamGif({ ...p, keywords: ['robin'] }))?.id).toBe('w1');
    // Sans validation large (mots-clés écrits à la main), le mot à mot n'est pas utilisé.
    expect(await client(giphy).teamGif({ ...p, keywords: ['robin'], words: [] })).toBeNull();
  });

  it('uses the category mood GIF as a last resort, spread over the teams', async () => {
    const giphy = fakeFetch((url) => ({
      body: {
        data:
          url.searchParams.get('q') === 'difficult choice'
            ? Array.from({ length: 5 }, (_, i) => giphyObject(`mood${i}`, `Choice ${i}`))
            : [giphyObject('off', 'Totally unrelated')],
      },
    }));
    const genius = plan('ignored genius', {
      name: 'Le génie qu’on ne croit pas',
      mood: { query: 'difficult choice' },
    });
    const gif = await client(giphy).teamGif(genius);
    expect(gif?.id).toMatch(/^mood\d$/);
    // Même team, même GIF ; le GIF hors sujet de la recherche n'est jamais utilisé.
    expect((await client(giphy).teamGif(genius))?.id).toBe(gif?.id);
  });

  it('prefers the hand-picked mood GIF drawn by the server', async () => {
    const giphy = fakeFetch((url) =>
      url.pathname.endsWith('/search') ? { body: { data: [] } } : byPath(url),
    );
    const p = plan('nothing', { mood: { id: 'moodpick', query: 'ignored' } });
    expect((await client(giphy).teamGif(p))?.id).toBe('moodpick');
  });

  it('gives each category a thumbnail: hand-picked, else the first mood result', async () => {
    const giphy = fakeFetch((url) =>
      url.pathname.endsWith('/search')
        ? { body: { data: [giphyObject('mood0', 'Choice'), giphyObject('mood1', 'Choice')] } }
        : byPath(url),
    );
    expect((await client(giphy).categoryGif({ query: 'difficult choice' }))?.id).toBe('mood0');
    expect((await client(giphy).categoryGif({ id: 'pick', query: 'x' }))?.id).toBe('pick');
  });

  it('returns null when the search finds nothing', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [] } }));
    expect(await client(giphy).teamGif(plan('Batman'))).toBeNull();
  });

  it('keeps nothing between two requests: each one asks Giphy again', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('x1', 'Batman')] } }));
    const c = client(giphy);
    await c.teamGif(plan('Batman'));
    await c.teamGif(plan('Batman'));
    expect(giphy.calls).toHaveLength(2);
  });

  it('throws a GiphyError without leaking the key', async () => {
    const giphy = fakeFetch(() => ({ status: 500 }));
    const error = await client(giphy)
      .teamGif(plan('Batman'))
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GiphyError);
    expect((error as Error).message).not.toContain(KEY);
  });

  it('stops calling Giphy for the rest of the visit after a quota error', async () => {
    const giphy = fakeFetch(() => ({ status: 429 }));
    const c = client(giphy);
    await expect(c.teamGif(plan('Batman'))).rejects.toThrow(GiphyError);
    expect(c.quotaExceeded).toBe(true);
    await expect(c.teamGif(plan('Robin'))).rejects.toThrow(GiphyError);
    expect(giphy.calls).toHaveLength(1);
  });

  it('spreads stable indexes', () => {
    const indexes = new Set(['a', 'b', 'c', 'd', 'e', 'f'].map((t) => stableIndex(`team ${t}`, 5)));
    expect(indexes.size).toBeGreaterThan(1);
    expect(stableIndex('x', 0)).toBe(0);
  });
});
