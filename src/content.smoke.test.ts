import { describe, expect, it } from 'vitest';
import contenders from '../content/contenders.json';
import ui from '../content/ui-texts.fr.json';

// Test de fumée de la phase 0 : les fichiers de contenu sont lisibles.
// La vraie validation (schéma Zod) arrive en phase 1.
describe('content files', () => {
  it('loads the contenders file', () => {
    expect(contenders.themes.length).toBeGreaterThan(0);
    expect(contenders.contenders.length).toBe(160);
  });

  it('loads the UI texts file', () => {
    expect(ui.home.title).toHaveLength(3);
  });
});
