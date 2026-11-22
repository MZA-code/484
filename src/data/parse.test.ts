import { describe, expect, it } from 'vitest';
import rawRivalries from '../../content/rivalries.json';
import rawUi from '../../content/ui-texts.fr.json';
import { NARROW_NBSP } from '../lib/typography';
import { ContentError, parseRivalries, parseUi } from './parse';

// ─── Textes de l'interface ──────────────────────────────────────────────────

describe('UI texts file', () => {
  const ui = parseUi(rawUi);

  it('is valid and gets French typography applied', () => {
    expect(ui.home.title[2]).toBe('Il a préféré ça.');
    expect(ui.debate.question).toContain(`${NARROW_NBSP}?`);
    expect(JSON.stringify(ui)).not.toMatch(/ [;!?]|« | »/);
  });

  it('never alters URLs', () => {
    for (const project of ui.projects) {
      expect(project.url.startsWith('https://')).toBe(true);
      expect(project.url).not.toContain(NARROW_NBSP);
    }
  });

  it('rejects a template missing its placeholder', () => {
    const raw = structuredClone(rawUi);
    raw.debate.choice = 'Tu es team quelqu’un';
    expect(() => parseUi(raw)).toThrow(ContentError);
    expect(() => parseUi(raw)).toThrow(/{name}/);
  });

  it('rejects a quip category with a single entry', () => {
    const raw = structuredClone(rawUi);
    raw.quips.low = ['Seule.'];
    expect(() => parseUi(raw)).toThrow(/au moins 2 remarques/);
  });
});

// ─── Rivalités ──────────────────────────────────────────────────────────────

/**
 * Forme brute du fichier, volontairement générique. Sans elle, TypeScript déduirait les types
 * du contenu exact du JSON (une liste `giphyIds` toujours vide devient « never[] ») : choisir des
 * GIF avec `npm run gif-audit` casserait alors la compilation des tests.
 */
interface RawTeam {
  name: string;
  origin: string;
  line: string;
  giphyIds: string[];
  giphyQuery: string;
  giphyKeywords?: string[];
}
interface RawRivalry {
  id: string;
  category: string;
  question?: string;
  a: RawTeam;
  b: RawTeam;
}
interface RawRivalries {
  version: number;
  universes: Record<string, unknown>[];
  categories: Record<string, unknown>[];
  rivalries: RawRivalry[];
}
const cloneRivalries = (): RawRivalries => structuredClone(rawRivalries) as RawRivalries;

describe('rivalries file', () => {
  const parsed = parseRivalries(rawRivalries);

  it('is valid', () => {
    expect(parsed.rivalries.length).toBeGreaterThanOrEqual(90);
    expect(parsed.categories.length).toBeGreaterThanOrEqual(5);
  });

  it('gets French typography applied, except on technical fields', () => {
    const pizza = parsed.rivalries.find((r) => r.id === 'bouffe-pizza-ananas');
    expect(pizza?.question).toContain(`${NARROW_NBSP}?`);
    expect(pizza?.category).toBe('bouffe');
    expect(JSON.stringify(parsed)).not.toMatch(/ [;!?]|« | »/);
  });

  it('never alters ids or Giphy queries', () => {
    parsed.rivalries.forEach((r, i) => {
      const raw = rawRivalries.rivalries[i];
      expect(r.id).toBe(raw?.id);
      expect(r.a.giphyQuery).toBe(raw?.a.giphyQuery);
    });
  });

  const expectError = (file: unknown, message: RegExp) => {
    expect(() => parseRivalries(file)).toThrow(ContentError);
    expect(() => parseRivalries(file)).toThrow(message);
  };

  it('rejects a duplicate id', () => {
    const file = cloneRivalries();
    file.rivalries.push(structuredClone(file.rivalries[0] as RawRivalry));
    expectError(file, /identifiant en double/);
  });

  it('rejects the same rivalry written twice, in any order', () => {
    const file = cloneRivalries();
    const first = file.rivalries[0] as RawRivalry;
    file.rivalries.push({
      ...structuredClone(first),
      id: `${first.category}-bis`,
      a: first.b,
      b: first.a,
    });
    expectError(file, /rivalité déjà présente/);
  });

  it('rejects two teams with the same name', () => {
    const file = cloneRivalries();
    const first = file.rivalries[0] as RawRivalry;
    first.b = { ...first.b, name: first.a.name };
    expectError(file, /même nom/);
  });

  it('rejects an unknown category and a badly prefixed id', () => {
    const file = cloneRivalries();
    (file.rivalries[0] as { category: string }).category = 'pirates';
    expectError(file, /catégorie inconnue : pirates/);
    const other = cloneRivalries();
    (other.rivalries[0] as { id: string }).id = 'batman-superman';
    expectError(other, /doit commencer par/);
  });

  it('rejects a category with too few rivalries', () => {
    const file = cloneRivalries();
    file.categories.push({
      id: 'vide',
      label: 'Vide',
      tagline: 'Rien.',
      icon: 'star',
      giphyQuery: 'empty',
    });
    expectError(file, /« vide » a 0 rivalité/);
  });

  it('rejects the reserved « mix » category id', () => {
    const file = cloneRivalries();
    (file.categories[0] as { id: string }).id = 'mix';
    expectError(file, /réservé/);
  });

  it('rejects an unknown icon', () => {
    const file = cloneRivalries();
    (file.categories[0] as { icon: string }).icon = 'licorne-arc-en-ciel';
    expectError(file, /icône inconnue/);
  });

  it('rejects a line that is too long', () => {
    const file = cloneRivalries();
    (file.rivalries[0] as RawRivalry).a.line = 'x'.repeat(121);
    expectError(file, /120 caractères/);
  });
});
