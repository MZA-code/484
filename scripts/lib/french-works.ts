/**
 * Repérage des œuvres françaises pour la page d'admin des GIF : Giphy connaît mal le cinéma,
 * la BD et la télé françaises, leurs GIF sont à vérifier en priorité.
 */
import { normalizeText } from '../../src/lib/gif-match';

/** Catégories entièrement faites d'œuvres françaises. */
export const FRENCH_CATEGORIES: readonly string[] = ['cinefr'];

/**
 * Auteurs, œuvres, troupes, chaînes et studios français ou francophones qu'on trouve dans les
 * champs `origin`. Comparaison sans accents ni casse, en mots entiers. À compléter au besoin.
 */
export const FRENCH_MARKERS: readonly string[] = [
  // BD
  'Goscinny',
  'Uderzo',
  'Hergé',
  'Franquin',
  'Peyo',
  'Morris',
  'Rob-Vel',
  'Edgar P. Jacobs',
  'Pif Gadget',
  // Littérature
  'Maurice Leblanc',
  'Alexandre Dumas',
  'Gaston Leroux',
  'Perrault',
  'Saint-Exupéry',
  'La Fontaine',
  'Jean Bruce',
  'Jules Verne',
  'Victor Hugo',
  'Molière',
  // Animation
  'Albert Barillé',
  'Michel Ocelot',
  'Sylvain Chomet',
  'Xilam',
  'Ankama',
  // Humour, cinéma, télé
  'Kaamelott',
  'Kad et Olivier',
  'Éric et Ramzy',
  'Les Inconnus',
  'Les Nuls',
  'Le Splendid',
  'Jean-Marie Poiré',
  'Club Dorothée',
  'L’Île aux enfants',
  'TF1',
  'France 2',
  'France 3',
  'Canal+',
  'M6',
  'Skyrock',
  // Musique
  'Les Chaussettes noires',
  'Rock français',
];

const markers = FRENCH_MARKERS.map((m) => ` ${normalizeText(m)} `);

/** L'origine cite-t-elle une œuvre française (ou la team est-elle dans une catégorie française) ? */
export function isFrenchWork(category: string, origin: string): boolean {
  if (FRENCH_CATEGORIES.includes(category)) return true;
  const text = ` ${normalizeText(origin)} `;
  return markers.some((m) => text.includes(m));
}
