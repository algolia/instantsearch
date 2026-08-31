import { cx } from 'instantsearch-ui-components';
import React, { useEffect, useRef, useState } from 'react';

export type StatsProps = React.ComponentProps<'div'> & {
  nbHits: number;
  processingTimeMS: number;
  nbSortedHits?: number;
  areHitsSorted?: boolean;
  classNames?: Partial<StatsClassNames>;
  translations: {
    rootElementText: StatsTranslations;
    /**
     * Text announced to assistive technologies when the results change. It
     * omits volatile details (such as the processing time) so that only the
     * meaningful result count is spoken.
     */
    announcementText?: StatsTranslations;
  };
};

export type StatsTranslationOptions = Pick<
  StatsProps,
  'nbHits' | 'processingTimeMS' | 'nbSortedHits' | 'areHitsSorted'
>;

export type StatsTranslations = (options: StatsTranslationOptions) => string;

export type StatsClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
};

// Delay before announcing an update, so that rapid changes (e.g. typing in the
// search box) settle into a single announcement instead of piling up. Mirrors
// the debounce used by GOV.UK's accessible-autocomplete.
const ANNOUNCEMENT_DELAY = 1400;

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

export function Stats({
  classNames = {},
  nbHits,
  processingTimeMS,
  nbSortedHits,
  areHitsSorted,
  translations,
  ...props
}: StatsProps) {
  const translationOptions: StatsTranslationOptions = {
    nbHits,
    processingTimeMS,
    nbSortedHits,
    areHitsSorted,
  };

  const nextAnnouncement = translations.announcementText
    ? translations.announcementText(translationOptions)
    : '';
  const [announcement, setAnnouncement] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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
    <div
      {...props}
      className={cx('ais-Stats', classNames.root, props.className)}
    >
      <span className="ais-Stats-text">
        {translations.rootElementText(translationOptions)}
      </span>
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
}
