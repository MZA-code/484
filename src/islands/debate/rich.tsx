/** Remplit un texte à trous avec des éléments (ex. le nom en gras dans « Tu es team {name} »). */
import type { ComponentChildren } from 'preact';

export function fill(
  template: string,
  values: Record<string, ComponentChildren>,
): ComponentChildren[] {
  return template
    .split(/(\{\w+\})/)
    .map((part) => {
      const key = /^\{(\w+)\}$/.exec(part)?.[1];
      return key !== undefined && key in values ? values[key] : part;
    })
    .filter((part) => part !== '');
}
