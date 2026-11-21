/**
 * Icônes des catégories et des univers.
 *
 * Icônes : Font Awesome Free 7 (https://fontawesome.com), sous licence CC BY 4.0 ; code sous licence MIT.
 * Seules les icônes listées ici sont intégrées, en SVG en ligne au build : pas de police,
 * pas de script, aucune requête de plus. Pour en ajouter une : l'importer, puis l'ajouter à ICONS.
 */
import {
  faBolt,
  faCarSide,
  faClapperboard,
  faComments,
  faCompactDisc,
  faDragon,
  faFilm,
  faFutbol,
  faGamepad,
  faGuitar,
  faHashtag,
  faHouse,
  faLaptopCode,
  faMask,
  faMugHot,
  faPaw,
  faPizzaSlice,
  faScaleBalanced,
  faShirt,
  faShuffle,
  faStar,
  faTv,
  faUserGroup,
  faVideo,
  faWandMagicSparkles,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

const ICONS = {
  bolt: faBolt,
  'car-side': faCarSide,
  clapperboard: faClapperboard,
  comments: faComments,
  'compact-disc': faCompactDisc,
  dragon: faDragon,
  film: faFilm,
  futbol: faFutbol,
  gamepad: faGamepad,
  guitar: faGuitar,
  hashtag: faHashtag,
  house: faHouse,
  'laptop-code': faLaptopCode,
  mask: faMask,
  'mug-hot': faMugHot,
  paw: faPaw,
  'pizza-slice': faPizzaSlice,
  'scale-balanced': faScaleBalanced,
  shirt: faShirt,
  shuffle: faShuffle,
  star: faStar,
  tv: faTv,
  'user-group': faUserGroup,
  video: faVideo,
  'wand-magic-sparkles': faWandMagicSparkles,
} satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as [IconName, ...IconName[]];

/** Données SVG d'une icône : viewBox et tracé. */
export function iconSvg(name: IconName): { viewBox: string; path: string } {
  const [width, height, , , path] = ICONS[name].icon;
  return { viewBox: `0 0 ${width} ${height}`, path: Array.isArray(path) ? path.join(' ') : path };
}
