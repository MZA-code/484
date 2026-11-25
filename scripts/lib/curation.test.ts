import { describe, expect, it } from 'vitest';
import {
  changeTeam,
  copyChosen,
  handPickedIds,
  isCurated,
  readLinks,
  teamsOf,
  twinsOf,
  type RawTeam,
} from './curation';

describe('curation links', () => {
  it('sorts pasted links into Tenor links, Giphy ids and unknown lines', () => {
    const text = [
      'https://media1.tenor.com/m/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif',
      '  https://giphy.com/gifs/batman-l0HlvtIPzPdt2usKs  ',
      'https://media.tenor.com/mG35Af7nn9YAAAAM/cuisine-americaine-eddy-mitchell.gif',
      'https://example.com/chat.gif',
      '',
    ].join('\n');
    expect(readLinks(text)).toEqual({
      // Deux versions du même GIF Tenor : un seul lien gardé.
      tenor: ['https://media.tenor.com/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif'],
      giphy: ['l0HlvtIPzPdt2usKs'],
      images: [],
      // Un autre site : une image à importer sur le site.
      toImport: ['https://example.com/chat.gif'],
      invalid: [],
    });
  });

  it('keeps site images, imports files of the computer, refuses the rest', () => {
    const text = [
      '/images/teams/les-ripoux-1a2b3c4d.webp',
      '"C:\\Users\\moi\\Images\\tazos 1.jpg"',
      'pas un lien',
    ].join('\r\n');
    expect(readLinks(text)).toMatchObject({
      images: ['/images/teams/les-ripoux-1a2b3c4d.webp'],
      toImport: ['C:\\Users\\moi\\Images\\tazos 1.jpg'],
      invalid: ['pas un lien'],
    });
  });

  it('counts Tenor links as hand-picked GIFs', () => {
    const team = {
      name: 'Eddy Mitchell',
      origin: 'Les Chaussettes noires · 1961',
      giphyIds: [],
      giphyQuery: 'Eddy Mitchell',
      gifUrls: ['https://media.tenor.com/4Pm3OjjE7BEAAAAC/eddy-mitchell-claude-moine.gif'],
    };
    expect(isCurated(team)).toBe(true);
    expect(handPickedIds(team)).toEqual(['tenor4Pm3OjjE7BE']);
    expect(isCurated({ ...team, gifUrls: [] })).toBe(false);
    expect(
      handPickedIds({ ...team, gifUrls: [], images: ['/images/teams/x-0a0b0c0d.anim.webp'] }),
    ).toEqual(['img0a0b0c0d']);
  });
});

describe('changeTeam', () => {
  const TENOR = 'https://media.tenor.com/4Pm3OjjE7BEAAAAC/eddy-mitchell-claude-moine.gif';
  const team = (): RawTeam => ({
    name: 'Batman',
    origin: 'DC · 1939',
    giphyIds: ['old1'],
    giphyQuery: 'Batman',
    giphyKeywords: ['batman'],
  });
  const noImport = () => Promise.reject(new Error('pas d’import'));

  it('replaces the lists it is given, and leaves the others alone', async () => {
    const t = team();
    await changeTeam(
      t,
      { giphyIds: ['new1', 'new1', '../bad'], gifUrls: [TENOR, 'nope'] },
      noImport,
    );
    expect(t.giphyIds).toEqual(['new1']);
    expect(t.gifUrls).toEqual([TENOR]);
    expect(t.giphyQuery).toBe('Batman');
    await changeTeam(t, { gifUrls: [] }, noImport);
    expect(t).not.toHaveProperty('gifUrls');
  });

  it('adds pasted links, imports images and reports what it could not use', async () => {
    const t = team();
    const problems = await changeTeam(
      t,
      {
        links: [
          'https://giphy.com/gifs/batman-l0HlvtIPzPdt2usKs',
          TENOR,
          'https://example.com/chat.gif',
          'C:\\introuvable.png',
          'pas un lien',
        ].join('\n'),
      },
      (source) =>
        source.startsWith('https://')
          ? Promise.resolve('/images/teams/batman-0a0b0c0d.webp')
          : Promise.reject(new Error('fichier introuvable')),
    );
    expect(t.giphyIds).toEqual(['old1', 'l0HlvtIPzPdt2usKs']);
    expect(t.gifUrls).toEqual([TENOR]);
    expect(t.images).toEqual(['/images/teams/batman-0a0b0c0d.webp']);
    expect(problems).toEqual([
      'pas un lien (lien non reconnu)',
      'C:\\introuvable.png (fichier introuvable)',
    ]);
  });

  it('updates the automatic search, and falls back to default keywords when emptied', async () => {
    const t = team();
    await changeTeam(
      t,
      { giphyQuery: '  dark knight  ', giphyKeywords: 'bruce wayne, batman ' },
      noImport,
    );
    expect(t.giphyQuery).toBe('dark knight');
    expect(t.giphyKeywords).toEqual(['bruce wayne', 'batman']);
    await changeTeam(t, { giphyQuery: ' ', giphyKeywords: '' }, noImport);
    expect(t.giphyQuery).toBe('dark knight');
    expect(t).not.toHaveProperty('giphyKeywords');
  });
});

describe('twins', () => {
  const base = { giphyIds: [], giphyQuery: 'x' };
  const file = {
    rivalries: [
      {
        id: 'r1',
        category: 'c',
        a: { ...base, name: 'Batman', origin: 'DC · 1939', giphyIds: ['g1'], images: ['/i.webp'] },
        b: { ...base, name: 'Superman', origin: 'DC · 1938' },
      },
      {
        id: 'r2',
        category: 'c',
        a: { ...base, name: 'Batman', origin: 'DC · 1939', gifUrls: ['https://t'] },
        b: { ...base, name: 'Robin', origin: 'DC · 1940' },
      },
      {
        id: 'r3',
        category: 'c',
        a: { ...base, name: 'Batman', origin: 'Tim Burton · 1989' },
        b: { ...base, name: 'Joker', origin: 'DC · 1940' },
      },
    ],
  };

  it('finds the same team in other duels (same name and origin), and copies its GIFs', () => {
    const all = teamsOf(file);
    const twins = twinsOf(all[0]!, all);
    expect(twins.map((t) => t.key)).toEqual(['r2/a']);
    copyChosen(all[0]!.team, twins[0]!.team);
    expect(twins[0]!.team).toMatchObject({ giphyIds: ['g1'], images: ['/i.webp'] });
    expect(twins[0]!.team).not.toHaveProperty('gifUrls');
  });
});
