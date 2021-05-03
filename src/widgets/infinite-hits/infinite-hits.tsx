/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import { SearchResults } from 'algoliasearch-helper';
import InfiniteHits from '../../components/InfiniteHits/InfiniteHits';
import connectInfiniteHits, {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
  InfiniteHitsCache,
  InfiniteHitsWidgetDescription,
} from '../../connectors/infinite-hits/connectInfiniteHits';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { withInsights, withInsightsListener } from '../../lib/insights';
import {
  WidgetFactory,
  Template,
  TemplateWithBindEvent,
  Hit,
  InsightsClientWrapper,
  Renderer,
} from '../../types';
import defaultTemplates from './defaultTemplates';
import { InsightsEvent } from '../../middlewares/createInsightsMiddleware';

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
});
const suit = component('InfiniteHits');
const InfiniteHitsWithInsightsListener = withInsightsListener(InfiniteHits);

export type InfiniteHitsCSSClasses = {
  /**
   * The root element of the widget.
   */
  root?: string | string[];

  /**
   * The root container without results.
   */
  emptyRoot?: string | string[];

  /**
   * The list of results.
   */
  list?: string | string[];

  /**
   * The list item.
   */
  item?: string | string[];

  /**
   * The “Show previous” button.
   */
  loadPrevious?: string | string[];

  /**
   * The disabled “Show previous” button.
   */
  disabledLoadPrevious?: string | string[];

  /**
   * The “Show more” button.
   */
  loadMore?: string | string[];

  /**
   * The disabled “Show more” button.
   */
  disabledLoadMore?: string | string[];
};

export type InfiniteHitsTemplates = {
  /**
   * The template to use when there are no results.
   */
  empty?: Template<{ results: SearchResults }>;

  /**
   * The template to use for the “Show previous” label.
   */
  showPreviousText?: Template;

  /**
   * The template to use for the “Show more” label.
   */
  showMoreText?: Template;

  /**
   * The template to use for each result.
   */
  item?: TemplateWithBindEvent<
    Hit & {
      // @deprecated the index in the hits array, use __position instead, which is the absolute position
      __hitIndex: number;
    }
  >;
};

export type InfiniteHitsWidgetParams = {
  /**
   * The CSS Selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * The CSS classes to override.
   */
  cssClasses?: InfiniteHitsCSSClasses;

  /**
   * The templates to use for the widget.
   */
  templates?: InfiniteHitsTemplates;

  /**
   * Reads and writes hits from/to cache.
   * When user comes back to the search page after leaving for product page,
   * this helps restore InfiniteHits and its scroll position.
   */
  cache?: InfiniteHitsCache;
};

export type InfiniteHitsWidget = WidgetFactory<
  InfiniteHitsWidgetDescription & { $$widgetType: 'ais.infiniteHits' },
  InfiniteHitsConnectorParams,
  InfiniteHitsWidgetParams
>;

const renderer = ({
  cssClasses,
  containerNode,
  renderState,
  templates,
  showPrevious: hasShowPrevious,
}): Renderer<InfiniteHitsRenderState, Partial<InfiniteHitsWidgetParams>> => (
  {
    hits,
    results,
    showMore,
    showPrevious,
    isFirstPage,
    isLastPage,
    instantSearchInstance,
    insights,
    bindEvent,
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
    <InfiniteHitsWithInsightsListener
      cssClasses={cssClasses}
      hits={hits}
      results={results}
      hasShowPrevious={hasShowPrevious}
      showPrevious={showPrevious}
      showMore={showMore}
      templateProps={renderState.templateProps}
      isFirstPage={isFirstPage}
      isLastPage={isLastPage}
      insights={insights as InsightsClientWrapper}
      sendEvent={(event: InsightsEvent) => {
        instantSearchInstance.sendEventToInsights(event);
      }}
      bindEvent={bindEvent}
    />,
    containerNode
  );
};

const infiniteHits: InfiniteHitsWidget = widgetParams => {
  const {
    container,
    escapeHTML,
    transformItems,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    showPrevious,
    cache,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    loadPrevious: cx(
      suit({ descendantName: 'loadPrevious' }),
      userCssClasses.loadPrevious
    ),
    disabledLoadPrevious: cx(
      suit({ descendantName: 'loadPrevious', modifierName: 'disabled' }),
      userCssClasses.disabledLoadPrevious
    ),
    loadMore: cx(suit({ descendantName: 'loadMore' }), userCssClasses.loadMore),
    disabledLoadMore: cx(
      suit({ descendantName: 'loadMore', modifierName: 'disabled' }),
      userCssClasses.disabledLoadMore
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    showPrevious,
    renderState: {},
  });

  const makeWidget = withInsights(connectInfiniteHits)(
    specializedRenderer,
    () => render(null, containerNode)
  );

  return {
    ...makeWidget({
      escapeHTML,
      transformItems,
      showPrevious,
      cache,
    }),
    $$widgetType: 'ais.infiniteHits',
  };
};

export default infiniteHits;
