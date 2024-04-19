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

import defaultTemplates from './defaultTemplates';

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
  name: 'relatedProducts',
});

const RelatedProducts = createRelatedProductsComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps = {
  containerNode: HTMLElement;
  cssClasses: RelatedProductsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<Required<RelatedProductsTemplates>>;
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
    { hits: receivedHits, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });

      return;
    }

    const fallbackComponent: RelatedProductsUiProps<Hit>['fallbackComponent'] =
      ({ ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          rootTagName="section"
          rootProps={rootProps}
          templateKey="empty"
          data={results}
        />
      );

    const headerComponent: RelatedProductsUiProps<Hit>['headerComponent'] = ({
      classNames,
      recommendations,
      translations,
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="header"
        rootTagName="h3"
        rootProps={{ ...rootProps, className: classNames.title }}
        data={{ classNames, recommendations, translations }}
      />
    );

    const itemComponent: RelatedProductsUiProps<Hit>['itemComponent'] = ({
      item,
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="item"
        rootTagName="li"
        rootProps={rootProps}
        data={item}
      />
    );

    render(
      <RelatedProducts
        items={receivedHits}
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

export type RelatedProductsCSSClasses = Partial<RecommendClassNames>;

export type RelatedProductsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   *
   * @default 'No Results'
   */
  empty: Template<RecommendResultItem>;

  /**
   * Template to use for the header of the widget.
   *
   * @default ''
   */
  header: Template<
    Parameters<NonNullable<RelatedProductsUiProps<Hit>['headerComponent']>>[0]
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   *
   * @default ''
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
    objectID,
    maxRecommendations,
    queryParameters,
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

  const makeWidget = connectRelatedProducts(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      objectID,
      maxRecommendations,
      queryParameters,
      threshold,
      transformItems,
    }),
    $$widgetType: 'ais.relatedProducts',
  };
};

export default relatedProducts;
