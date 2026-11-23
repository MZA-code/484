import { describe, expect, it } from 'vitest';
import { placeholderGif } from './gif-placeholder';

describe('placeholderGif (mode sans Giphy)', () => {
  it('is an inline image with the team name, never a Giphy address', () => {
    const gif = placeholderGif('Tom & Jerry <3', 'duos-x-a');
    expect(gif.mp4).toBe('');
    expect(gif.webp).toBe(gif.still);
    expect(gif.webp.startsWith('data:image/svg+xml,')).toBe(true);
    const svg = decodeURIComponent(gif.webp.slice('data:image/svg+xml,'.length));
    expect(svg).toContain('Tom &#38; Jerry &#60;3');
    expect(svg).not.toContain('giphy');
  });

  it('is stable for a given team', () => {
    expect(placeholderGif('Neo', 'k')).toEqual(placeholderGif('Neo', 'k'));
  });
});
