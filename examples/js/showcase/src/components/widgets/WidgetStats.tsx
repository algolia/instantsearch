import { stats } from 'instantsearch.js/es/widgets';

import { useWidget } from '../../hooks/useWidget';

export function WidgetStats() {
  const ref = useWidget((el) =>
    stats({
      container: el,
      templates: {
        text(data, { html }) {
          return html`
            <span class="text-sm text-neutral-500 dark:text-neutral-400">
              ${data.nbHits.toLocaleString()} results
              (${data.processingTimeMS}ms)
            </span>
          `;
        },
      },
    })
  );
  return <div ref={ref} />;
}
