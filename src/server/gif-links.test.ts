import { describe, expect, it } from 'vitest';
import {
  canonicalTenorUrl,
  giphyIdFromUrl,
  isTeamImage,
  isTenorUrl,
  teamImage,
  tenorGif,
  tenorGifId,
} from './gif-links';

const EDDY = 'https://media.tenor.com/4Pm3OjjE7BEAAAAM/eddy-mitchell-claude-moine.gif';
const CUISINE = 'https://media1.tenor.com/m/mG35Af7nn9YAAAAC/cuisine-americaine-eddy-mitchell.gif';

describe('Tenor links', () => {
  it('accepts image links copied from tenor.com, in both forms', () => {
    expect(isTenorUrl(EDDY)).toBe(true);
    expect(isTenorUrl(CUISINE)).toBe(true);
    expect(isTenorUrl('https://media.tenor.com/4Pm3OjjE7BEAAAPo/x.mp4')).toBe(true);
  });

  it('accepts names with encoded characters (& and apostrophes)', () => {
    const url =
      'https://media1.tenor.com/m/_2Iwv1Tc7cgAAAAd/y%27a-quelqu%27un-il-y-a-quelqu%27un.gif';
    expect(canonicalTenorUrl(url)).toBe(
      'https://media.tenor.com/_2Iwv1Tc7cgAAAAC/y%27a-quelqu%27un-il-y-a-quelqu%27un.gif',
    );
    expect(
      tenorGif('https://media1.tenor.com/m/bhL2NR4Os00AAAAd/jeanne%26serge-jeanne-et-serge.gif')
        ?.mp4,
    ).toBe('https://media.tenor.com/bhL2NR4Os00AAAPo/jeanne%26serge-jeanne-et-serge.mp4');
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

describe('images stored on the site', () => {
  it('serves a still image as image, with no video', () => {
    expect(teamImage('/images/teams/les-ripoux-1a2b3c4d.webp')).toEqual({
      id: 'img1a2b3c4d',
      mp4: '',
      webp: '/images/teams/les-ripoux-1a2b3c4d.webp',
      still: '/images/teams/les-ripoux-1a2b3c4d.webp',
      width: 0,
      height: 0,
    });
  });

  it('serves an animated image with its still version for reduced motion', () => {
    expect(teamImage('/images/teams/tazos-0a0b0c0d.anim.webp')).toMatchObject({
      webp: '/images/teams/tazos-0a0b0c0d.anim.webp',
      still: '/images/teams/tazos-0a0b0c0d.webp',
    });
  });

  it('refuses any other path', () => {
    for (const path of [
      'https://example.com/images/teams/x-1a2b3c4d.webp',
      '/images/teams/../secret-1a2b3c4d.webp',
      '/images/teams/x.webp',
      '/images/teams/X-1a2b3c4d.webp',
      '/images/teams/x-1a2b3c4d.jpg',
    ]) {
      expect(isTeamImage(path)).toBe(false);
    }
  });
});
