/** Icône d'achievement en SVG ; son dessin est préparé au build (voir debate-data.ts). */
import type { IconPath } from './types';

export function AchievementIcon({ svg, class: cls }: { svg: IconPath; class?: string }) {
  return (
    <svg class={cls} viewBox={svg.viewBox} aria-hidden="true" focusable="false">
      <path fill="currentColor" d={svg.path} />
    </svg>
  );
}
