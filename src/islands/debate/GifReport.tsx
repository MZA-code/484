/**
 * Bouton discret « Mauvais GIF ? » sous une carte. Il n'apparaît que si un GIF est affiché,
 * envoie le signalement en arrière-plan, puis laisse place à un petit mot de remerciement.
 *
 * C'est un frère de la carte, pas un enfant : un bouton ne peut pas contenir un autre bouton.
 */
import { useEffect, useRef, useState } from 'preact/hooks';
import { formatText } from '../../lib/format';
import { gifInfo } from './gifs';
import type { DebateData } from './types';

interface Props {
  gifKey: string;
  name: string;
  texts: DebateData['texts']['debate']['gifReport'];
  /** Masqué pendant la sortie de la rivalité. */
  hidden: boolean;
}

type Status = 'idle' | 'sending' | 'thanks' | 'limited' | 'error';

/** Envoie le signalement ; renvoie l'issue à afficher. */
async function sendReport(teamId: string, gifId: string): Promise<Status> {
  try {
    const response = await fetch('/api/gif-report', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ teamId, gifId }),
    });
    if (response.status === 429) return 'limited';
    return response.ok ? 'thanks' : 'error';
  } catch {
    return 'error';
  }
}

export function GifReport({ gifKey, name, texts, hidden }: Props) {
  const [gifId, setGifId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [thanks, setThanks] = useState('');
  const feedback = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cancelled = false;
    setGifId(null);
    setStatus('idle');
    void gifInfo(gifKey).then((info) => {
      if (!cancelled) setGifId(info?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [gifKey]);

  const onClick = () => {
    if (!gifId || status !== 'idle') return;
    setStatus('sending');
    setThanks(texts.thanks[Math.floor(Math.random() * texts.thanks.length)] ?? '');
    void sendReport(gifKey, gifId).then((next) => {
      setStatus(next);
      // Le bouton disparaît : le focus passe au message plutôt que de retomber en haut de page.
      requestAnimationFrame(() => feedback.current?.focus());
    });
  };

  const message =
    status === 'thanks'
      ? thanks
      : status === 'limited'
        ? texts.limited
        : status === 'error'
          ? texts.error
          : '';

  return (
    <div class={`gif-report${hidden ? ' is-hidden' : ''}`}>
      {gifId && (status === 'idle' || status === 'sending') && (
        <button
          type="button"
          class="gif-report-button"
          aria-label={formatText(texts.label, { name })}
          disabled={status === 'sending'}
          onClick={onClick}
        >
          {texts.button}
        </button>
      )}
      <p class="gif-report-feedback" aria-live="polite" tabIndex={-1} ref={feedback}>
        {message && <span class="pop">{message}</span>}
      </p>
    </div>
  );
}
