/**
 * Analyse pour `npm run gif-audit` : signalements par team, et repérage des œuvres françaises
 * (Giphy connaît mal le cinéma, la BD et la télé françaises : leurs GIF sont à vérifier en priorité).
 */
import { normalizeText } from '../../src/server/gif-match';

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

export interface ReportRow {
  rivalryId: string;
  team: 'a' | 'b';
  gifId: string;
  reports: number;
}

export interface TeamReports {
  total: number;
  /** Signalements par identifiant de GIF. */
  gifs: Map<string, number>;
}

/** Regroupe les signalements par team (« rivalité/a »). */
export function reportsByTeam(rows: readonly ReportRow[]): Map<string, TeamReports> {
  const byTeam = new Map<string, TeamReports>();
  for (const row of rows) {
    const key = `${row.rivalryId}/${row.team}`;
    const entry = byTeam.get(key) ?? { total: 0, gifs: new Map<string, number>() };
    entry.total += row.reports;
    entry.gifs.set(row.gifId, (entry.gifs.get(row.gifId) ?? 0) + row.reports);
    byTeam.set(key, entry);
  }
  return byTeam;
}

/** Les plus signalées d'abord ; à égalité, l'ordre du fichier (tri stable). */
export function sortByReports<T extends { key: string }>(
  teams: readonly T[],
  reports: ReadonlyMap<string, TeamReports>,
): T[] {
  return [...teams].sort(
    (x, y) => (reports.get(y.key)?.total ?? 0) - (reports.get(x.key)?.total ?? 0),
  );
}
