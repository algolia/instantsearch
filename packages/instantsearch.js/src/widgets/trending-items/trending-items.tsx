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
import type { Template, WidgetFactory, Hit, Renderer } from '../../types';
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

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: TrendingItemsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<TrendingItemsTemplates>;
  };
  templates: TrendingItemsTemplates;
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: CreateRendererProps): Renderer<
  TrendingItemsRenderState,
  Partial<TrendingItemsWidgetParams>
> {
  return function renderer(
    { recommendations, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        defaultTemplates: {} as TrendingItemsTemplates,
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
                recommendations: data.recommendations,
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

    const fallbackComponent = (
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
    ) as TrendingItemsUiProps<Hit>['fallbackComponent'];

    render(
      <TrendingItems
        items={recommendations}
        sendEvent={() => {}}
        classNames={cssClasses}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        fallbackComponent={fallbackComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };
}

export type TrendingItemsCSSClasses = Partial<RecommendClassNames>;

export type TrendingItemsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResultItem>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<
    Pick<
      Parameters<NonNullable<TrendingItemsUiProps<Hit>['headerComponent']>>[0],
      'recommendations'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit>;
}>;

type TrendingItemsWidgetParams = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates?: TrendingItemsTemplates;

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

const trendingItems: TrendingItemsWidget = function trendingItems(
  widgetParams
) {
  const {
    container,
    facetName,
    facetValue,
    maxRecommendations,
    queryParameters,
    fallbackParameters,
    threshold,
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
      maxRecommendations,
      queryParameters,
      fallbackParameters,
      threshold,
      transformItems,
    }),
    $$widgetType: 'ais.trendingItems',
  };
};

export default trendingItems;
