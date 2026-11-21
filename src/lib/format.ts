/**
 * Remplit les marqueurs `{clé}` d'un texte. Un marqueur sans valeur reste visible,
 * pour qu'un oubli se remarque au lieu de disparaître en silence.
 */
export function formatText(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (marker, key: string) =>
    key in values ? String(values[key]) : marker,
  );
}

/** Choisit la forme singulier/pluriel d'un texte selon `n` (règle française : 0 et 1 au singulier). */
export function plural(forms: { one: string; other: string }, n: number): string {
  return formatText(Math.abs(n) < 2 ? forms.one : forms.other, { n });
}
