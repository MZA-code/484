import { describe, expect, it } from 'vitest';
import rawContenders from '../../content/contenders.json';
import rawRivalries from '../../content/rivalries.json';
import rawUi from '../../content/ui-texts.fr.json';
import { NARROW_NBSP, NBSP } from '../lib/typography';
import { ContentError, parseContent, parseRivalries } from './parse';

type RawContenders = typeof rawContenders;

/** Copie modifiable du vrai fichier, pour fabriquer des cas invalides. */
const cloneContenders = (): RawContenders => structuredClone(rawContenders);

describe('real content files', () => {
  const content = parseContent(rawContenders, rawUi);

  it('are valid', () => {
    expect(content.contenders.contenders.length).toBeGreaterThanOrEqual(160);
    expect(content.contenders.themes.length).toBeGreaterThanOrEqual(4);
  });

  it('get French typography applied', () => {
    const hal = content.contenders.contenders.find((c) => c.id === 'robots-hal-9000');
    expect(hal?.line).toBe(`«${NBSP}Désolé, Dave.${NBSP}»`);
    expect(content.ui.home.title[2]).toBe('Il a préféré ça.');
    expect(content.ui.home.mixedTheme.tagline).not.toMatch(/ [;:!?]/);
  });

  it('never alter ids, URLs or Giphy queries', () => {
    for (const project of content.ui.projects) {
      expect(project.url.startsWith('https://')).toBe(true);
      expect(project.url).not.toContain(NARROW_NBSP);
    }
    const raw = rawContenders.contenders;
    content.contenders.contenders.forEach((c, i) => {
      expect(c.id).toBe(raw[i]?.id);
      expect(c.giphyQuery).toBe(raw[i]?.giphyQuery);
    });
  });

  it('contain no regular space before high punctuation anywhere', () => {
    const all = JSON.stringify(content);
    expect(all).not.toMatch(/ [;!?]/);
    expect(all).not.toMatch(/« | »/);
    expect(all.includes(`${NARROW_NBSP}!`)).toBe(true);
  });
});

describe('invalid content is rejected', () => {
  const expectError = (file: unknown, message: RegExp) => {
    expect(() => parseContent(file, rawUi)).toThrow(ContentError);
    expect(() => parseContent(file, rawUi)).toThrow(message);
  };

  it('duplicate id', () => {
    const file = cloneContenders();
    file.contenders.push({ ...(file.contenders[0] as RawContenders['contenders'][number]) });
    expectError(file, /identifiant en double/);
  });

  it('unknown theme', () => {
    const file = cloneContenders();
    (file.contenders[0] as { theme: string }).theme = 'pirates';
    expectError(file, /thème inconnu : pirates/);
  });

  it('id not prefixed by its theme', () => {
    const file = cloneContenders();
    (file.contenders[0] as { id: string }).id = 'hal-9000';
    expectError(file, /doit commencer par « robots- »/);
  });

  it('origin without a year', () => {
    const file = cloneContenders();
    (file.contenders[0] as { origin: string }).origin = '2001, l’odyssée de l’espace';
    expectError(file, /Œuvre · année/);
  });

  it('missing field', () => {
    const file = cloneContenders();
    delete (file.contenders[0] as { line?: string }).line;
    expectError(file, /line/);
  });

  it('theme with fewer than 2 contenders', () => {
    const file = cloneContenders();
    file.themes.push({ id: 'vide', label: 'Vide', tagline: 'Rien.' });
    expectError(file, /« vide » a 0 prétendant/);
  });

  it('reserved mixed theme id', () => {
    const file = cloneContenders();
    (file.themes[0] as { id: string }).id = 'mix';
    expectError(file, /réservé/);
  });

  it('UI template missing its placeholder', () => {
    const ui = structuredClone(rawUi);
    ui.debate.choice = 'Tu es team quelqu’un';
    expect(() => parseContent(rawContenders, ui)).toThrow(/{name}/);
  });

  it('a quip category with a single entry', () => {
    const ui = structuredClone(rawUi);
    ui.quips.low = ['Seule.'];
    expect(() => parseContent(rawContenders, ui)).toThrow(/au moins 2 remarques/);
  });
});

// ─── Rivalités ──────────────────────────────────────────────────────────────

type RawRivalries = typeof rawRivalries;
const cloneRivalries = (): RawRivalries => structuredClone(rawRivalries);
type RawRivalry = RawRivalries['rivalries'][number];

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
    file.categories.push({ id: 'vide', label: 'Vide', tagline: 'Rien.' });
    expectError(file, /« vide » a 0 rivalité/);
  });

  it('rejects a line that is too long', () => {
    const file = cloneRivalries();
    (file.rivalries[0] as RawRivalry).a.line = 'x'.repeat(121);
    expectError(file, /120 caractères/);
  });
});
