export type StatsTextOptions = {
  /**
   * Number of hits matching the query
   */
  nbHits: number;
  /**
   * Number of relevant hits when Relevant sort is applied
   */
  nbSortedHits?: number;
  /**
   * Whether Relevant sort is applied to the results
   */
  areHitsSorted?: boolean;
  /**
   * Time the engine took to compute the results, in milliseconds
   */
  processingTimeMS: number;
};

// Delay before announcing an update, so that rapid changes (e.g. typing in the
// search box) settle into a single announcement instead of piling up. Mirrors
// the debounce used by GOV.UK's accessible-autocomplete.
export const STATS_ANNOUNCEMENT_DELAY = 1400;

/**
 * The default result count sentence, without the processing time. It's what
 * gets announced to assistive technologies, so that volatile details aren't
 * spoken on every update.
 */
export function getStatsAnnouncementText({
  nbHits,
  nbSortedHits,
  areHitsSorted,
}: Omit<StatsTextOptions, 'processingTimeMS'>) {
  if (areHitsSorted) {
    const suffix = `sorted out of ${nbHits.toLocaleString()}`;

    if (nbSortedHits === 0) {
      return `No relevant results ${suffix}`;
    }

    if (nbSortedHits === 1) {
      return `1 relevant result ${suffix}`;
    }

    if (nbSortedHits! > 1) {
      return `${nbSortedHits!.toLocaleString()} relevant results ${suffix}`;
    }

    return '';
  }

  if (nbHits === 0) {
    return 'No results';
  }

  if (nbHits === 1) {
    return '1 result';
  }

  if (nbHits > 1) {
    return `${nbHits.toLocaleString()} results`;
  }

  return '';
}

/**
 * The default visible sentence: the result count and the processing time.
 */
export function getStatsText(options: StatsTextOptions) {
  return `${getStatsAnnouncementText(
    options
  )} found in ${options.processingTimeMS.toLocaleString()}ms`;
}
