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
    const { nbHits } = results;

    const resultsStats = `${formatNumber(nbHits)} articles`;

    const currentRefinements = items.flatMap((item) => item.refinements);
    const stringRefinements = currentRefinements
      .filter((refinement) => refinement.type !== 'numeric')
      .filter((refinement) => refinement.attribute !== 'categories')
      .map((refinement) => refinement.label);
    const dateRefinement = getDateRangeFromTimestamp(
      currentRefinements
        .filter((refinement) => refinement.attribute === 'created_at_timestamp')
        .map((refinement) => Number(refinement.value))
    );

    const refinements = [...stringRefinements, dateRefinement]
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
