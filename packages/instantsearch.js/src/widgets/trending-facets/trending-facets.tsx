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
  TrendingFacetHit,
} from '../../connectors/trending-facets/connectTrendingFacets';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  WidgetFactory,
  Renderer,
  RecommendResponse,
  TemplateWithBindEvent,
  Hit,
} from '../../types';
import type {
  RecommendClassNames,
  TrendingFacetsProps as TrendingFacetsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'trending-items',
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
      ? ({ item, ...rootProps }) => {
          return (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="item"
              rootTagName="fragment"
              data={item}
              rootProps={{ ...rootProps }}
            />
          );
        }
      : () => <div></div>;

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
                    ? ({ item }: { item: Hit<TrendingFacetHit> }) => (
                        <TemplateComponent
                          {...renderState.templateProps}
                          templateKey="item"
                          rootTagName="fragment"
                          data={item}
                        />
                      )
                    : undefined,
                },
                cssClasses: {
                  list: data.classNames.list,
                  item: data.classNames.item,
                },
              }}
            />
          )
        : undefined
    ) as TrendingFacetsUiProps['layout'];

    render(
      <TrendingFacets
        items={items}
        classNames={cssClasses}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        emptyComponent={emptyComponent}
        layout={layoutComponent}
        status={instantSearchInstance.status}
        sendEvent={() => {}}
      />,
      containerNode
    );
  };
}

export type TrendingFacetsCSSClasses = Partial<RecommendClassNames>;

export type TrendingFacetsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResponse<Hit<TrendingFacetHit>>>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<{
    items: Array<Hit<TrendingFacetHit>>;
    cssClasses: RecommendClassNames;
  }>;
}> &
  (
    | {
        /**
         * Template to use to wrap all items.
         */
        layout: Template<{
          items: Array<Hit<TrendingFacetHit>>;
          templates: {
            item: TrendingFacetsUiProps<Hit<TrendingFacetHit>>['itemComponent'];
          };
          cssClasses: Pick<TrendingFacetsCSSClasses, 'list' | 'item'>;
        }>;
        item?: TemplateWithBindEvent<Hit<TrendingFacetHit>>;
      }
    | {
        /**
         * Template to use to wrap all items.
         */
        layout?: Template<{
          items: Array<Hit<TrendingFacetHit>>;
          templates: {
            item: TrendingFacetsUiProps<Hit<TrendingFacetHit>>['itemComponent'];
          };
          cssClasses: Pick<TrendingFacetsCSSClasses, 'list' | 'item'>;
        }>;
        item: TemplateWithBindEvent<Hit<TrendingFacetHit>>;
      }
  );

type TrendingFacetsWidgetParams = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates: TrendingFacetsTemplates;

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
    attribute,
    limit,
    threshold,
    transformItems,
    templates,
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
      attribute,
      limit,
      threshold,
      transformItems,
    }),
    $$widgetType: 'ais.trendingFacets',
  };
} satisfies TrendingFacetsWidget);
