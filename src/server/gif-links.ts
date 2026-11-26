/**
 * GIF choisis à la main par un lien, quand Giphy n'a rien de bon (souvent pour les œuvres
 * françaises) : un lien Tenor copié sur tenor.com (« Copier l'adresse de l'image »).
 *
 * L'API Tenor est fermée aux sites extérieurs depuis le 30 juin 2026 : pas de recherche
 * automatique, seulement des liens choisis à la main. Le GIF reste hébergé chez Tenor.
 *
 * Une adresse Tenor a la forme `https://media.tenor.com/<id 11><format 5>/<nom>.<ext>` (ou
 * `https://media1.tenor.com/m/…`). Les 5 caractères de format désignent une version du même GIF :
 * `AAAAC` GIF d'origine (souvent plusieurs Mo), `AAAPo` vidéo MP4, `AAAAx` WebP animé,
 * `AAAAe` aperçu fixe. Vérifié le 22/11/2026 ; si Tenor change ce schéma, la carte garde
 * simplement son cadre rayé.
 */
import type { Gif } from '../lib/giphy';

const TENOR_HOST = /^media\d*\.tenor\.com$/;
// Le nom peut contenir des caractères encodés (`jeanne%26serge`, `y%27a-quelqu%27un`) : on le
// garde tel que le navigateur l'a encodé.
const TENOR_PATH = /^\/(?:m\/)?([A-Za-z0-9_-]{11})[A-Za-z0-9_-]{5}\/([^/]+?)\.(gif|mp4|webp|png)$/;

interface TenorParts {
  /** Identifiant du GIF (sans le code de format). */
  base: string;
  /** Nom du fichier, sans extension. */
  name: string;
}

function tenorParts(url: string): TenorParts | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || !TENOR_HOST.test(parsed.hostname)) return null;
  if (parsed.search || parsed.hash) return null;
  const match = TENOR_PATH.exec(parsed.pathname);
  if (!match) return null;
  return { base: match[1] as string, name: match[2] as string };
}

/** Le lien est-il une image Tenor utilisable ? */
export function isTenorUrl(url: string): boolean {
  return tenorParts(url) !== null;
}

/** Adresse canonique d'un lien Tenor (GIF d'origine), pour ranger les liens sous une seule forme. */
export function canonicalTenorUrl(url: string): string | null {
  const parts = tenorParts(url);
  return parts ? `https://media.tenor.com/${parts.base}AAAAC/${parts.name}.gif` : null;
}

/** Identifiant d'un GIF Tenor, sous la même forme que ceux de Giphy (lettres et chiffres). */
export function tenorGifId(url: string): string | null {
  const parts = tenorParts(url);
  return parts ? `tenor${parts.base.replace(/[^A-Za-z0-9]/g, '')}` : null;
}

/** Les versions légères d'un GIF Tenor, au format renvoyé par /api/gif-plans. */
export function tenorGif(url: string): Gif | null {
  const parts = tenorParts(url);
  if (!parts) return null;
  const at = (format: string, ext: string) =>
    `https://media.tenor.com/${parts.base}${format}/${parts.name}.${ext}`;
  return {
    id: tenorGifId(url) as string,
    mp4: at('AAAPo', 'mp4'),
    webp: at('AAAAx', 'webp'),
    still: at('AAAAe', 'png'),
    width: 0,
    height: 0,
  };
}

/** Identifiant Giphy d'un lien Giphy (page ou image), pour le ranger dans `giphyIds`. */
export function giphyIdFromUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (!/(^|\.)giphy\.com$/.test(parsed.hostname)) return null;
  // https://media2.giphy.com/media/<id>/giphy.gif, https://i.giphy.com/<id>.webp
  const media = /\/media\/(?:v1\.[^/]+\/)?([A-Za-z0-9]+)\//.exec(parsed.pathname);
  if (media) return media[1] as string;
  const direct = /^\/([A-Za-z0-9]+)\.(?:gif|webp|mp4)$/.exec(parsed.pathname);
  if (direct && parsed.hostname === 'i.giphy.com') return direct[1] as string;
  // https://giphy.com/gifs/un-titre-<id>
  const page = /^\/(?:gifs|stickers)\/(?:[a-z0-9-]*-)?([A-Za-z0-9]+)\/?$/.exec(parsed.pathname);
  return page ? (page[1] as string) : null;
}

// ─── Images rangées sur le site ─────────────────────────────────────────────
//
// Quand ni Giphy ni Tenor n'ont rien, l'éditeur peut coller une image (lien ou fichier) dans la
// page de curation : elle est téléchargée, réduite et rangée dans public/images/teams/. Elle est
// servie par le site lui-même : aucun service tiers. Une image animée est rangée deux fois :
// `<nom>.anim.webp` (animée) et `<nom>.webp` (image fixe, pour les animations réduites).

/** Dossier public des images de teams (adresse vue par le navigateur). */
export const TEAM_IMAGES_DIR = '/images/teams/';
const TEAM_IMAGE = /^\/images\/teams\/([a-z0-9-]+-([0-9a-f]{8}))(\.anim)?\.webp$/;

/** Le chemin est-il une image de team rangée sur le site ? */
export function isTeamImage(path: string): boolean {
  return TEAM_IMAGE.test(path);
}

/** Identifiant d'une image de team, sous la même forme que ceux de Giphy (« img » + empreinte). */
export function teamImageId(path: string): string | null {
  const match = TEAM_IMAGE.exec(path);
  return match ? `img${match[2]}` : null;
}

/** Une image de team, au format renvoyé par /api/gif-plans : pas de vidéo, l'image et son aperçu fixe. */
export function teamImage(path: string): Gif | null {
  const match = TEAM_IMAGE.exec(path);
  if (!match) return null;
  return {
    id: `img${match[2]}`,
    mp4: '',
    webp: path,
    still: `${TEAM_IMAGES_DIR}${match[1]}.webp`,
    width: 0,
    height: 0,
  };
}
