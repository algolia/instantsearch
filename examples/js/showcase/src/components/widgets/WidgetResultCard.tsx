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
        Shows for queries of two words or more. The enabling Rule is mocked in
        the search client.
      </p>
      <div ref={ref} />
    </div>
  );
}
