/** @jsx h */

import { createRelatedProductsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectRelatedProducts from '../../connectors/related-products/connectRelatedProducts';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  RelatedProductsWidgetDescription,
  RelatedProductsConnectorParams,
  RelatedProductsRenderState,
} from '../../connectors/related-products/connectRelatedProducts';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template, WidgetFactory, Hit, Renderer } from '../../types';
import type { RecommendResultItem } from 'algoliasearch-helper';
import type {
  RecommendClassNames,
  RelatedProductsProps as RelatedProductsUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'related-products',
});

const RelatedProducts = createRelatedProductsComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: RelatedProductsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<RelatedProductsTemplates>;
  };
  templates: RelatedProductsTemplates;
};

function createRenderer({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: CreateRendererProps): Renderer<
  RelatedProductsRenderState,
  Partial<RelatedProductsWidgetParams>
> {
  return function renderer(
    { items, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        defaultTemplates: {} as RelatedProductsTemplates,
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
    ) as RelatedProductsUiProps<Hit>['headerComponent'];

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
    ) as RelatedProductsUiProps<Hit>['itemComponent'];

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
    ) as RelatedProductsUiProps<Hit>['emptyComponent'];

    render(
      <RelatedProducts
        items={items}
        sendEvent={() => {}}
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

export type RelatedProductsCSSClasses = Partial<RecommendClassNames>;

export type RelatedProductsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResultItem>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<
    Pick<
      Parameters<
        NonNullable<RelatedProductsUiProps<Hit>['headerComponent']>
      >[0],
      'items'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit>;
}>;

type RelatedProductsWidgetParams = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates?: RelatedProductsTemplates;

  /**
   * CSS classes to add to the widget elements.
   */
  cssClasses?: RelatedProductsCSSClasses;
};

export type RelatedProductsWidget = WidgetFactory<
  RelatedProductsWidgetDescription & {
    $$widgetType: 'ais.relatedProducts';
  },
  RelatedProductsConnectorParams,
  RelatedProductsWidgetParams
>;

const relatedProducts: RelatedProductsWidget = function relatedProducts(
  widgetParams
) {
  const {
    container,
    objectIDs,
    maxRecommendations,
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

  const makeWidget = connectRelatedProducts(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      objectIDs,
      maxRecommendations,
      queryParameters,
      fallbackParameters,
      threshold,
      escapeHTML,
      transformItems,
    }),
    $$widgetType: 'ais.relatedProducts',
  };
};

export default relatedProducts;
