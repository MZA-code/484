import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { teamImage } from '../server/gif-links';
import { rivalries } from './content';

const publicFile = (path: string) => fileURLToPath(new URL(`../../public${path}`, import.meta.url));

describe('team images in the content', () => {
  it('exist in public/, with their still version', () => {
    const missing = rivalries
      .flatMap((r) => [...(r.a.images ?? []), ...(r.b.images ?? [])])
      .flatMap((path) => {
        const gif = teamImage(path);
        return gif ? [gif.webp, gif.still] : [path];
      })
      .filter((path) => !existsSync(publicFile(path)));
    expect(missing).toEqual([]);
  });
});
