/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import Stats from '../../components/Stats/Stats';
import connectStats, {
  StatsConnectorParams,
  StatsRenderState,
  StatsWidgetDescription,
} from '../../connectors/stats/connectStats';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { Renderer, Template, WidgetFactory } from '../../types';

const withUsage = createDocumentationMessageGenerator({ name: 'stats' });
const suit = component('Stats');

export type StatsCSSClasses = {
  /**
   * CSS class to add to the root element.
   */
  root: string | string[];

  /**
   * CSS class to add to the text span element.
   */
  text: string | string[];
};

export type StatsTemplates = {
  /**
   * Text template, provided with `hasManyResults`, `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbSortedHits`, `nbPages`, `areHitsSorted`, `page`, `processingTimeMS`, `query`.
   */
  text: Template<
    {
      hasManyResults: boolean;
      hasNoResults: boolean;
      hasOneResult: boolean;
    } & StatsRenderState
  >;
};

export type StatsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: Partial<StatsTemplates>;

  /**
   * CSS classes to add.
   */
  cssClasses?: Partial<StatsCSSClasses>;
};

export type StatsWidget = WidgetFactory<
  StatsWidgetDescription & { $$widgetType: 'ais.stats' },
  StatsConnectorParams,
  StatsWidgetParams
>;

export const defaultTemplates: StatsTemplates = {
  text: `
    {{#areHitsSorted}}
      {{#hasNoSortedResults}}No relevant results{{/hasNoSortedResults}}
      {{#hasOneSortedResults}}1 relevant result{{/hasOneSortedResults}}
      {{#hasManySortedResults}}{{#helpers.formatNumber}}{{nbSortedHits}}{{/helpers.formatNumber}} relevant results{{/hasManySortedResults}}
      sorted out of {{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}}
    {{/areHitsSorted}}
    {{^areHitsSorted}}
      {{#hasNoResults}}No results{{/hasNoResults}}
      {{#hasOneResult}}1 result{{/hasOneResult}}
      {{#hasManyResults}}{{#helpers.formatNumber}}{{nbHits}}{{/helpers.formatNumber}} results{{/hasManyResults}}
    {{/areHitsSorted}}
    found in {{processingTimeMS}}ms`,
};

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  templates,
}): Renderer<StatsRenderState, Partial<StatsWidgetParams>> => (
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
      templateProps={renderState.templateProps}
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
const stats: StatsWidget = widgetParams => {
  const {
    container,
    cssClasses: userCssClasses = {} as StatsCSSClasses,
    templates = defaultTemplates,
  } = widgetParams || {};
  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const cssClasses: StatsCSSClasses = {
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
