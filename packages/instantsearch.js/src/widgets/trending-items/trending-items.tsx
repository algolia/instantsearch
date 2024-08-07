/** @jsx h */

import { createTrendingItemsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectTrendingItems from '../../connectors/trending-items/connectTrendingItems';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  TrendingItemsWidgetDescription,
  TrendingItemsConnectorParams,
  TrendingItemsRenderState,
} from '../../connectors/trending-items/connectTrendingItems';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  WidgetFactory,
  Hit,
  Renderer,
  BaseHit,
} from '../../types';
import type { RecommendResultItem } from 'algoliasearch-helper';
import type {
  RecommendClassNames,
  TrendingItemsProps as TrendingItemsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-items',
});

const TrendingItems = createTrendingItemsComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps<THit extends NonNullable<object> = BaseHit> = {
  containerNode: HTMLElement;
  cssClasses: TrendingItemsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<TrendingItemsTemplates<THit>>;
  };
  templates: TrendingItemsTemplates<THit>;
};

function createRenderer<THit extends NonNullable<object> = BaseHit>({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: CreateRendererProps<THit>): Renderer<
  TrendingItemsRenderState,
  Partial<TrendingItemsWidgetParams>
> {
  return function renderer(
    { items, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<
          TrendingItemsTemplates<THit>
        >,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });

      return;
    }

    const headerComponent = (
      templates.header
        ? (data) => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="header"
              rootTagName="fragment"
              data={{
                cssClasses: data.classNames,
                items: data.items,
              }}
            />
          )
        : undefined
    ) as TrendingItemsUiProps<Hit>['headerComponent'];

    const itemComponent = (
      templates.item
        ? ({ item }) => {
            return (
              <TemplateComponent
                {...renderState.templateProps}
                templateKey="item"
                rootTagName="fragment"
                data={item}
              />
            );
          }
        : undefined
    ) as TrendingItemsUiProps<Hit>['itemComponent'];

    const emptyComponent = (
      templates.empty
        ? () => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="empty"
              rootTagName="fragment"
              data={results}
            />
          )
        : undefined
    ) as TrendingItemsUiProps<Hit>['emptyComponent'];

    const layoutComponent = (
      templates.layout
        ? (data) => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="layout"
              rootTagName="fragment"
              data={{
                items: data.items,
                templates: {
                  item: templates.item
                    ? ({ item }: { item: Hit<THit> }) => (
                        <TemplateComponent
                          {...renderState.templateProps}
                          templateKey="item"
                          rootTagName="fragment"
                          data={item}
                        />
                      )
                    : undefined,
                },
              }}
            />
          )
        : undefined
    ) as TrendingItemsUiProps<Hit>['layout'];

    render(
      <TrendingItems
        items={items}
        sendEvent={() => {}}
        classNames={cssClasses}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        emptyComponent={emptyComponent}
        layout={layoutComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };
}

export type TrendingItemsCSSClasses = Partial<RecommendClassNames>;

export type TrendingItemsTemplates<THit extends NonNullable<object> = BaseHit> =
  Partial<{
    /**
     * Template to use when there are no results.
     */
    empty: Template<RecommendResultItem<Hit<THit>>>;

    /**
     * Template to use for the header of the widget.
     */
    header: Template<
      Pick<
        Parameters<
          NonNullable<TrendingItemsUiProps<Hit<THit>>['headerComponent']>
        >[0],
        'items'
      > & { cssClasses: RecommendClassNames }
    >;

    /**
     * Template to use for each result. This template will receive an object containing a single record.
     */
    item: Template<Hit<THit>>;

    /**
     * Template to use to wrap all items.
     */
    layout: Template<
      Pick<
        Parameters<NonNullable<TrendingItemsUiProps<Hit<THit>>['layout']>>[0],
        'items'
      > & {
        templates: {
          item: TrendingItemsUiProps<Hit>['itemComponent'];
        };
      }
    >;
  }>;

type TrendingItemsWidgetParams<THit extends NonNullable<object> = BaseHit> = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates?: TrendingItemsTemplates<THit>;

  /**
   * CSS classes to add to the widget elements.
   */
  cssClasses?: TrendingItemsCSSClasses;
};

export type TrendingItemsWidget = WidgetFactory<
  TrendingItemsWidgetDescription & {
    $$widgetType: 'ais.trendingItems';
  },
  TrendingItemsConnectorParams,
  TrendingItemsWidgetParams
>;

export default (function trendingItems<
  THit extends NonNullable<object> = BaseHit
>(
  widgetParams: TrendingItemsWidgetParams<THit> &
    TrendingItemsConnectorParams<THit>
) {
  const {
    container,
    facetName,
    facetValue,
    limit,
    queryParameters,
    fallbackParameters,
    threshold,
    escapeHTML,
    transformItems,
    templates = {},
    cssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses,
    renderState: {},
    templates,
  });

  const makeWidget = connectTrendingItems(specializedRenderer, () =>
    render(null, containerNode)
  );

  const facetParameters =
    facetName && facetValue ? { facetName, facetValue } : {};

  return {
    ...makeWidget({
      ...facetParameters,
      limit,
      queryParameters,
      fallbackParameters,
      threshold,
      escapeHTML,
      transformItems,
    }),
    $$widgetType: 'ais.trendingItems',
  };
} satisfies TrendingItemsWidget);
