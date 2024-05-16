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
import type { Template, WidgetFactory, Hit, Renderer } from '../../types';
import type { RecommendResultItem } from 'algoliasearch-helper';
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

const renderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: LookingSimilarCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<Required<LookingSimilarTemplates>>;
    };
    templates: LookingSimilarTemplates;
  }): Renderer<
    LookingSimilarRenderState,
    Partial<LookingSimilarWidgetParams>
  > =>
  ({ items, results, instantSearchInstance }, isFirstRendering) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        defaultTemplates: {} as Required<LookingSimilarTemplates>,
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
              data={{ cssClasses: data.classNames, items: data.items }}
            />
          )
        : undefined
    ) as LookingSimilarUiProps<Hit>['headerComponent'];

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
    ) as LookingSimilarUiProps<Hit>['itemComponent'];

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

    render(
      <LookingSimilar
        items={items}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        sendEvent={() => {}}
        classNames={cssClasses}
        emptyComponent={emptyComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };

export type LookingSimilarCSSClasses = Partial<RecommendClassNames>;

export type LookingSimilarTemplates = Partial<{
  /**
   * Template to use when there are no results.
   */
  empty: Template<RecommendResultItem>;

  /**
   * Template to use for the header of the widget.
   */
  header: Template<
    Pick<
      Parameters<NonNullable<LookingSimilarUiProps<Hit>['headerComponent']>>[0],
      'items'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit>;
}>;

type LookingSimilarWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: LookingSimilarTemplates;

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

const lookingSimilar: LookingSimilarWidget = function lookingSimilar(
  widgetParams
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

  const specializedRenderer = renderer({
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
};

export default lookingSimilar;
