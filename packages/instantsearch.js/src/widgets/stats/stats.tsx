/** @jsx h */

import { connectStats } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { suitComponent as component } from 'instantsearch-core/internal';
import {
  STATS_ANNOUNCEMENT_DELAY,
  createStatsComponent,
  cx,
  getStatsAnnouncementText,
  getStatsText,
} from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';

import { prepareTemplateProps, renderTemplate } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template } from '../../types';
import type {
  StatsConnectorParams,
  StatsRenderState,
  StatsWidgetDescription,
} from 'instantsearch-core';
import type { Renderer, WidgetFactory } from 'instantsearch-core';
import type { StatsProps } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'stats' });
const suit = component('Stats');

const Stats = createStatsComponent({ createElement: h, Fragment });

type TextTemplateProps = {
  hasManyResults: boolean;
  hasNoResults: boolean;
  hasOneResult: boolean;
  hasNoSortedResults: boolean;
  hasOneSortedResults: boolean;
  hasManySortedResults: boolean;
};

export type StatsCSSClasses = Partial<{
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];

  /**
   * CSS class to add to the text span element.
   */
  text: string | string[];
}>;

export type StatsTemplates = Partial<{
  /**
   * Text template, provided with `hasManyResults`, `hasNoResults`, `hasOneResult`, `hasNoSortedResults`, `hasOneSortedResults`, `hasManySortedResults`, `hitsPerPage`, `nbHits`, `nbSortedHits`, `nbPages`, `areHitsSorted`, `page`, `processingTimeMS`, `query`.
   */
  text: Template<TextTemplateProps & StatsRenderState>;
}>;

export type StatsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: StatsTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: StatsCSSClasses;
};

export type StatsWidget = WidgetFactory<
  StatsWidgetDescription & { $$widgetType: 'ais.stats' },
  StatsConnectorParams,
  StatsWidgetParams
>;

export const defaultTemplates: Required<StatsTemplates> = {
  text(props) {
    return getStatsText(props);
  },
};

type StatsWithAnnouncementProps = Omit<StatsProps, 'announcement'> & {
  announcementText: string;
};

// The announcement is debounced so that rapid changes (e.g. typing in the
// search box) settle into a single announcement instead of piling up.
function StatsWithAnnouncement({
  announcementText,
  ...props
}: StatsWithAnnouncementProps) {
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
      setAnnouncement(announcementText);
    }, STATS_ANNOUNCEMENT_DELAY);

    return () => clearTimeout(timerRef.current);
  }, [announcementText]);

  return <Stats {...props} announcement={announcement} />;
}

const renderer =
  ({
    containerNode,
    classNames,
    templateProps,
  }: {
    containerNode: HTMLElement;
    classNames: StatsCSSClasses;
    templateProps: PreparedTemplateProps<Required<StatsTemplates>>;
  }): Renderer<StatsRenderState, Partial<StatsWidgetParams>> =>
  (
    {
      hitsPerPage,
      nbHits,
      nbSortedHits,
      areHitsSorted,
      nbPages,
      page,
      processingTimeMS,
      query,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      return;
    }

    const content = renderTemplate({
      templates: templateProps.templates,
      templateKey: 'text',
      data: {
        hasManySortedResults: nbSortedHits && nbSortedHits > 1,
        hasNoSortedResults: nbSortedHits === 0,
        hasOneSortedResults: nbSortedHits === 1,
        hasManyResults: nbHits > 1,
        hasNoResults: nbHits === 0,
        hasOneResult: nbHits === 1,
        hitsPerPage,
        nbHits,
        nbSortedHits,
        areHitsSorted,
        nbPages,
        page,
        processingTimeMS,
        query,
        cssClasses: {
          root: cx(suit(), classNames.root),
          text: cx(suit({ descendantName: 'text' }), classNames.text),
        },
      },
    });

    render(
      <StatsWithAnnouncement
        classNames={classNames}
        // `null` omits the `ais-Stats-text` element, as it did when the
        // template owned it. An empty string renders an empty element.
        text={content === '' ? undefined : content}
        announcementText={getStatsAnnouncementText({
          nbHits,
          nbSortedHits,
          areHitsSorted,
        })}
      />,
      containerNode
    );
  };

/**
 * The `stats` widget is used to display useful insights about the current results.
 *
 * By default, it will display the **number of hits** and the time taken to compute the
 * results inside the engine.
 */
const stats: StatsWidget = (widgetParams) => {
  const {
    container,
    cssClasses: userCssClasses = {},
    templates = {},
  } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const classNames: StatsCSSClasses = {
    root: userCssClasses.root,
    text: userCssClasses.text,
  };

  const specializedRenderer = renderer({
    containerNode,
    classNames,
    templateProps: prepareTemplateProps({ defaultTemplates, templates }),
  });

  const makeWidget = connectStats(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({}),
    $$widgetType: 'ais.stats',
  };
};

export default stats;
