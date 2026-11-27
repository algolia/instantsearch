import {
  STATS_ANNOUNCEMENT_DELAY,
  createStatsComponent,
} from 'instantsearch-ui-components';
import React, {
  createElement,
  Fragment,
  useEffect,
  useRef,
  useState,
} from 'react';

import type { Pragma, StatsClassNames } from 'instantsearch-ui-components';

export type { StatsClassNames } from 'instantsearch-ui-components';

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

const StatsUiComponent = createStatsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

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
    }, STATS_ANNOUNCEMENT_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [nextAnnouncement]);

  return (
    <StatsUiComponent
      {...(props as Record<string, unknown>)}
      classNames={classNames}
      text={translations.rootElementText(translationOptions)}
      announcement={announcement}
    />
  );
}
