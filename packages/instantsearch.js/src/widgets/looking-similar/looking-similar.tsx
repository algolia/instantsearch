/** @jsx h */

import { createLookingSimilarComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectLookingSimilar from '../../connectors/looking-similar/connectLookingSimilar';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  LookingSimilarWidgetDescription,
  LookingSimilarConnectorParams,
  LookingSimilarRenderState,
} from '../../connectors/looking-similar/connectLookingSimilar';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  WidgetFactory,
  Renderer,
  BaseHit,
  RecommendResponse,
  Hit,
  TemplateWithBindEvent,
} from '../../types';
import type {
  RecommendClassNames,
  LookingSimilarProps as LookingSimilarUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'looking-similar',
});

const LookingSimilar = createLookingSimilarComponent({
  createElement: h,
  Fragment,
});

function createRenderer<THit extends NonNullable<object> = BaseHit>({
  renderState,
  cssClasses,
  containerNode,
  templates,
}: {
  containerNode: HTMLElement;
  cssClasses: LookingSimilarCSSClasses;
  renderState: {
    templateProps?: PreparedTemplateProps<
      Required<LookingSimilarTemplates<THit>>
    >;
  };
  templates: LookingSimilarTemplates<THit>;
}): Renderer<LookingSimilarRenderState, Partial<LookingSimilarWidgetParams>> {
  return (
    { items, results, instantSearchInstance, sendEvent },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates: {} as unknown as Required<
          LookingSimilarTemplates<THit>
        >,
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
              data={{ cssClasses: data.classNames, items: data.items }}
            />
          )
        : undefined
    ) as LookingSimilarUiProps<Hit>['headerComponent'];

    const itemComponent: LookingSimilarUiProps<Hit>['itemComponent'] =
      templates.item
        ? ({ item, sendEvent: _sendEvent, ...rootProps }) => {
            return (
              <TemplateComponent
                {...renderState.templateProps}
                templateKey="item"
                rootTagName="fragment"
                data={item}
                sendEvent={_sendEvent}
                rootProps={{ ...rootProps }}
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
    ) as LookingSimilarUiProps<Hit>['emptyComponent'];

    const layoutComponent = (
      templates.layout
        ? (data) => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="layout"
              rootTagName="fragment"
              data={{
                sendEvent,
                items: data.items,
                templates: {
                  item: templates.item
                    ? ({ item }: { item: Hit<THit> }) => (
                        <TemplateComponent
                          {...renderState.templateProps}
                          templateKey="item"
                          rootTagName="fragment"
                          data={item}
                          sendEvent={sendEvent}
                        />
                      )
                    : undefined,
                },
                cssClasses: {
                  list: data.classNames.list,
                  item: data.classNames.item,
                },
              }}
              sendEvent={sendEvent}
            />
          )
        : undefined
    ) as LookingSimilarUiProps<Hit<THit>>['layout'];

    render(
      <LookingSimilar
        items={items as Array<Hit<THit>>}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        sendEvent={() => {}}
        classNames={cssClasses}
        emptyComponent={emptyComponent}
        layout={layoutComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };
}

export type LookingSimilarCSSClasses = Partial<RecommendClassNames>;

export type LookingSimilarTemplates<
  THit extends NonNullable<object> = BaseHit
> = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResponse<Hit<THit>>>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<
    Pick<
      Parameters<
        NonNullable<LookingSimilarUiProps<Hit<THit>>['headerComponent']>
      >[0],
      'items'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: TemplateWithBindEvent<Hit<THit>>;

  /**
   * Template to use to wrap all items.
   */
  layout: Template<
    Pick<
      Parameters<NonNullable<LookingSimilarUiProps<Hit<THit>>['layout']>>[0],
      'items'
    > & {
      templates: {
        item: LookingSimilarUiProps<Hit<THit>>['itemComponent'];
      };
      cssClasses: Pick<LookingSimilarCSSClasses, 'list' | 'item'>;
    }
  >;
}>;

type LookingSimilarWidgetParams<THit extends NonNullable<object> = BaseHit> = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: LookingSimilarTemplates<THit>;

  /**
   * CSS classes to add.
   */
  cssClasses?: LookingSimilarCSSClasses;
};

export type LookingSimilarWidget = WidgetFactory<
  LookingSimilarWidgetDescription & {
    $$widgetType: 'ais.lookingSimilar';
  },
  LookingSimilarConnectorParams,
  LookingSimilarWidgetParams
>;

export default (function lookingSimilar<
  THit extends NonNullable<object> = BaseHit
>(
  widgetParams: LookingSimilarWidgetParams<THit> &
    LookingSimilarConnectorParams<THit>
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

  const makeWidget = connectLookingSimilar(specializedRenderer, () =>
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
    $$widgetType: 'ais.lookingSimilar',
  };
} satisfies LookingSimilarWidget);
