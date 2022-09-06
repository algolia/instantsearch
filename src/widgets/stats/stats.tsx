/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import type {
  StatsComponentCSSClasses,
  StatsComponentTemplates,
} from '../../components/Stats/Stats';
import Stats from '../../components/Stats/Stats';
import type {
  StatsConnectorParams,
  StatsRenderState,
  StatsWidgetDescription,
} from '../../connectors/stats/connectStats';
import connectStats from '../../connectors/stats/connectStats';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import type { Renderer, Template, WidgetFactory } from '../../types';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps';
import { formatNumber } from '../../lib/formatNumber';

const withUsage = createDocumentationMessageGenerator({ name: 'stats' });
const suit = component('Stats');

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
  text: Template<
    {
      hasManyResults: boolean;
      hasNoResults: boolean;
      hasOneResult: boolean;
      hasNoSortedResults: boolean;
      hasOneSortedResults: boolean;
      hasManySortedResults: boolean;
    } & StatsRenderState
  >;
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

export const defaultTemplates: StatsComponentTemplates = {
  text({
    areHitsSorted,
    hasNoSortedResults,
    hasOneSortedResults,
    hasManySortedResults,
    hasNoResults,
    hasOneResult,
    hasManyResults,
    nbSortedHits,
    nbHits,
    processingTimeMS,
  }) {
    let sentence = '';

    if (areHitsSorted) {
      if (hasNoSortedResults) {
        sentence = 'No relevant results';
      }

      if (hasOneSortedResults) {
        sentence = '1 relevant result';
      }

      if (hasManySortedResults) {
        sentence = `${formatNumber(nbSortedHits || 0)} relevant results`;
      }

      sentence += ` sorted out of ${formatNumber(nbHits)}`;
    } else {
      if (hasNoResults) {
        sentence = 'No results';
      }

      if (hasOneResult) {
        sentence = '1 result';
      }

      if (hasManyResults) {
        sentence = `${formatNumber(nbHits)} results`;
      }
    }

    return `${sentence} found in ${processingTimeMS}ms`;
  },
};

const renderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    renderState: {
      templateProps?: PreparedTemplateProps<StatsComponentTemplates>;
    };
    cssClasses: StatsComponentCSSClasses;
    containerNode: HTMLElement;
    templates: StatsTemplates;
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
      instantSearchInstance,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });

      return;
    }

    render(
      <Stats
        cssClasses={cssClasses}
        hitsPerPage={hitsPerPage}
        nbHits={nbHits}
        nbSortedHits={nbSortedHits}
        areHitsSorted={areHitsSorted}
        nbPages={nbPages}
        page={page}
        processingTimeMS={processingTimeMS}
        query={query}
        templateProps={renderState.templateProps!}
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

  const cssClasses: StatsComponentCSSClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    renderState: {},
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
