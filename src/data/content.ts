/**
 * Point d'entrée des contenus pour le site. Importé par les pages Astro :
 * si un JSON est invalide, le build échoue ici.
 */
import rawRivalries from '../../content/rivalries.json';
import rawUi from '../../content/ui-texts.fr.json';
import { parseRivalries, parseUi } from './parse';

export const ui = parseUi(rawUi);
export const { categories, rivalries } = parseRivalries(rawRivalries);
