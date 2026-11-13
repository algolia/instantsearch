/** @jsx h */

import { connectInfiniteHits } from 'instantsearch-core';
import { createDocumentationMessageGenerator } from 'instantsearch-core/internal';
import { createInfiniteHitsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import { prepareTemplateProps } from '../../lib/templating';
import { getContainerNode } from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template, TemplateWithSendEvent } from '../../types';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  InfiniteHitsConnectorParams,
  InfiniteHitsRenderState,
  InfiniteHitsCache,
  InfiniteHitsWidgetDescription,
} from 'instantsearch-core';
import type {
  WidgetFactory,
  Renderer,
  BaseHit,
  Hit,
  SendEventForHits,
} from 'instantsearch-core';
import type {
  InfiniteHitsClassNames as InfiniteHitsUiComponentClassNames,
  InfiniteHitsProps as InfiniteHitsUiComponentProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
});

const InfiniteHits = createInfiniteHitsComponent({
  createElement: h,
  Fragment,
});

export type InfiniteHitsCSSClasses = Partial<InfiniteHitsUiComponentClassNames>;

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
     *
     * When not provided, each hit is rendered as JSON.
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
  THit extends NonNullable<object> = BaseHit,
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

export type InfiniteHitsWidget = WidgetFactory<
  InfiniteHitsWidgetDescription & { $$widgetType: 'ais.infiniteHits' },
  InfiniteHitsConnectorParams,
  InfiniteHitsWidgetParams
>;

const renderer = <THit extends NonNullable<object> = BaseHit>({
  containerNode,
  cssClasses,
  renderState,
  templates,
  showPrevious: hasShowPrevious,
}: {
  containerNode: HTMLElement;
  cssClasses: InfiniteHitsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<InfiniteHitsTemplates<THit>>;
    results?: SearchResults;
    sendEvent?: SendEventForHits;
  };
  templates: InfiniteHitsTemplates<THit>;
  showPrevious?: boolean;
}): Renderer<InfiniteHitsRenderState, Partial<InfiniteHitsWidgetParams>> => {
  // These components are created once per widget: with new ones on every
  // render, Preact would remount the hits and the buttons, which loses the
  // focus of the "Show more" button after a click.
  const emptyComponent: InfiniteHitsUiComponentProps<Hit>['emptyComponent'] =
    () => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="empty"
        data={renderState.results}
        rootTagName="fragment"
      />
    );

  const itemComponent: InfiniteHitsUiComponentProps<Hit>['itemComponent'] = ({
    hit,
    index,
    ...rootProps
  }) => (
    <TemplateComponent
      {...renderState.templateProps}
      templateKey="item"
      rootTagName="li"
      rootProps={rootProps}
      data={hit}
      sendEvent={renderState.sendEvent}
    />
  );

  const bannerComponent: InfiniteHitsUiComponentProps<Hit>['bannerComponent'] =
    (props) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="banner"
        data={props}
        rootTagName="fragment"
      />
    );

  const loadPreviousComponent: InfiniteHitsUiComponentProps<Hit>['loadPreviousComponent'] =
    (rootProps) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="showPreviousText"
        rootTagName="button"
        rootProps={rootProps}
      />
    );

  const loadMoreComponent: InfiniteHitsUiComponentProps<Hit>['loadMoreComponent'] =
    (rootProps) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={rootProps}
      />
    );

  return (
    {
      items,
      results,
      showMore,
      showPrevious,
      isFirstPage,
      isLastPage,
      sendEvent,
      banner,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps<
        InfiniteHitsTemplates<THit>
      >({
        defaultTemplates,
        templates,
      });
      return;
    }

    renderState.results = results;
    renderState.sendEvent = sendEvent;

    render(
      <InfiniteHits
        hits={items}
        itemComponent={templates.item === undefined ? undefined : itemComponent}
        sendEvent={sendEvent}
        classNames={cssClasses}
        // Only when the search has no hits: if `transformItems` removed them
        // all, the buttons stay so that more pages can be loaded.
        emptyComponent={results?.hits.length === 0 ? emptyComponent : undefined}
        banner={banner}
        bannerComponent={templates.banner ? bannerComponent : undefined}
        isFirstPage={isFirstPage}
        isLastPage={isLastPage}
        onShowPrevious={hasShowPrevious ? showPrevious : undefined}
        onShowMore={showMore}
        loadPreviousComponent={loadPreviousComponent}
        loadMoreComponent={loadMoreComponent}
      />,
      containerNode
    );
  };
};

export default (function infiniteHits<
  THit extends NonNullable<object> = BaseHit,
>(
  widgetParams: InfiniteHitsWidgetParams<THit> &
    InfiniteHitsConnectorParams<THit>
) {
  const {
    container,
    transformItems,
    templates = {},
    cssClasses = {},
    showPrevious,
    cache,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

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

  return {
    ...makeWidget({
      transformItems,
      showPrevious,
      cache,
    }),
    $$widgetType: 'ais.infiniteHits',
  };
} satisfies InfiniteHitsWidget);
