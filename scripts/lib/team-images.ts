/**
 * Import d'une image pour une team, quand ni Giphy ni Tenor n'ont rien : un lien (https://…)
 * ou un fichier du poste (C:\…). L'image est téléchargée, réduite et rangée dans
 * public/images/teams/ : le site la sert lui-même, sans service tiers.
 *
 * - Image fixe → `<nom>-<empreinte>.webp`.
 * - Image animée (GIF, WebP animé) → `<nom>-<empreinte>.anim.webp` + `<nom>-<empreinte>.webp`
 *   (première image, pour les animations réduites). Trop lourde même réduite : gardée fixe.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { TEAM_IMAGES_DIR } from '../../src/server/gif-links';

const PUBLIC_DIR = fileURLToPath(new URL('../../public', import.meta.url));
/** Largeur des cartes : au-delà, l'image serait plus lourde sans être plus nette. */
const WIDTH = 480;
/** Poids maximal d'une image animée ; au-delà, on réessaie plus petit, puis on la garde fixe. */
const MAX_ANIMATED_BYTES = 1_500_000;
/** Poids maximal du fichier d'origine (lien ou fichier). */
const MAX_SOURCE_BYTES = 25_000_000;

/** La ligne collée ressemble-t-elle à une image à importer (lien web ou fichier du poste) ? */
export function isImageSource(line: string): boolean {
  return /^https?:\/\//i.test(line) || isAbsolute(line);
}

/** Nom de fichier lisible tiré du nom de la team : « Les Ripoux » → « les-ripoux ». */
export function slugOf(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
    .replace(/-$/, '');
  return slug || 'team';
}

async function readSource(source: string): Promise<Buffer> {
  if (!/^https?:\/\//i.test(source)) {
    if (!existsSync(source)) throw new Error('fichier introuvable');
    return readFileSync(source);
  }
  const response = await fetch(source, {
    headers: { 'user-agent': 'Mozilla/5.0 (484 curation)' },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`le site a répondu ${response.status}`);
  const type = response.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) {
    throw new Error(
      'ce lien mène à une page, pas à une image (clic droit sur l’image, « Copier l’adresse de l’image »)',
    );
  }
  const body = Buffer.from(await response.arrayBuffer());
  if (body.length > MAX_SOURCE_BYTES) throw new Error('image trop lourde (plus de 25 Mo)');
  return body;
}

const resized = (input: Buffer, animated: boolean, width: number) =>
  sharp(input, { animated }).rotate().resize({ width, withoutEnlargement: true });

/**
 * Importe une image et renvoie son chemin pour le site (`/images/teams/….webp`).
 * Erreur avec un message lisible si ce n'est pas une image utilisable.
 */
export async function importTeamImage(
  source: string,
  teamName: string,
  publicDir = PUBLIC_DIR,
): Promise<string> {
  const input = await readSource(source);
  const pages = await sharp(input)
    .metadata()
    .then((meta) => meta.pages ?? 1)
    .catch(() => {
      throw new Error('ce n’est pas une image lisible (JPG, PNG, GIF ou WebP attendu)');
    });
  const hash = createHash('sha256').update(input).digest('hex').slice(0, 8);
  const base = `${slugOf(teamName)}-${hash}`;
  const dir = join(publicDir, ...TEAM_IMAGES_DIR.split('/').filter(Boolean));
  mkdirSync(dir, { recursive: true });

  // Image fixe : toujours (c'est aussi l'aperçu d'une image animée).
  writeFileSync(
    join(dir, `${base}.webp`),
    await resized(input, false, WIDTH).webp({ quality: 78 }).toBuffer(),
  );
  if (pages > 1) {
    for (const [width, quality] of [
      [WIDTH, 70],
      [320, 55],
    ] as const) {
      const animated = await resized(input, true, width).webp({ quality, effort: 5 }).toBuffer();
      if (animated.length <= MAX_ANIMATED_BYTES) {
        writeFileSync(join(dir, `${base}.anim.webp`), animated);
        return `${TEAM_IMAGES_DIR}${base}.anim.webp`;
      }
    }
  }
  return `${TEAM_IMAGES_DIR}${base}.webp`;
}
