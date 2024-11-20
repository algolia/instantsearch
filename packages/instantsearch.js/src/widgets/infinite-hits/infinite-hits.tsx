/** @jsx h */

import { cx } from 'instantsearch-ui-components';
import { h, render } from 'preact';

import InfiniteHits from '../../components/InfiniteHits/InfiniteHits';
import connectInfiniteHits from '../../connectors/infinite-hits/connectInfiniteHits';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  InfiniteHitsComponentCSSClasses,
  InfiniteHitsComponentTemplates,
} from '../../components/InfiniteHits/InfiniteHits';
import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
  InfiniteHitsCache,
  InfiniteHitsWidgetDescription,
} from '../../connectors/infinite-hits/connectInfiniteHits';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  WidgetFactory,
  Template,
  InsightsClient,
  Renderer,
  BaseHit,
  Hit,
  TemplateWithSendEvent,
  Widget,
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
});
const suit = component('InfiniteHits');

export type InfiniteHitsCSSClasses = Partial<{
  /**
   * The root element of the widget.
   */
  root: string | string[];

  /**
   * The root container without results.
   */
  emptyRoot: string | string[];

  /**
   * The list of results.
   */
  list: string | string[];

  /**
   * The list item.
   */
  item: string | string[];

  /**
   * The “Show previous” button.
   */
  loadPrevious: string | string[];

  /**
   * The disabled “Show previous” button.
   */
  disabledLoadPrevious: string | string[];

  /**
   * The “Show more” button.
   */
  loadMore: string | string[];

  /**
   * The disabled “Show more” button.
   */
  disabledLoadMore: string | string[];

  /**
   * Class names to apply to the banner element
   */
  bannerRoot: string | string[];

  /**
   * Class names to apply to the banner image element
   */
  bannerImage: string | string[];

  /**
   * Class names to apply to the banner link element
   */
  bannerLink: string | string[];
}>;

export type InfiniteHitsTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * The template to use when there are no results.
     */
    empty: Template<SearchResults<THit>>;

    /**
     * The template to use for the “Show previous” label.
     */
    showPreviousText: Template;

    /**
     * The template to use for the “Show more” label.
     */
    showMoreText: Template;

    /**
     * The template to use for each result.
     */
    item: TemplateWithSendEvent<Hit<THit>>;

    /**
     * Template to use for the banner.
     */
    banner: Template<{
      banner: Required<InfiniteHitsRenderState['banner']>;
      className: string;
    }>;
  }>;

export type InfiniteHitsWidgetParams<
  THit extends NonNullable<object> = BaseHit
> = {
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
  templates?: InfiniteHitsTemplates<THit>;

  /**
   * Reads and writes hits from/to cache.
   * When user comes back to the search page after leaving for product page,
   * this helps restore InfiniteHits and its scroll position.
   */
  cache?: InfiniteHitsCache;
};

export type InfiniteHitsWidget<THit extends NonNullable<object> = BaseHit> =
  WidgetFactory<
    InfiniteHitsWidgetDescription<THit> & { $$widgetType: 'ais.infiniteHits' },
    InfiniteHitsConnectorParams<THit>,
    InfiniteHitsWidgetParams<THit>
  >;

const renderer =
  <THit extends NonNullable<object> = BaseHit>({
    containerNode,
    cssClasses,
    renderState,
    templates,
    showPrevious: hasShowPrevious,
  }: {
    containerNode: HTMLElement;
    cssClasses: InfiniteHitsComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<InfiniteHitsComponentTemplates>;
    };
    templates: InfiniteHitsTemplates<THit>;
    showPrevious?: boolean;
  }): Renderer<InfiniteHitsRenderState, Partial<InfiniteHitsWidgetParams>> =>
  (
    {
      items,
      results,
      showMore,
      showPrevious,
      isFirstPage,
      isLastPage,
      insights,
      bindEvent,
      sendEvent,
      banner,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps =
        prepareTemplateProps<InfiniteHitsComponentTemplates>({
          defaultTemplates,
          templates: templates as InfiniteHitsComponentTemplates,
        });
      return;
    }

    render(
      <InfiniteHits
        cssClasses={cssClasses}
        hits={items}
        results={results!}
        hasShowPrevious={hasShowPrevious!}
        showPrevious={showPrevious}
        showMore={showMore}
        templateProps={renderState.templateProps!}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        insights={insights as InsightsClient}
        sendEvent={sendEvent}
        bindEvent={bindEvent}
        banner={banner}
      />,
      containerNode
    );
  };

export default (function infiniteHits<
  THit extends NonNullable<object> = BaseHit
>(
  widgetParams: InfiniteHitsWidgetParams<THit> &
    InfiniteHitsConnectorParams<THit>
) {
  const {
    container,
    escapeHTML,
    transformItems,
    templates = {},
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
    bannerRoot: cx(
      suit({ descendantName: 'banner' }),
      userCssClasses.bannerRoot
    ),
    bannerImage: cx(
      suit({ descendantName: 'banner-image' }),
      userCssClasses.bannerImage
    ),
    bannerLink: cx(
      suit({ descendantName: 'banner-link' }),
      userCssClasses.bannerLink
    ),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    templates,
    showPrevious,
    renderState: {},
  });

  const makeWidget = connectInfiniteHits(specializedRenderer, () =>
    render(null, containerNode)
  );

  const widget = {
    ...makeWidget({
      escapeHTML,
      transformItems,
      showPrevious,
      cache,
    }),
    $$widgetType: 'ais.infiniteHits',
  };

  // explicitly cast this type to have a small type output.
  return widget as Widget<
    InfiniteHitsWidgetDescription & {
      $$widgetType: 'ais.infiniteHits';
      widgetParams: InfiniteHitsConnectorParams<THit>;
    }
  >;
} satisfies InfiniteHitsWidget);
