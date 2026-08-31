/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { formatNumber } from '../../lib/formatNumber';
import Template from '../Template/Template';

import type { ComponentCSSClasses } from '../../types';
import type {
  StatsCSSClasses,
  StatsTemplates,
} from '../../widgets/stats/stats';

export type StatsComponentCSSClasses = ComponentCSSClasses<StatsCSSClasses>;

export type StatsComponentTemplates = Required<StatsTemplates>;

type StatsProps = {
  cssClasses: StatsComponentCSSClasses;
  templateProps: {
    [key: string]: any;
    templates: StatsComponentTemplates;
  };
  hitsPerPage: number | undefined;
  nbHits: number;
  nbSortedHits: number | undefined;
  areHitsSorted: boolean;
  nbPages: number;
  page: number;
  processingTimeMS: number;
  query: string;
};

// Delay before announcing an update, so that rapid changes (e.g. typing in the
// search box) settle into a single announcement instead of piling up. Mirrors
// the debounce used by GOV.UK's accessible-autocomplete.
const ANNOUNCEMENT_DELAY = 1400;

const visuallyHiddenStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

// Result count without the volatile details (such as the processing time) that
// are part of the visible text, so that only the meaningful count is announced.
function getAnnouncement(
  nbHits: number,
  nbSortedHits: number | undefined,
  areHitsSorted: boolean
) {
  if (areHitsSorted) {
    const suffix = `sorted out of ${formatNumber(nbHits)}`;

    if (nbSortedHits === 0) {
      return `No relevant results ${suffix}`;
    }
    if (nbSortedHits === 1) {
      return `1 relevant result ${suffix}`;
    }
    return `${formatNumber(nbSortedHits || 0)} relevant results ${suffix}`;
  }

  if (nbHits === 0) {
    return 'No results';
  }
  if (nbHits === 1) {
    return '1 result';
  }
  return `${formatNumber(nbHits)} results`;
}

const Stats = ({
  nbHits,
  nbSortedHits,
  areHitsSorted,
  cssClasses,
  templateProps,
  ...rest
}: StatsProps) => {
  const nextAnnouncement = getAnnouncement(nbHits, nbSortedHits, areHitsSorted);
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const isInitialRef = useRef(true);

  useEffect(() => {
    // Don't announce the initial results, only subsequent changes.
    if (isInitialRef.current) {
      isInitialRef.current = false;
      return undefined;
    }

    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setAnnouncement(nextAnnouncement);
    }, ANNOUNCEMENT_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [nextAnnouncement]);

  return (
    <div className={cx(cssClasses.root)}>
      <Template
        {...templateProps}
        templateKey="text"
        rootTagName="span"
        rootProps={{ className: cssClasses.text }}
        data={{
          hasManySortedResults: nbSortedHits && nbSortedHits > 1,
          hasNoSortedResults: nbSortedHits === 0,
          hasOneSortedResults: nbSortedHits === 1,
          hasManyResults: nbHits > 1,
          hasNoResults: nbHits === 0,
          hasOneResult: nbHits === 1,
          nbHits,
          nbSortedHits,
          areHitsSorted,
          cssClasses,
          ...rest,
        }}
      />
      <span
        className="ais-Stats-announcement"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={visuallyHiddenStyle}
      >
        {announcement}
      </span>
    </div>
  );
};

export default Stats;
