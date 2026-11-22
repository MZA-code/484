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
      invalid: ['https://example.com/chat.gif'],
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
  });
});
