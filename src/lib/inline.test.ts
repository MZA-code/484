import { describe, expect, it } from 'vitest';
import { brokenLinks, inlineVariables, parseInline } from './inline';

describe('parseInline', () => {
  it('keeps plain text as a single segment', () => {
    expect(parseInline('Rien de spécial.')).toEqual([{ kind: 'text', text: 'Rien de spécial.' }]);
  });

  it('turns internal and external links into link segments', () => {
    expect(
      parseInline('Voir [la page](/confidentialite) ou [la CNIL](https://www.cnil.fr).'),
    ).toEqual([
      { kind: 'text', text: 'Voir ' },
      { kind: 'link', text: 'la page', href: '/confidentialite', external: false },
      { kind: 'text', text: ' ou ' },
      { kind: 'link', text: 'la CNIL', href: 'https://www.cnil.fr', external: true },
      { kind: 'text', text: '.' },
    ]);
  });

  it('replaces variables and turns {email} into a mailto link', () => {
    expect(parseInline('{n} débats. Écris à {email}.', { n: '1000', email: 'a@b.fr' })).toEqual([
      { kind: 'text', text: '1000 débats. Écris à ' },
      { kind: 'link', text: 'a@b.fr', href: 'mailto:a@b.fr', external: false },
      { kind: 'text', text: '.' },
    ]);
  });

  it('leaves unknown variables untouched', () => {
    expect(parseInline('Salut {inconnu}')).toEqual([{ kind: 'text', text: 'Salut {inconnu}' }]);
  });

  it('refuses non-https or javascript links', () => {
    const text = '[a](http://x.fr) [b](javascript:alert(1))';
    expect(parseInline(text).every((s) => s.kind === 'text')).toBe(true);
    expect(brokenLinks(text)).toEqual(['[a]', '[b]']);
  });
});

describe('inlineVariables', () => {
  it('lists the variables of a text', () => {
    expect(inlineVariables('{a} et {email}')).toEqual(['a', 'email']);
  });
});
