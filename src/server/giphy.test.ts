import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFileCache, createMemoryCache } from './gif-cache';
import { keywordsFor, matchesKeywords, normalizeText, queryWords } from './gif-match';
import {
  createGiphyService,
  GiphyError,
  MAX_CANDIDATES,
  QUOTA_PAUSE_MS,
  SEARCH_LIMIT,
  stableIndex,
  toGif,
  TTL,
  type GifSource,
} from './giphy';

const KEY = 'secret-key-123';

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

/** Une team dont le nom est un mot-clé : les résultats « x GIF » passent la validation si q = x. */
const team = (query: string, extra: Partial<GifSource> = {}): GifSource => ({
  name: query,
  giphyIds: [],
  giphyQuery: query,
  ...extra,
});

/** Faux Giphy : répond selon le chemin et garde la trace des appels. */
function fakeFetch(handler: (url: URL) => { status?: number; body?: unknown }) {
  const calls: URL[] = [];
  const fn = vi.fn(async (input: string | URL | Request) => {
    const url = new URL(String(input));
    calls.push(url);
    const { status = 200, body = {} } = handler(url);
    return new Response(JSON.stringify(body), { status });
  });
  return { fetch: fn as unknown as typeof fetch, calls };
}

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

describe('giphy service', () => {
  it('searches in French with rating=g and returns the first validated result', async () => {
    const giphy = fakeFetch(() => ({
      body: {
        data: [
          giphyObject('cat', 'Cat Reaction'),
          giphyObject('hal', 'HAL 9000 red eye'),
          giphyObject('hal2', 'HAL 9000 again'),
        ],
      },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const gif = await service.gifFor(team('HAL 9000'));
    expect(gif?.id).toBe('hal');
    const url = giphy.calls[0] as URL;
    expect(url.pathname).toBe('/v1/gifs/search');
    expect(url.searchParams.get('q')).toBe('HAL 9000');
    expect(url.searchParams.get('rating')).toBe('g');
    expect(url.searchParams.get('lang')).toBe('fr');
    expect(url.searchParams.get('limit')).toBe(String(SEARCH_LIMIT));
    expect(url.searchParams.get('api_key')).toBe(KEY);
  });

  it('never returns a search result that matches no keyword', async () => {
    // Le cas « Les Trois Frères » : Giphy renvoie des frères, mais pas ceux-là.
    const giphy = fakeFetch(() => ({
      body: { data: [giphyObject('bros', 'Brothers hug'), giphyObject('jonas', 'Jonas Brothers')] },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const gif = await service.gifFor({
      name: 'Les Trois Frères',
      giphyIds: [],
      giphyQuery: 'Les Trois Freres',
      giphyKeywords: ['les trois freres', 'les inconnus'],
    });
    expect(gif).toBeNull();
  });

  it('accepts a result through its slug or its username', async () => {
    const giphy = fakeFetch((url) => ({
      body: {
        data:
          url.searchParams.get('q') === 'slug'
            ? [giphyObject('s', 'Untitled', { slug: 'les-trois-freres-x1y2z3' })]
            : [giphyObject('u', 'Untitled', { username: 'LesInconnus' })],
      },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const keywords = { giphyKeywords: ['Les Trois Frères', 'Les Inconnus'] };
    expect((await service.gifFor(team('slug', keywords)))?.id).toBe('s');
    expect((await service.gifFor(team('user', keywords)))?.id).toBe('u');
  });

  it('never searches when a hand-picked GIF is available, whatever its title', async () => {
    const giphy = fakeFetch((url) => ({
      body: { data: giphyObject(url.pathname.split('/').pop() as string, 'Anything at all') },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    // Un GIF choisi n'est pas soumis aux mots-clés : un humain l'a validé.
    expect((await service.gifFor(team('x', { giphyIds: ['pick'] })))?.id).toBe('pick');
    expect(giphy.calls.some((u) => u.pathname.endsWith('/search'))).toBe(false);
  });

  it('replaces a rejected GIF by the next validated one, without calling Giphy again', async () => {
    const giphy = fakeFetch(() => ({
      body: {
        data: [
          giphyObject('one', 'Batman one'),
          giphyObject('cat', 'Cat'),
          giphyObject('two', 'Batman two'),
          giphyObject('three', 'Batman three'),
        ],
      },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    expect((await service.gifFor(team('Batman')))?.id).toBe('one');
    expect((await service.gifFor(team('Batman'), new Set(['one'])))?.id).toBe('two');
    expect((await service.gifFor(team('Batman'), new Set(['one', 'two'])))?.id).toBe('three');
    expect(await service.gifFor(team('Batman'), new Set(['one', 'two', 'three']))).toBeNull();
    expect(giphy.calls).toHaveLength(1);
  });

  it('keeps at most a few candidates', async () => {
    const giphy = fakeFetch(() => ({
      body: { data: Array.from({ length: 20 }, (_, i) => giphyObject(`g${i}`, `Batman ${i}`)) },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const firsts = new Set(Array.from({ length: MAX_CANDIDATES }, (_, i) => `g${i}`));
    expect(await service.gifFor(team('Batman'), firsts)).toBeNull();
  });

  it('never rejects a hand-picked GIF automatically', async () => {
    const giphy = fakeFetch((url) => ({
      body: { data: giphyObject(url.pathname.split('/').pop() as string) },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const gif = await service.gifFor(team('x', { giphyIds: ['pick'] }), new Set(['pick']));
    expect(gif?.id).toBe('pick');
  });

  it('falls back to word-level matching when no exact phrase matches', async () => {
    // « Contrôler la météo » : Giphy ne reprend jamais la phrase exacte « weather control ».
    const giphy = fakeFetch(() => ({
      body: {
        data: [
          giphyObject('cat', 'Cat Reaction'),
          giphyObject('storm', 'Weather Map Storm Timelapse'),
          giphyObject('exact', 'Weather Control Machine'),
        ],
      },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const source = { name: 'Contrôler la météo', giphyIds: [], giphyQuery: 'weather control' };
    // La correspondance exacte passe en premier, la correspondance mot à mot ensuite.
    expect((await service.gifFor(source))?.id).toBe('exact');
    expect((await service.gifFor(source, new Set(['exact'])))?.id).toBe('storm');
    expect(await service.gifFor(source, new Set(['exact', 'storm']))).toBeNull();
  });

  it('keeps hand-written keywords strict: no word-level matching', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('t', 'Taxi Driver')] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const source = team('Taxi film Marseille', { giphyKeywords: ['Samy Naceri'] });
    expect(await service.gifFor(source)).toBeNull();
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
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const fallback = { giphyQuery: 'difficult choice' };
    const genius = {
      name: 'Le génie qu’on ne croit pas',
      giphyIds: [],
      giphyQuery: 'ignored genius',
      fallback,
    };
    const gif = await service.gifFor(genius);
    expect(gif?.id).toMatch(/^mood\d$/);
    // Même team, même GIF ; le GIF hors sujet de la recherche n'est jamais utilisé.
    expect((await service.gifFor(genius))?.id).toBe(gif?.id);
    // Les GIF d'ambiance trop signalés sont écartés eux aussi.
    expect((await service.gifFor(genius, new Set([gif?.id as string])))?.id).not.toBe(gif?.id);
    // Une seule recherche d'ambiance pour toute la catégorie.
    await service.gifFor({ ...genius, name: 'Autre team', giphyQuery: 'other' });
    expect(giphy.calls.filter((u) => u.searchParams.get('q') === 'difficult choice')).toHaveLength(
      1,
    );
  });

  it('prefers the hand-picked mood GIFs of the category', async () => {
    const giphy = fakeFetch((url) =>
      url.pathname.endsWith('/search')
        ? { body: { data: [] } }
        : { body: { data: giphyObject(url.pathname.split('/').pop() as string) } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const fallback = { giphyIds: ['moodpick'], giphyQuery: 'ignored' };
    expect((await service.gifFor(team('nothing', { fallback })))?.id).toBe('moodpick');
  });

  it('spreads stable indexes', () => {
    expect(stableIndex('Batman', 5)).toBe(stableIndex('Batman', 5));
    const spread = new Set(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((t) => stableIndex(`Team ${t}`, 5)),
    );
    expect(spread.size).toBeGreaterThan(2);
    expect(stableIndex('x', 0)).toBe(0);
  });

  it('reuses the candidate lists cached by the previous version', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [] } }));
    const cache = createMemoryCache();
    const old = toGif(giphyObject('old', 'Batman old'));
    cache.set('s:batman|k:batman', [old as NonNullable<typeof old>], TTL.search);
    // Ancienne liste vide : on refait la recherche (le mot à mot peut trouver mieux).
    cache.set('s:weather|k:weather', [], TTL.empty);
    const single = toGif(giphyObject('single', 'Robin'));
    cache.set('q:robin|k:robin', single, TTL.search);
    const service = createGiphyService({ apiKey: KEY, cache, fetch: giphy.fetch });
    expect((await service.gifFor(team('Batman')))?.id).toBe('old');
    expect((await service.gifFor(team('Robin')))?.id).toBe('single');
    expect(giphy.calls).toHaveLength(0);
    await service.gifFor(team('weather'));
    expect(giphy.calls).toHaveLength(1);
  });

  it('searches again when the keywords change', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('g', 'Tonton flingueur')] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    expect(await service.gifFor(team('q', { giphyKeywords: ['tontons'] }))).toBeNull();
    expect((await service.gifFor(team('q', { giphyKeywords: ['flingueur'] })))?.id).toBe('g');
    expect(giphy.calls).toHaveLength(2);
  });

  it('uses a hand-picked GIF when there is one', async () => {
    const giphy = fakeFetch((url) => ({
      body: { data: giphyObject(url.pathname.split('/').pop() as string) },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
      random: () => 0.99,
    });
    const gif = await service.gifFor(team('ignored', { giphyIds: ['pick1', 'pick2'] }));
    expect(gif?.id).toBe('pick2');
    expect(giphy.calls[0]?.pathname).toBe('/v1/gifs/pick2');
  });

  it('falls back to the search when a hand-picked GIF has disappeared', async () => {
    const giphy = fakeFetch((url) =>
      url.pathname.endsWith('/search')
        ? { body: { data: [giphyObject('found')] } }
        : { body: { data: {} } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    expect((await service.gifFor(team('found', { giphyIds: ['gone'] })))?.id).toBe('found');
  });

  it('returns null when the search finds nothing', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    expect(await service.gifFor(team('nothing'))).toBeNull();
  });

  it('caches results, including empty ones', async () => {
    const giphy = fakeFetch((url) => ({
      body: { data: url.searchParams.get('q') === 'empty' ? [] : [giphyObject('x')] },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    await service.gifFor(team('R2-D2'));
    await service.gifFor(team('r2-d2 '));
    await service.gifFor(team('empty'));
    await service.gifFor(team('empty'));
    expect(giphy.calls).toHaveLength(2);
  });

  it('makes a single call for simultaneous requests', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('x')] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    await Promise.all([1, 2, 3].map(() => service.gifFor(team('same'))));
    expect(giphy.calls).toHaveLength(1);
  });

  it('throws a GiphyError without leaking the key', async () => {
    const giphy = fakeFetch(() => ({ status: 429 }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const error = await service.gifFor(team('q')).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GiphyError);
    expect((error as GiphyError).status).toBe(429);
    expect(String((error as Error).message)).not.toContain(KEY);
  });

  it('stops calling Giphy for a while after a quota error, then retries', async () => {
    let now = 0;
    let quota = true;
    const giphy = fakeFetch(() =>
      quota ? { status: 429 } : { body: { data: [giphyObject('back', 'two is back')] } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(() => now),
      fetch: giphy.fetch,
      now: () => now,
    });
    await expect(service.gifFor(team('one'))).rejects.toThrow();
    await expect(service.gifFor(team('two'))).rejects.toThrow();
    expect(giphy.calls).toHaveLength(1);
    quota = false;
    now += QUOTA_PAUSE_MS;
    expect((await service.gifFor(team('two')))?.id).toBe('back');
    expect(giphy.calls).toHaveLength(2);
  });

  it('does not cache failures', async () => {
    let fail = true;
    const giphy = fakeFetch(() =>
      fail ? { status: 500 } : { body: { data: [giphyObject('ok', 'q is ok')] } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    await expect(service.gifFor(team('q'))).rejects.toThrow();
    fail = false;
    expect((await service.gifFor(team('q')))?.id).toBe('ok');
  });
});

describe('gif caches', () => {
  const gif = toGif(giphyObject('cached'));
  let dir: string | null = null;
  afterEach(() => {
    vi.useRealTimers();
    if (dir) rmSync(dir, { recursive: true, force: true });
    dir = null;
  });

  it('expires entries after their TTL', () => {
    let now = 0;
    const cache = createMemoryCache(() => now);
    cache.set('k', gif, 1000);
    expect(cache.get('k')).toEqual(gif);
    now = 1000;
    expect(cache.get('k')).toBeUndefined();
  });

  it('distinguishes a cached empty result from a missing entry', () => {
    const cache = createMemoryCache();
    expect(cache.get('k')).toBeUndefined();
    cache.set('k', null, TTL.empty);
    expect(cache.get('k')).toBeNull();
  });

  it('persists to a file and reloads it', () => {
    vi.useFakeTimers();
    dir = mkdtempSync(join(tmpdir(), 'gif-cache-'));
    const file = join(dir, 'nested', 'cache.json');
    createFileCache(file).set('q:hal', gif, TTL.search);
    vi.advanceTimersByTime(2500);
    expect(JSON.parse(readFileSync(file, 'utf8'))).toHaveProperty('q:hal');
    expect(createFileCache(file).get('q:hal')).toEqual(gif);
  });

  it('starts empty when the file is missing or corrupted', () => {
    expect(createFileCache(join(tmpdir(), 'does-not-exist-484.json')).get('x')).toBeUndefined();
  });
});
