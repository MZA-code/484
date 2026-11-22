/**
 * Bouton discret « Mauvais GIF ? » sous une carte. Il n'apparaît que si un GIF est affiché,
 * envoie le signalement en arrière-plan, puis laisse place à un petit mot de remerciement.
 *
 * Mode admin (voir src/lib/admin.ts) : le signalement écarte le GIF tout de suite, la carte
 * affiche le suivant, et le bouton reste là pour écarter aussi celui-ci si besoin.
 *
 * C'est un frère de la carte, pas un enfant : un bouton ne peut pas contenir un autre bouton.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ADMIN_HEADER, adminToken } from '../../lib/admin';
import { formatText } from '../../lib/format';
import { gifInfo, refreshGif, useGifVersion } from './gifs';
import type { DebateData } from './types';

interface Props {
  gifKey: string;
  name: string;
  texts: DebateData['texts']['debate']['gifReport'];
  /** Masqué pendant la sortie de la rivalité. */
  hidden: boolean;
}

type Status = 'idle' | 'sending' | 'thanks' | 'limited' | 'error' | 'admin';

/** Envoie le signalement ; renvoie l'issue à afficher. */
async function sendReport(teamId: string, gifId: string, admin: string | null): Promise<Status> {
  try {
    const response = await fetch('/api/gif-report', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(admin ? { [ADMIN_HEADER]: admin } : {}) },
      body: JSON.stringify({ teamId, gifId }),
    });
    if (response.status === 429) return 'limited';
    if (!response.ok) return 'error';
    const body = (await response.json()) as { rejected?: boolean };
    return body.rejected ? 'admin' : 'thanks';
  } catch {
    return 'error';
  }
}

export function GifReport({ gifKey, name, texts, hidden }: Props) {
  const admin = useMemo(adminToken, []);
  const version = useGifVersion(gifKey);
  const [gifId, setGifId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [thanks, setThanks] = useState('');
  const feedback = useRef<HTMLParagraphElement>(null);

  // Nouvelle team : on repart de zéro.
  useEffect(() => setStatus('idle'), [gifKey]);

  // GIF affiché (et GIF suivant après un rafraîchissement en mode admin).
  useEffect(() => {
    let cancelled = false;
    setGifId(null);
    void gifInfo(gifKey).then((info) => {
      if (!cancelled) setGifId(info?.id ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [gifKey, version]);

  const onClick = () => {
    if (!gifId || status === 'sending') return;
    setStatus('sending');
    setThanks(texts.thanks[Math.floor(Math.random() * texts.thanks.length)] ?? '');
    void sendReport(gifKey, gifId, admin).then((next) => {
      setStatus(next);
      if (next === 'admin') {
        refreshGif(gifKey);
        return;
      }
      // Le bouton disparaît : le focus passe au message plutôt que de retomber en haut de page.
      requestAnimationFrame(() => feedback.current?.focus());
    });
  };

  const messages: Partial<Record<Status, string>> = {
    thanks,
    limited: texts.limited,
    error: texts.error,
    admin: texts.admin,
  };
  const message = messages[status] ?? '';
  const showButton = gifId && (status === 'idle' || status === 'sending' || status === 'admin');

  return (
    <div class={`gif-report${hidden ? ' is-hidden' : ''}`}>
      {showButton && (
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
