import { describe, expect, it } from 'vitest';
import { canonicalTenorUrl, giphyIdFromUrl, isTenorUrl, tenorGif, tenorGifId } from './gif-links';

const EDDY = 'https://media.tenor.com/4Pm3OjjE7BEAAAAM/eddy-mitchell-claude-moine.gif';
const CUISINE = 'https://media1.tenor.com/m/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif';

describe('Tenor links', () => {
  it('accepts image links copied from tenor.com, in both forms', () => {
    expect(isTenorUrl(EDDY)).toBe(true);
    expect(isTenorUrl(CUISINE)).toBe(true);
    expect(isTenorUrl('https://media.tenor.com/4Pm3OjjE7BEAAAPo/x.mp4')).toBe(true);
  });

  it('refuses anything else', () => {
    for (const url of [
      'http://media.tenor.com/4Pm3OjjE7BEAAAAM/eddy.gif',
      'https://tenor.com/view/eddy-mitchell-gif-12345',
      'https://media.tenor.com.evil.example/4Pm3OjjE7BEAAAAM/eddy.gif',
      'https://evil.example/4Pm3OjjE7BEAAAAM/eddy.gif',
      'https://media.tenor.com/4Pm3OjjE7BEAAAAM/eddy.gif?x=1',
      'https://media.tenor.com/short/eddy.gif',
      'https://media.tenor.com/4Pm3OjjE7BEAAAAM/eddy.exe',
      'pas une adresse',
    ]) {
      expect(isTenorUrl(url)).toBe(false);
    }
  });

  it('stores every link under one canonical form', () => {
    expect(canonicalTenorUrl(CUISINE)).toBe(
      'https://media.tenor.com/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif',
    );
    expect(canonicalTenorUrl(EDDY)).toBe(
      'https://media.tenor.com/4Pm3OjjE7BEAAAAC/eddy-mitchell-claude-moine.gif',
    );
  });

  it('serves the light MP4 and a still image, like a Giphy GIF', () => {
    expect(tenorGif(CUISINE)).toEqual({
      id: 'tenormG35Af7nn9Y',
      mp4: 'https://media.tenor.com/mG35Af7nn9YAAAPo/cuisine-americaine-eddy-mitchell.mp4',
      webp: 'https://media.tenor.com/mG35Af7nn9YAAAAx/cuisine-americaine-eddy-mitchell.webp',
      still: 'https://media.tenor.com/mG35Af7nn9YAAAAe/cuisine-americaine-eddy-mitchell.png',
      width: 0,
      height: 0,
    });
  });

  it('gives an id that the « Mauvais GIF ? » report accepts', () => {
    expect(tenorGifId('https://media.tenor.com/ab-cd_ef123AAAAM/x.gif')).toBe('tenorabcdef123');
    expect(tenorGifId(EDDY)).toMatch(/^[A-Za-z0-9]{1,64}$/);
  });
});

describe('Giphy links', () => {
  it('extracts the Giphy id from page and image links', () => {
    expect(giphyIdFromUrl('https://giphy.com/gifs/batman-dark-knight-l0HlvtIPzPdt2usKs')).toBe(
      'l0HlvtIPzPdt2usKs',
    );
    expect(giphyIdFromUrl('https://media2.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif')).toBe(
      'l0HlvtIPzPdt2usKs',
    );
    expect(
      giphyIdFromUrl(
        'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjEx/l0HlvtIPzPdt2usKs/giphy.gif',
      ),
    ).toBe('l0HlvtIPzPdt2usKs');
    expect(giphyIdFromUrl('https://i.giphy.com/l0HlvtIPzPdt2usKs.webp')).toBe('l0HlvtIPzPdt2usKs');
    expect(giphyIdFromUrl(EDDY)).toBeNull();
  });
});
