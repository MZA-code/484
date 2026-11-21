/**
 * Point d'entrée des contenus pour le site. Importé par les pages Astro :
 * si un JSON est invalide, le build échoue ici.
 */
import rawContenders from '../../content/contenders.json';
import rawRivalries from '../../content/rivalries.json';
import rawUi from '../../content/ui-texts.fr.json';
import { parseContent, parseRivalries } from './parse';

export const content = parseContent(rawContenders, rawUi);
export const { ui } = content;
export const { themes, contenders } = content.contenders;
export const { categories, rivalries } = parseRivalries(rawRivalries);
