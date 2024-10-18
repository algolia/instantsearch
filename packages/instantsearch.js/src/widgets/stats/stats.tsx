/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import Stats from '../../components/Stats/Stats';
import connectStats from '../../connectors/stats/connectStats';
import { formatNumber } from '../../lib/formatNumber';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  StatsComponentCSSClasses,
  StatsComponentTemplates,
} from '../../components/Stats/Stats';
import type {
  StatsConnectorParams,
  StatsRenderState,
  StatsWidgetDescription,
} from '../../connectors/stats/connectStats';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Renderer, Template, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'stats' });
const suit = component('Stats');

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

export const defaultTemplates: StatsComponentTemplates = {
  text(props) {
    return `${
      props.areHitsSorted
        ? getSortedResultsSentence(props)
        : getResultsSentence(props)
    } found in ${props.processingTimeMS}ms`;
  },
};

function getSortedResultsSentence({
  nbHits,
  hasNoSortedResults,
  hasOneSortedResults,
  hasManySortedResults,
  nbSortedHits,
}: TextTemplateProps & StatsRenderState) {
  const suffix = `sorted out of ${formatNumber(nbHits)}`;

  if (hasNoSortedResults) {
    return `No relevant results ${suffix}`;
  }

  if (hasOneSortedResults) {
    return `1 relevant result ${suffix}`;
  }

  if (hasManySortedResults) {
    return `${formatNumber(nbSortedHits || 0)} relevant results ${suffix}`;
  }

  return '';
}

function getResultsSentence({
  nbHits,
  hasNoResults,
  hasOneResult,
  hasManyResults,
}: TextTemplateProps & StatsRenderState) {
  if (hasNoResults) {
    return 'No results';
  }

  if (hasOneResult) {
    return '1 result';
  }

  if (hasManyResults) {
    return `${formatNumber(nbHits)} results`;
  }

  return '';
}

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
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
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
