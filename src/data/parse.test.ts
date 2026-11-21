import { describe, expect, it } from 'vitest';
import rawContenders from '../../content/contenders.json';
import rawUi from '../../content/ui-texts.fr.json';
import { NARROW_NBSP, NBSP } from '../lib/typography';
import { ContentError, parseContent } from './parse';

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
    ui.duel.retired = 'Il prend sa retraite.';
    expect(() => parseContent(rawContenders, ui)).toThrow(/\{name\}/);
  });

  it('a quip category with a single entry', () => {
    const ui = structuredClone(rawUi);
    ui.quips.low = ['Seule.'];
    expect(() => parseContent(rawContenders, ui)).toThrow(/au moins 2 remarques/);
  });
});
