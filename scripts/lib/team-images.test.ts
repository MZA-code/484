import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { isTeamImage } from '../../src/server/gif-links';
import { importTeamImage, isImageSource, slugOf } from './team-images';

// Sous Windows, le cache de sharp garde les fichiers ouverts : le dossier ne pourrait pas être supprimé.
sharp.cache(false);

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'team-images-'));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

const red = { r: 200, g: 30, b: 30 };

describe('team images', () => {
  it('names files after the team', () => {
    expect(slugOf('Les Ripoux')).toBe('les-ripoux');
    expect(slugOf('Café-crème & Cie !')).toBe('cafe-creme-cie');
    expect(slugOf('???')).toBe('team');
  });

  it('recognises web links and files of the computer', () => {
    expect(isImageSource('https://i.ytimg.com/vi/x/maxresdefault.jpg')).toBe(true);
    expect(isImageSource('C:\\Users\\moi\\Images\\tazos.jpg')).toBe(true);
    expect(isImageSource('tazos')).toBe(false);
  });

  it('imports a still image as a small WebP on the site', async () => {
    const file = join(dir, 'photo.png');
    await sharp({ create: { width: 1600, height: 900, channels: 3, background: red } })
      .png()
      .toFile(file);
    const path = await importTeamImage(file, 'Les Ripoux', join(dir, 'public'));
    expect(isTeamImage(path)).toBe(true);
    expect(path).toMatch(/^\/images\/teams\/les-ripoux-[0-9a-f]{8}\.webp$/);
    const stored = join(dir, 'public', path);
    expect((await sharp(readFileSync(stored)).metadata()).width).toBe(480);
  });

  it('keeps an animation, with a still version beside it', async () => {
    const file = join(dir, 'anim.gif');
    const frame = (background: typeof red) =>
      sharp({ create: { width: 64, height: 36, channels: 3, background } })
        .raw()
        .toBuffer();
    const frames = Buffer.concat([await frame(red), await frame({ r: 30, g: 30, b: 200 })]);
    await sharp(frames, { raw: { width: 64, height: 72, channels: 3, pageHeight: 36 } })
      .gif()
      .toFile(file);
    const path = await importTeamImage(file, 'Tazos', join(dir, 'public'));
    expect(path).toMatch(/^\/images\/teams\/tazos-[0-9a-f]{8}\.anim\.webp$/);
    expect(existsSync(join(dir, 'public', path))).toBe(true);
    expect(existsSync(join(dir, 'public', path.replace('.anim.webp', '.webp')))).toBe(true);
    expect((await sharp(readFileSync(join(dir, 'public', path))).metadata()).pages).toBe(2);
  });

  it('refuses what is not an image', async () => {
    const file = join(dir, 'notes.txt');
    writeFileSync(file, 'pas une image');
    await expect(importTeamImage(file, 'X', join(dir, 'public'))).rejects.toThrow(/image lisible/);
    await expect(
      importTeamImage(join(dir, 'absent.jpg'), 'X', join(dir, 'public')),
    ).rejects.toThrow(/introuvable/);
    expect(existsSync(join(dir, 'public'))).toBe(false);
  });
});
