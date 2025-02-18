import { connectCurrentRefinements } from 'instantsearch.js/es/connectors';

import { formatNumber, getDateRangeFromTimestamp } from '../utils';

const statsWidget = connectCurrentRefinements<{ container: string }>(
  ({ instantSearchInstance, items, widgetParams }) => {
    const results = instantSearchInstance.mainIndex.getResults();
    if (!results) {
      return;
    }

    const containerNode = document.querySelector(widgetParams.container);
    if (!containerNode) {
      throw new Error('container not found');
    }
    const { nbHits } = results || {};

    const resultsStats = `${formatNumber(nbHits)} articles`;

    const refinements = items
      .flatMap((item) => item.refinements)
      .map((refinement) => {
        switch (refinement.type) {
          case 'numeric': {
            return getDateRangeFromTimestamp([refinement.value]);
          }
          default: {
            if (refinement.attribute === 'categories') {
              return undefined;
            }
            return refinement.label;
          }
        }
      })
      .filter(Boolean)
      .map((refinement) => `<strong>${refinement}</strong>`);

    containerNode.innerHTML = `
<div class="ais-Stats">
  <div class="ais-Stats-text">
    ${[
      [resultsStats, refinements.slice(0, 5).join(', ')]
        .filter(Boolean)
        .join(' from '),
      refinements.length > 5 && '...',
    ]
      .filter(Boolean)
      .join('')}
  </div>
</div>
`;
  }
);

export const stats = statsWidget({
  container: '[data-widget="stats"]',
});
