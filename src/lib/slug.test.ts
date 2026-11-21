import { describe, expect, it } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('builds a readable anchor from a French title', () => {
    expect(slugify('Tes droits')).toBe('tes-droits');
    expect(slugify('Établissement de cette déclaration')).toBe(
      'etablissement-de-cette-declaration',
    );
    expect(slugify('Retour d’information et contact')).toBe('retour-d-information-et-contact');
  });
});
