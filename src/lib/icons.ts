/**
 * Icônes des catégories et des univers.
 *
 * Icônes : Font Awesome Free 7 (https://fontawesome.com), sous licence CC BY 4.0 ; code sous licence MIT.
 * Seules les icônes listées ici sont intégrées, en SVG en ligne au build : pas de police,
 * pas de script, aucune requête de plus. Pour en ajouter une : l'importer, puis l'ajouter à ICONS.
 */
import {
  faBolt,
  faBriefcase,
  faCarSide,
  faClapperboard,
  faComments,
  faCompactDisc,
  faCompass,
  faCrown,
  faDragon,
  faEarthEurope,
  faEye,
  faFilm,
  faFire,
  faFutbol,
  faGamepad,
  faGuitar,
  faHandFist,
  faHashtag,
  faHeart,
  faHouse,
  faLaptopCode,
  faLock,
  faMask,
  faMedal,
  faMugHot,
  faPaw,
  faPeopleGroup,
  faPizzaSlice,
  faScaleBalanced,
  faShirt,
  faShuffle,
  faStar,
  faTrophy,
  faTv,
  faUserGroup,
  faVideo,
  faWandMagicSparkles,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

const ICONS = {
  bolt: faBolt,
  briefcase: faBriefcase,
  'car-side': faCarSide,
  clapperboard: faClapperboard,
  comments: faComments,
  'compact-disc': faCompactDisc,
  compass: faCompass,
  crown: faCrown,
  dragon: faDragon,
  'earth-europe': faEarthEurope,
  eye: faEye,
  film: faFilm,
  fire: faFire,
  futbol: faFutbol,
  gamepad: faGamepad,
  guitar: faGuitar,
  'hand-fist': faHandFist,
  hashtag: faHashtag,
  heart: faHeart,
  house: faHouse,
  'laptop-code': faLaptopCode,
  lock: faLock,
  mask: faMask,
  medal: faMedal,
  'mug-hot': faMugHot,
  paw: faPaw,
  'people-group': faPeopleGroup,
  'pizza-slice': faPizzaSlice,
  'scale-balanced': faScaleBalanced,
  shirt: faShirt,
  shuffle: faShuffle,
  star: faStar,
  trophy: faTrophy,
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
