/**
 * Écran de fin d'une catégorie : tous ses débats ont été tranchés ou passés, rien ne revient
 * tout seul. On propose des catégories où il reste à trancher, et « Rejouer cette catégorie ».
 */
import { useEffect, useRef } from 'preact/hooks';
import { formatText, plural } from '../../lib/format';
import type { DebateData } from './types';

export interface Suggestion {
  id: string;
  label: string;
  remaining: number;
}

interface Props {
  /** Nom de la catégorie terminée ; null pour « Tout mélangé » (tout le site est tranché). */
  category: string | null;
  suggestions: Suggestion[];
  texts: DebateData['texts']['debate']['finished'];
  onSelect: (category: string) => void;
  onReplay: () => void;
}

export function Finished({ category, suggestions, texts, onSelect, onReplay }: Props) {
  const title = useRef<HTMLHeadingElement>(null);
  // Le débat voté a disparu : on place le focus sur le titre pour que la suite reste lisible
  // au clavier et au lecteur d'écran.
  useEffect(() => title.current?.focus(), []);

  return (
    <section class="debate-finished" aria-labelledby="debate-finished-title">
      <h1 class="debate-title" id="debate-finished-title" tabIndex={-1} ref={title}>
        {category === null ? texts.allTitle : texts.title}
      </h1>
      <p class="debate-finished-text">
        {category === null ? texts.allBody : formatText(texts.body, { category })}
      </p>
      {suggestions.length > 0 && (
        <>
          <p class="debate-finished-next">{texts.next}</p>
          <ul class="debate-finished-list">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button type="button" class="category-tab" onClick={() => onSelect(s.id)}>
                  {s.label}
                  <span class="debate-finished-count">{plural(texts.remaining, s.remaining)}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <div class="debate-finished-replay">
        <button type="button" class="skip-button share-button" onClick={onReplay}>
          {category === null ? texts.replayAll : texts.replay}
        </button>
        <p class="debate-finished-hint">{texts.replayHint}</p>
      </div>
    </section>
  );
}
