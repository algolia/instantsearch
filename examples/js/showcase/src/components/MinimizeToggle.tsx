import { ChevronDown, ChevronUp } from 'lucide-preact';
import { useState } from 'preact/hooks';

import { useView } from '../context/view';

// Per-card, keyed by view + card title (titles repeat across views);
// persisted so a reload keeps the layout.
export function useMinimized(id: string) {
  const storageKey = `minimized:${useView()}:${id}`;
  const [minimized, setMinimized] = useState(
    () => localStorage.getItem(storageKey) === 'true'
  );
  const toggle = () => {
    const next = !minimized;
    setMinimized(next);
    localStorage.setItem(storageKey, String(next));
  };
  return { minimized, toggle };
}

// Hover-only like the docs links (revealed on keyboard focus too), except a
// minimized card keeps it visible so the collapsed header still reads as
// reopenable.
export function MinimizeToggle({
  minimized,
  visible,
  onToggle,
}: {
  minimized: boolean;
  visible: boolean;
  onToggle: () => void;
}) {
  const Icon = minimized ? ChevronDown : ChevronUp;
  const shown = visible || minimized;
  return (
    <button
      type="button"
      class={`cursor-pointer rounded p-0.5 text-neutral-400 transition-[opacity,color,background-color] hover:bg-neutral-200 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-300 ${shown ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100'}`}
      title={minimized ? 'Expand' : 'Minimize'}
      aria-label={minimized ? 'Expand' : 'Minimize'}
      aria-expanded={!minimized}
      onClick={onToggle}
    >
      <Icon size={14} />
    </button>
  );
}
