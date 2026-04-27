/** @jsx h */

import { createTrendingFacetsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectTrendingFacets from '../../connectors/trending-facets/connectTrendingFacets';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  TrendingFacetsWidgetDescription,
  TrendingFacetsConnectorParams,
  TrendingFacetsRenderState,
} from '../../connectors/trending-facets/connectTrendingFacets';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  WidgetFactory,
  Renderer,
  RecommendResponse,
} from '../../types';
import type { TrendingFacetItem } from '../../types/recommend';
import type {
  TrendingFacetsClassNames,
  TrendingFacetsProps as TrendingFacetsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-facets',
});

const TrendingFacets = createTrendingFacetsComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: TrendingFacetsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<TrendingFacetsTemplates>;
  };
  templates: TrendingFacetsTemplates;
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: CreateRendererProps): Renderer<
  TrendingFacetsRenderState,
  Partial<TrendingFacetsWidgetParams>
> {
  return function renderer(
    { items, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<TrendingFacetsTemplates>,
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
    ) as TrendingFacetsUiProps['headerComponent'];

    const itemComponent: TrendingFacetsUiProps['itemComponent'] = templates.item
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
      : undefined;

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
    ) as TrendingFacetsUiProps['emptyComponent'];

    render(
      <TrendingFacets
        items={items}
        classNames={cssClasses}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        emptyComponent={emptyComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };
}

export type TrendingFacetsCSSClasses = Partial<TrendingFacetsClassNames>;

export type TrendingFacetsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResponse<TrendingFacetItem>>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<
    Pick<
      Parameters<NonNullable<TrendingFacetsUiProps['headerComponent']>>[0],
      'items'
    > & { cssClasses: TrendingFacetsClassNames }
  >;

  /**
   * Template to use for each result.
   */
  item: Template<TrendingFacetItem>;
}>;

type TrendingFacetsWidgetParams = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates?: TrendingFacetsTemplates;

  /**
   * CSS classes to add to the widget elements.
   */
  cssClasses?: TrendingFacetsCSSClasses;
};

export type TrendingFacetsWidget = WidgetFactory<
  TrendingFacetsWidgetDescription & {
    $$widgetType: 'ais.trendingFacets';
  },
  TrendingFacetsConnectorParams,
  TrendingFacetsWidgetParams
>;

export default (function trendingFacets(
  widgetParams: TrendingFacetsWidgetParams & TrendingFacetsConnectorParams
) {
  const {
    container,
    facetName,
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

  const makeWidget = connectTrendingFacets(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      facetName,
      limit,
      queryParameters,
      fallbackParameters,
      threshold,
      escapeHTML,
      transformItems,
    }),
    $$widgetType: 'ais.trendingFacets',
  };
} satisfies TrendingFacetsWidget);
