import { connectHits } from 'instantsearch.js/es/connectors';

import { formatNumber, getDateRangeFromTimestamp } from '../utils';

const statsWidget = connectHits<{ container: string }>(
  ({ results, widgetParams }) => {
    if (!results) {
      return;
    }

    const containerNode = document.querySelector(widgetParams.container);
    if (!containerNode) {
      throw new Error('container not found');
    }
    const { nbHits } = results;

    const resultsStats = `${formatNumber(nbHits)} articles`;

    const stringRefinements = results
      .getRefinements()
      .filter((refinement) => refinement.type !== 'numeric')
      .filter((refinement) => refinement.attributeName !== 'categories')
      .map((refinement) => refinement.name);
    const dateRefinement = getDateRangeFromTimestamp(
      results
        .getRefinements()
        .filter(
          (refinement) => refinement.attributeName === 'created_at_timestamp'
        )
        .map((refinement) => refinement.numericValue)
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
