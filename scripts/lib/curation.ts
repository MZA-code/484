/**
 * Lecture et écriture des GIF choisis à la main dans `content/rivalries.json`, pour la page
 * d'admin locale (`npm run gif-admin`) : liens collés (Tenor, Giphy, images), images importées
 * sur le site, réglages de la recherche automatique. Le fichier est validé avant chaque écriture
 * et mis en forme par Prettier, comme le reste du dépôt.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format, resolveConfig } from 'prettier';
import { parseRivalries } from '../../src/data/parse';
import {
  canonicalTenorUrl,
  giphyIdFromUrl,
  isTeamImage,
  teamImageId,
  tenorGifId,
} from '../../src/server/gif-links';
import { isImageSource } from './team-images';

const RIVALRIES_FILE = new URL('../../content/rivalries.json', import.meta.url);
/** Liens collés mais non utilisables : gardés ici pour ne rien perdre (ignoré par git). */
const REFUSED_FILE = new URL('../../liens-refuses.txt', import.meta.url);
const ROOT = fileURLToPath(new URL('../../', import.meta.url));

// ─── Fichier des rivalités ──────────────────────────────────────────────────

export interface RawTeam {
  name: string;
  origin: string;
  line?: string;
  giphyIds: string[];
  giphyQuery: string;
  giphyKeywords?: string[];
  /** Liens Tenor choisis à la main. */
  gifUrls?: string[];
  /** Images rangées sur le site (`/images/teams/…webp`). */
  images?: string[];
}

export interface RawRivalry {
  id: string;
  category: string;
  a: RawTeam;
  b: RawTeam;
}

export type RawFile = { rivalries: RawRivalry[] } & Record<string, unknown>;

export const readRaw = () => JSON.parse(readFileSync(RIVALRIES_FILE, 'utf8')) as RawFile;

/** Réécrit content/rivalries.json : validé d'abord, puis mis en forme comme le reste du dépôt. */
export async function writeRaw(raw: RawFile): Promise<void> {
  // On valide avant d'écrire : le fichier ne peut pas devenir invalide.
  parseRivalries(raw);
  const path = fileURLToPath(RIVALRIES_FILE);
  const options = (await resolveConfig(path)) ?? {};
  writeFileSync(RIVALRIES_FILE, await format(JSON.stringify(raw), { ...options, filepath: path }));
}

/**
 * Identifiants des GIF choisis à la main : Giphy, liens Tenor (« tenor… ») et images du site (« img… »).
 */
export function handPickedIds(team: RawTeam): string[] {
  return [
    ...team.giphyIds,
    ...(team.gifUrls ?? []).map((url) => tenorGifId(url) ?? url),
    ...(team.images ?? []).map((path) => teamImageId(path) ?? path),
  ];
}

/** La team a-t-elle au moins un GIF choisi à la main ? */
export const isCurated = (team: RawTeam) => handPickedIds(team).length > 0;

export interface TeamRef {
  /** « rivalité/a » ou « rivalité/b ». */
  key: string;
  rivalryId: string;
  side: 'a' | 'b';
  category: string;
  team: RawTeam;
  opponent: string;
}

export function teamsOf(file: RawFile = readRaw()): TeamRef[] {
  return file.rivalries.flatMap((r) => [
    {
      key: `${r.id}/a`,
      rivalryId: r.id,
      side: 'a' as const,
      category: r.category,
      team: r.a,
      opponent: r.b.name,
    },
    {
      key: `${r.id}/b`,
      rivalryId: r.id,
      side: 'b' as const,
      category: r.category,
      team: r.b,
      opponent: r.a.name,
    },
  ]);
}

/**
 * La même team dans d'autres duels (même nom, même origine) : elle partage ses GIF choisis.
 * « Café · Éthiopie » et « Café · La machine » restent distincts.
 */
export function twinsOf(ref: TeamRef, all: readonly TeamRef[]): TeamRef[] {
  return all.filter(
    (t) => t.key !== ref.key && t.team.name === ref.team.name && t.team.origin === ref.team.origin,
  );
}

/** Copie les GIF choisis d'une team sur ses jumelles (les autres réglages ne bougent pas). */
export function copyChosen(from: RawTeam, to: RawTeam): void {
  to.giphyIds = [...from.giphyIds];
  if (from.gifUrls?.length) to.gifUrls = [...from.gifUrls];
  else delete to.gifUrls;
  if (from.images?.length) to.images = [...from.images];
  else delete to.images;
}

// ─── Liens collés ───────────────────────────────────────────────────────────

export interface PastedLinks {
  /** Liens Tenor, sous leur forme canonique. */
  tenor: string[];
  /** Identifiants Giphy. */
  giphy: string[];
  /** Images déjà rangées sur le site (`/images/teams/…`). */
  images: string[];
  /** Images à importer : liens web ou fichiers du poste. */
  toImport: string[];
  /** Lignes non reconnues. */
  invalid: string[];
}

/**
 * Lit les liens collés, un par ligne : Tenor → forme canonique, Giphy → identifiant,
 * image du site → gardée, autre lien web ou fichier du poste → image à importer.
 */
