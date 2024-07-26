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
import type {
  Template,
  WidgetFactory,
  Hit,
  Renderer,
  BaseHit,
} from '../../types';
import type { RecommendResultItem } from 'algoliasearch-helper';
import type {
  CarouselClassNames,
  CarouselProps,
  RecommendClassNames,
  RecordWithObjectID,
  RelatedProductsProps as RelatedProductsUiProps,
} from 'instantsearch-ui-components';
import { createCarouselComponent } from 'instantsearch-ui-components';
import { useRef } from 'preact/hooks';

const withUsage = createDocumentationMessageGenerator({
  name: 'related-products',
});

const RelatedProducts = createRelatedProductsComponent({
  createElement: h,
  Fragment,
});

type CreateRendererProps<THit extends NonNullable<object> = BaseHit> = {
  containerNode: HTMLElement;
  cssClasses: RelatedProductsCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<RelatedProductsTemplates<THit>>;
  };
  templates: RelatedProductsTemplates<THit>;
  view: any;
};

function createRenderer<THit extends NonNullable<object> = BaseHit>({
  renderState,
  cssClasses,
  containerNode,
  templates,
  view,
}: CreateRendererProps<THit>): Renderer<
  RelatedProductsRenderState,
  Partial<RelatedProductsWidgetParams>
> {
  return function renderer(
    { items, results, instantSearchInstance },
    isFirstRendering
  ) {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<
          RelatedProductsTemplates<THit>
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
        view={view}
      />,
      containerNode
    );
  };
}

export type RelatedProductsCSSClasses = Partial<RecommendClassNames>;

export type RelatedProductsTemplates<
  THit extends NonNullable<object> = BaseHit
> = Partial<{
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
        NonNullable<RelatedProductsUiProps<Hit<THit>>['headerComponent']>
      >[0],
      'items'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit<THit>>;
}>;

type RelatedProductsLayouts = {
  carousel: {
    view: RelatedProductsUiProps<Hit>['view'];
    cssClasses?: Partial<CarouselClassNames>;
  };
};

type RelatedProductsLayout<TLayout extends keyof RelatedProductsLayouts> = {
  name: TLayout;
} & Omit<RelatedProductsLayouts[TLayout], 'view'>;

type RelatedProductsWidgetParams<THit extends NonNullable<object> = BaseHit> = {
  /**
   * CSS selector or `HTMLElement` to insert the widget into.
   */
  container: string | HTMLElement;

  /**
   * Templates to customize the widget.
   */
  templates?: RelatedProductsTemplates<THit>;

  /**
   * CSS classes to add to the widget elements.
   */
  cssClasses?: RelatedProductsCSSClasses;
  /**
   * Layout to customize the way the widget is rendered.
   */
  layout?:
    | keyof RelatedProductsLayouts
    | RelatedProductsLayout<keyof RelatedProductsLayouts>;
};

export type RelatedProductsWidget = WidgetFactory<
  RelatedProductsWidgetDescription & {
    $$widgetType: 'ais.relatedProducts';
  },
  RelatedProductsConnectorParams,
  RelatedProductsWidgetParams
>;

let lastHorizontalSliderId = 0;

function generateCarouselId() {
  return `ais-horizontal-slider-${lastHorizontalSliderId++}`;
}

const Carousel = createCarouselComponent({
  createElement: h,
  Fragment,
});

function CarouselWithRefs(
  props: Omit<
    CarouselProps<RecordWithObjectID>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  >
) {
  const carouselRefs: Pick<
    CarouselProps<RecordWithObjectID>,
    'listRef' | 'nextButtonRef' | 'previousButtonRef' | 'carouselIdRef'
  > = {
    listRef: useRef(null),
    nextButtonRef: useRef(null),
    previousButtonRef: useRef(null),
    carouselIdRef: useRef(generateCarouselId()),
  };

  return <Carousel {...carouselRefs} {...props} />;
}

const LAYOUTS = {
  carousel: CarouselWithRefs,
};

export default (function relatedProducts<
  THit extends NonNullable<object> = BaseHit
>(
  widgetParams: RelatedProductsWidgetParams<THit> &
    RelatedProductsConnectorParams<THit>
) {
  const {
    container,
    objectIDs,
    limit,
    queryParameters,
    fallbackParameters,
    threshold,
    escapeHTML,
    transformItems,
    templates = {},
    cssClasses = {},
    layout = undefined,
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);

  let view: RelatedProductsUiProps<Hit>['view'] | undefined = undefined;

  if (layout) {
    view = typeof layout === 'string' ? LAYOUTS[layout] : LAYOUTS[layout.name];
  }

  const specializedRenderer = createRenderer({
    containerNode,
    cssClasses: { ...cssClasses, ...(layout?.cssClasses || {}) },
    renderState: {},
    templates,
    view,
  });

  const makeWidget = connectRelatedProducts(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({
      objectIDs,
      limit,
      queryParameters,
      fallbackParameters,
      threshold,
      escapeHTML,
      transformItems,
    }),
    $$widgetType: 'ais.relatedProducts',
  };
} satisfies RelatedProductsWidget);
