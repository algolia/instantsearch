import { connectHits } from 'instantsearch.js/es/connectors';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getUnixTime,
} from 'date-fns';
import { formatNumber } from '../utils';

const currentDate = new Date();

function getDateRangeFromTimestamp(timestamps: number[]) {
  const [start, end] = timestamps;

  if (
    start === getUnixTime(startOfDay(currentDate)) &&
    end === getUnixTime(endOfDay(currentDate))
  ) {
    return 'Today';
  }

  if (
    start === getUnixTime(startOfWeek(currentDate)) &&
    end === getUnixTime(endOfWeek(currentDate))
  ) {
    return 'This week';
  }

  if (
    start === getUnixTime(startOfMonth(currentDate)) &&
    end === getUnixTime(endOfMonth(currentDate))
  ) {
    return 'This month';
  }

  if (
    start === getUnixTime(startOfYear(currentDate)) &&
    end === getUnixTime(endOfYear(currentDate))
  ) {
    return 'This year';
  }

  return '';
}

const statsWidget = connectHits<{ container: string }>(
  ({ results, widgetParams }) => {
    if (!results) {
      return;
    }

    const containerNode = document.querySelector(widgetParams.container);
    const { nbHits } = results;

    const resultsStats = `${formatNumber(nbHits)} articles`;

    const stringRefinements = results
      .getRefinements()
      .filter(refinement => refinement.type !== 'numeric')
      .filter(refinement => refinement.attributeName !== 'categories')
      .map(refinement => refinement.name);
    const dateRefinement = getDateRangeFromTimestamp(
      results
        .getRefinements()
        .filter(
          refinement => refinement.attributeName === 'created_at_timestamp'
        )
        .map(refinement => refinement.numericValue)
    );

    const refinements = [...stringRefinements, dateRefinement]
      .filter(Boolean)
      .map(refinement => `<strong>${refinement}</strong>`);

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
