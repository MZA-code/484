/**
 * GIF de remplacement du mode développement sans Giphy (`npm run dev:sans-giphy`, variable
 * GIPHY_OFFLINE=true) : une image SVG inline, aux mêmes proportions qu'un GIF, qui porte le nom
 * de la team. Les cartes ont ainsi leur vraie mise en page sans aucun appel à l'API Giphy,
 * ce qui garde le quota de la clé pour les vrais visiteurs.
 */
import type { Gif } from '../lib/giphy';
import { stableIndex } from '../lib/giphy';

const WIDTH = 356;
const HEIGHT = 200;
/** Teintes de fond, tirées de façon stable d'après la team. */
const HUES = [210, 280, 330, 20, 50, 140, 180];

const escapeXml = (text: string) => text.replace(/[<>&"']/g, (c) => `&#${c.codePointAt(0) ?? 0};`);

export function placeholderGif(name: string, key: string): Gif {
  const hue = HUES[stableIndex(key, HUES.length)] ?? 210;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
<defs><pattern id="s" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="16" fill="hsl(${hue} 45% 22%)"/></pattern></defs>
<rect width="100%" height="100%" fill="hsl(${hue} 45% 16%)"/><rect width="100%" height="100%" fill="url(#s)"/>
<text x="50%" y="44%" text-anchor="middle" font-family="monospace" font-size="15" fill="hsl(${hue} 70% 75%)">GIF (dev, sans Giphy)</text>
<text x="50%" y="60%" text-anchor="middle" font-family="sans-serif" font-size="20" font-weight="700" fill="#f5f1e8">${escapeXml(name)}</text>
</svg>`;
  const src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  // Pas de vidéo (mp4 vide) : la carte affiche l'image, comme pour une image rangée sur le site.
  return { id: `dev-${key}`, mp4: '', webp: src, still: src, width: WIDTH, height: HEIGHT };
}
