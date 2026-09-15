import { resultCard } from 'instantsearch.js/es/widgets';

import { SHOWCASE_AGENT_ID } from '../../constants';
import { useWidget } from '../../hooks/useWidget';

export function WidgetResultCard() {
  const ref = useWidget((el) =>
    resultCard({ container: el, agentId: SHOWCASE_AGENT_ID })
  );

  return (
    <div class="flex flex-col gap-3">
      <p class="text-xs text-neutral-500 dark:text-neutral-400">
        Shows for queries of two words or more, once the page query changes (as
        you type with <span class="font-mono">searchBox</span>, on submit with
        the autocomplete). The Agent Studio Rule that enables it is simulated on
        the search client until the backend ships.
      </p>
      <div ref={ref} />
    </div>
  );
}
