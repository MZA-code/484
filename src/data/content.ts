/**
 * Point d'entrée des contenus pour le site. Importé par les pages Astro :
 * si un JSON est invalide, le build échoue ici.
 */
import rawContenders from '../../content/contenders.json';
import rawUi from '../../content/ui-texts.fr.json';
import { parseContent } from './parse';

export const content = parseContent(rawContenders, rawUi);
export const { ui } = content;
export const { themes, contenders } = content.contenders;
