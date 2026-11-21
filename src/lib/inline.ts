/**
 * Mise en forme minimale des textes longs (pages légales, À propos), écrits dans `content/` :
 * - `[libellé](adresse)` devient un lien : adresse interne (`/page`, `#ancre`) ou externe (`https://…`) ;
 * - `{nom}` est remplacé par une variable ; `{email}` devient un lien `mailto:`.
 *
 * Pas de Markdown complet : juste ce qu'il faut, et rien qui puisse injecter du HTML.
 */

export type InlineSegment =
  { kind: 'text'; text: string } | { kind: 'link'; text: string; href: string; external: boolean };

/** Lien `[libellé](adresse)` : adresse interne ou https, sans espace. */
const LINK = /\[([^\]]+)\]\(((?:\/|#|https:\/\/)[^\s)]*)\)/g;
const VARIABLE = /\{(\w+)\}/g;

/** Variables utilisées dans un texte (pour la validation du contenu). */
export function inlineVariables(text: string): string[] {
  return [...text.matchAll(VARIABLE)].map((m) => m[1] ?? '');
}

/** Libellés entre crochets qui ne forment pas un lien valide (adresse absente ou non autorisée). */
export function brokenLinks(text: string): string[] {
  const withoutLinks = text.replace(LINK, '');
  return [...withoutLinks.matchAll(/\[([^\]]*)\]/g)].map((m) => m[0]);
}

function substitute(text: string, vars: Readonly<Record<string, string>>): string {
  return text.replace(VARIABLE, (whole, name: string) => vars[name] ?? whole);
}

/** Découpe un texte en segments affichables. `{email}` devient un lien vers `vars.email`. */
export function parseInline(
  text: string,
  vars: Readonly<Record<string, string>> = {},
): InlineSegment[] {
  const segments: InlineSegment[] = [];
  const pushText = (raw: string) => {
    // L'adresse email devient un lien à part entière.
    const parts = raw.split('{email}');
    parts.forEach((part, i) => {
      if (part !== '') segments.push({ kind: 'text', text: substitute(part, vars) });
      if (i < parts.length - 1 && vars.email !== undefined) {
        segments.push({
          kind: 'link',
          text: vars.email,
          href: `mailto:${vars.email}`,
          external: false,
        });
      }
    });
  };

  let cursor = 0;
  for (const match of text.matchAll(LINK)) {
    pushText(text.slice(cursor, match.index));
    const href = match[2] ?? '';
    segments.push({
      kind: 'link',
      text: substitute(match[1] ?? '', vars),
      href,
      external: href.startsWith('https://'),
    });
    cursor = match.index + match[0].length;
  }
  pushText(text.slice(cursor));
  return segments;
}
