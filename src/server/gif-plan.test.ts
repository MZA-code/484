import { describe, expect, it } from 'vitest';
import type { Team } from '../data/schema';
import { moodPlan, teamGifPlan } from './gif-plan';

const team = (extra: Partial<Team> = {}): Team => ({
  name: 'Batman',
  origin: 'DC · 1939',
  line: 'Un justicier.',
  giphyIds: [],
  giphyQuery: 'Batman dark knight',
  ...extra,
});
const TENOR = 'https://media.tenor.com/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif';
const IMAGE = '/images/teams/tazos-18035d40.webp';
const first = () => 0;
const last = () => 0.999;

describe('GIF plan of a team', () => {
  it('serves a Tenor link or a site image ready to show, without Giphy', () => {
    const tenor = teamGifPlan(team({ gifUrls: [TENOR] }), { apiKey: undefined });
    expect(tenor.plan).toMatchObject({ kind: 'gif', gif: { id: 'tenormG35Af7nn9Y' } });
    expect(tenor.maxAge).toBe(86400);
    const image = teamGifPlan(team({ images: [IMAGE] }), { apiKey: 'k' });
    expect(image.plan).toMatchObject({ kind: 'gif', gif: { webp: IMAGE } });
  });

  it('draws among all hand-picked GIFs, Giphy ones included', () => {
    const t = team({ gifUrls: [TENOR], giphyIds: ['g1'] });
    expect(teamGifPlan(t, { apiKey: 'k', random: first }).plan?.kind).toBe('gif');
    const giphy = teamGifPlan(t, { apiKey: 'k', random: last });
    expect(giphy.plan).toMatchObject({ kind: 'giphy', id: 'g1' });
    expect(giphy.maxAge).toBe(3600);
  });

  it('tells the browser what to search, how to validate it and what to skip', () => {
    const { plan, maxAge } = teamGifPlan(team(), {
      apiKey: 'web-key',
      mood: { giphyIds: ['m1'], giphyQuery: 'difficult choice' },
      rejected: new Set(['bad1']),
      random: first,
    });
    expect(plan).toEqual({
      kind: 'giphy',
      key: 'web-key',
      name: 'Batman',
      id: undefined,
      query: 'Batman dark knight',
      keywords: ['batman', 'batman dark knight'],
      words: ['batman', 'dark', 'knight'],
      rejected: ['bad1'],
      mood: { id: 'm1', query: 'difficult choice' },
    });
    expect(maxAge).toBe(3600);
  });

  it('keeps hand-written keywords strict: no word-level validation', () => {
    const { plan } = teamGifPlan(team({ giphyKeywords: ['bruce wayne'] }), { apiKey: 'k' });
    expect(plan).toMatchObject({ keywords: ['bruce wayne'], words: [] });
  });

  it('has nothing to offer without hand-picked GIFs nor Giphy key', () => {
    expect(teamGifPlan(team(), { apiKey: undefined }).plan).toBeNull();
  });
});

describe('mood plan of a category', () => {
  it('draws a hand-picked mood GIF, else searches', () => {
    expect(moodPlan({ giphyIds: ['a', 'b'], giphyQuery: 'q' }, last)).toEqual({
      id: 'b',
      query: 'q',
    });
    expect(moodPlan({ giphyQuery: 'q' })).toEqual({ id: undefined, query: 'q' });
  });
});
