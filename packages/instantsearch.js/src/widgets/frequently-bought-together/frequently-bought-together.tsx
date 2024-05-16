/** @jsx h */

import { createFrequentlyBoughtTogetherComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectFrequentlyBoughtTogether from '../../connectors/frequently-bought-together/connectFrequentlyBoughtTogether';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import type {
  FrequentlyBoughtTogetherWidgetDescription,
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherRenderState,
} from '../../connectors/frequently-bought-together/connectFrequentlyBoughtTogether';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { Template, WidgetFactory, Hit, Renderer } from '../../types';
import type { RecommendResultItem } from 'algoliasearch-helper';
import type {
  RecommendClassNames,
  FrequentlyBoughtTogetherProps as FrequentlyBoughtTogetherUiProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({
  name: 'frequently-bought-together',
});

const FrequentlyBoughtTogether = createFrequentlyBoughtTogetherComponent({
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
    cssClasses: FrequentlyBoughtTogetherCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<
        Required<FrequentlyBoughtTogetherTemplates>
      >;
    };
    templates: FrequentlyBoughtTogetherTemplates;
  }): Renderer<
    FrequentlyBoughtTogetherRenderState,
    Partial<FrequentlyBoughtTogetherWidgetParams>
  > =>
  ({ items, results, instantSearchInstance }, isFirstRendering) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        defaultTemplates: {} as Required<FrequentlyBoughtTogetherTemplates>,
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
    ) as FrequentlyBoughtTogetherUiProps<Hit>['headerComponent'];

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
    ) as FrequentlyBoughtTogetherUiProps<Hit>['itemComponent'];

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
    ) as FrequentlyBoughtTogetherUiProps<Hit>['emptyComponent'];

    render(
      <FrequentlyBoughtTogether
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

export type FrequentlyBoughtTogetherCSSClasses = Partial<RecommendClassNames>;

export type FrequentlyBoughtTogetherTemplates = Partial<{
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
        NonNullable<FrequentlyBoughtTogetherUiProps<Hit>['headerComponent']>
      >[0],
      'items'
    > & { cssClasses: RecommendClassNames }
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   */
  item: Template<Hit>;
}>;

type FrequentlyBoughtTogetherWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: FrequentlyBoughtTogetherTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: FrequentlyBoughtTogetherCSSClasses;
};

export type FrequentlyBoughtTogetherWidget = WidgetFactory<
  FrequentlyBoughtTogetherWidgetDescription & {
    $$widgetType: 'ais.frequentlyBoughtTogether';
  },
  FrequentlyBoughtTogetherConnectorParams,
  FrequentlyBoughtTogetherWidgetParams
>;

const frequentlyBoughtTogether: FrequentlyBoughtTogetherWidget =
  function frequentlyBoughtTogether(widgetParams) {
    const {
      container,
      objectIDs,
      limit,
      queryParameters,
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

    const makeWidget = connectFrequentlyBoughtTogether(
      specializedRenderer,
      () => render(null, containerNode)
    );
    return {
      ...makeWidget({
        objectIDs,
        limit,
        queryParameters,
        threshold,
        escapeHTML,
        transformItems,
      }),
      $$widgetType: 'ais.frequentlyBoughtTogether',
    };
  };

export default frequentlyBoughtTogether;