export function readLinks(text: string): PastedLinks {
  const result: PastedLinks = { tenor: [], giphy: [], images: [], toImport: [], invalid: [] };
  for (const raw of text.split(/\r?\n/)) {
    // « Copier en tant que chemin » de Windows ajoute des guillemets.
    const line = raw.trim().replace(/^"(.*)"$/, '$1');
    if (!line) continue;
    const tenor = canonicalTenorUrl(line);
    const giphy = tenor ? null : giphyIdFromUrl(line);
    if (tenor) result.tenor.push(tenor);
    else if (giphy) result.giphy.push(giphy);
    else if (isTeamImage(line)) result.images.push(line);
    else if (isImageSource(line)) result.toImport.push(line);
    else result.invalid.push(line);
  }
  const unique = (list: string[]) => [...new Set(list)];
  return {
    tenor: unique(result.tenor),
    giphy: unique(result.giphy),
    images: unique(result.images),
    toImport: unique(result.toImport),
    invalid: result.invalid,
  };
}

export const splitKeywords = (value: string) =>
  value
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

// ─── Modification d'une team ────────────────────────────────────────────────

/** Ce que la page d'admin peut changer pour une team ; un champ absent n'est pas touché. */
export interface TeamChange {
  /** Nouvelle liste complète des GIF Giphy choisis (ordre gardé). */
  giphyIds?: string[];
  /** Nouvelle liste complète des liens Tenor choisis. */
  gifUrls?: string[];
  /** Nouvelle liste complète des images du site choisies. */
  images?: string[];
  /** Liens collés (un par ligne) à ajouter : Tenor, Giphy, image à importer. */
  links?: string;
  /** Recherche Giphy du site, quand aucun GIF n'est choisi à la main. */
  giphyQuery?: string;
  /** Mots-clés qui valident un résultat, séparés par des virgules ; vide = valeurs par défaut. */
  giphyKeywords?: string;
}

const GIPHY_ID = /^[A-Za-z0-9]{1,64}$/;
const unique = (list: readonly string[]) => [...new Set(list)];

/**
 * Applique une modification à une team (en place). `importImage` range une image sur le site
 * et renvoie son chemin. Renvoie les problèmes (lien refusé, image introuvable…).
 */
export async function changeTeam(
  team: RawTeam,
  change: TeamChange,
  importImage: (source: string, name: string) => Promise<string>,
): Promise<string[]> {
  const problems: string[] = [];
  if (change.giphyIds) team.giphyIds = unique(change.giphyIds.filter((id) => GIPHY_ID.test(id)));
  if (change.gifUrls) {
    team.gifUrls = unique(change.gifUrls.flatMap((url) => canonicalTenorUrl(url) ?? []));
  }
  if (change.images) team.images = unique(change.images.filter((path) => isTeamImage(path)));

  if (change.links) {
    const { tenor, giphy, images, toImport, invalid } = readLinks(change.links);
    invalid.forEach((line) => problems.push(`${line} (lien non reconnu)`));
    for (const source of toImport) {
      try {
        images.push(await importImage(source, team.name));
      } catch (error) {
        problems.push(`${source} (${(error as Error).message})`);
      }
    }
    team.giphyIds = unique([...team.giphyIds, ...giphy]);
    team.gifUrls = unique([...(team.gifUrls ?? []), ...tenor]);
    team.images = unique([...(team.images ?? []), ...images]);
  }
  if (team.gifUrls?.length === 0) delete team.gifUrls;
  if (team.images?.length === 0) delete team.images;

  const query = change.giphyQuery?.trim();
  if (query) team.giphyQuery = query;
  if (change.giphyKeywords !== undefined) {
    const list = splitKeywords(change.giphyKeywords);
    if (list.length > 0) team.giphyKeywords = list;
    else delete team.giphyKeywords;
  }
  return problems;
}

/** Garde les liens refusés dans liens-refuses.txt, pour ne pas les perdre. */
export function keepRefusedLinks(teamName: string, problems: readonly string[]): void {
  if (problems.length === 0) return;
  const day = new Date().toISOString().slice(0, 10);
  appendFileSync(REFUSED_FILE, problems.map((p) => `${day} · ${teamName} : ${p}\n`).join(''));
}

// ─── Git ────────────────────────────────────────────────────────────────────

/** Lance une commande git à la racine du dépôt ; renvoie sa sortie. */
export function git(args: readonly string[]): string {
  return execFileSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    // `git show HEAD:content/rivalries.json` dépasse largement le 1 Mo par défaut.
    maxBuffer: 64 * 1024 * 1024,
  });
}

/**
 * Images de public/images/teams/ pas encore enregistrées dans git (nouvelles ou modifiées) :
 * à mettre dans le commit, sinon le test « images in the content » fait échouer la CI.
 */
export function uncommittedImages(): string[] {
  try {
    return git(['status', '--porcelain', '--untracked-files=all', '--', 'public/images/teams'])
      .split('\n')
      .filter((line) => line.length > 3 && !line.startsWith('D'))
      .map((line) => line.slice(3).trim());
  } catch {
    // git absent ou dossier hors dépôt : pas de rappel.
    return [];
  }
}
