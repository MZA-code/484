import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFileCache, createMemoryCache } from './gif-cache';
import { createGiphyService, GiphyError, QUOTA_PAUSE_MS, toGif, TTL } from './giphy';

const KEY = 'secret-key-123';

function giphyObject(id: string) {
  return {
    id,
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

describe('giphy service', () => {
  it('searches with rating=g and returns the first result', async () => {
    const giphy = fakeFetch(() => ({
      body: { data: [giphyObject('first'), giphyObject('second')] },
    }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const gif = await service.gifFor({ giphyIds: [], giphyQuery: 'HAL 9000' });
    expect(gif?.id).toBe('first');
    const url = giphy.calls[0] as URL;
    expect(url.pathname).toBe('/v1/gifs/search');
    expect(url.searchParams.get('q')).toBe('HAL 9000');
    expect(url.searchParams.get('rating')).toBe('g');
    expect(url.searchParams.get('limit')).toBe('1');
    expect(url.searchParams.get('api_key')).toBe(KEY);
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
    const gif = await service.gifFor({ giphyIds: ['pick1', 'pick2'], giphyQuery: 'ignored' });
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
    expect((await service.gifFor({ giphyIds: ['gone'], giphyQuery: 'q' }))?.id).toBe('found');
  });

  it('returns null when the search finds nothing', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    expect(await service.gifFor({ giphyIds: [], giphyQuery: 'nothing' })).toBeNull();
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
    await service.gifFor({ giphyIds: [], giphyQuery: 'R2-D2' });
    await service.gifFor({ giphyIds: [], giphyQuery: 'r2-d2 ' });
    await service.gifFor({ giphyIds: [], giphyQuery: 'empty' });
    await service.gifFor({ giphyIds: [], giphyQuery: 'empty' });
    expect(giphy.calls).toHaveLength(2);
  });

  it('makes a single call for simultaneous requests', async () => {
    const giphy = fakeFetch(() => ({ body: { data: [giphyObject('x')] } }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    await Promise.all([1, 2, 3].map(() => service.gifFor({ giphyIds: [], giphyQuery: 'same' })));
    expect(giphy.calls).toHaveLength(1);
  });

  it('throws a GiphyError without leaking the key', async () => {
    const giphy = fakeFetch(() => ({ status: 429 }));
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    const error = await service.gifFor({ giphyIds: [], giphyQuery: 'q' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GiphyError);
    expect((error as GiphyError).status).toBe(429);
    expect(String((error as Error).message)).not.toContain(KEY);
  });

  it('stops calling Giphy for a while after a quota error, then retries', async () => {
    let now = 0;
    let quota = true;
    const giphy = fakeFetch(() =>
      quota ? { status: 429 } : { body: { data: [giphyObject('back')] } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(() => now),
      fetch: giphy.fetch,
      now: () => now,
    });
    await expect(service.gifFor({ giphyIds: [], giphyQuery: 'one' })).rejects.toThrow();
    await expect(service.gifFor({ giphyIds: [], giphyQuery: 'two' })).rejects.toThrow();
    expect(giphy.calls).toHaveLength(1);
    quota = false;
    now += QUOTA_PAUSE_MS;
    expect((await service.gifFor({ giphyIds: [], giphyQuery: 'two' }))?.id).toBe('back');
    expect(giphy.calls).toHaveLength(2);
  });

  it('does not cache failures', async () => {
    let fail = true;
    const giphy = fakeFetch(() =>
      fail ? { status: 500 } : { body: { data: [giphyObject('ok')] } },
    );
    const service = createGiphyService({
      apiKey: KEY,
      cache: createMemoryCache(),
      fetch: giphy.fetch,
    });
    await expect(service.gifFor({ giphyIds: [], giphyQuery: 'q' })).rejects.toThrow();
    fail = false;
    expect((await service.gifFor({ giphyIds: [], giphyQuery: 'q' }))?.id).toBe('ok');
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
