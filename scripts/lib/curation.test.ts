import { describe, expect, it } from 'vitest';
import { handPickedIds, isCurated, readLinks } from './curation';

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
