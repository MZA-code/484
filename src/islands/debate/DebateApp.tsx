/**
 * Point d'entrée de l'îlot : charge les données du jeu (un seul fichier JSON, mis en cache),
 * puis affiche le débat. Pendant le chargement, un squelette de même taille ; en cas d'échec,
 * un message, et le reste du site continue de fonctionner.
 */
import { useEffect, useState } from 'preact/hooks';
import Debate from './Debate';
import type { DebateData } from './types';

interface Props {
  dataUrl: string;
  /** Rivalité à afficher en premier (page /debat/<id>). */
  initialRivalry?: string | undefined;
  loadingText: string;
  errorText: string;
}

export default function DebateApp({ dataUrl, initialRivalry, loadingText, errorText }: Props) {
  const [data, setData] = useState<DebateData | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(dataUrl)
      .then((r) =>
        r.ok ? (r.json() as Promise<DebateData>) : Promise.reject(new Error(String(r.status))),
      )
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [dataUrl]);

  if (failed) return <p class="debate-status">{errorText}</p>;
  if (!data) {
    return (
      <div class="debate-skeleton" aria-busy="true">
        <p class="debate-status">{loadingText}</p>
        <div class="debate-skeleton-arena">
          <div class="debate-skeleton-card" />
          <div class="debate-skeleton-card" />
        </div>
      </div>
    );
  }
  return <Debate data={data} initialRivalry={initialRivalry} />;
}
