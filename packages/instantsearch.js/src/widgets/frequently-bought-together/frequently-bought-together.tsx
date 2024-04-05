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

import defaultTemplates from './defaultTemplates';

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
  name: 'frequentlyBoughtTogether',
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
      // do we need this if we don't support hogan?
      templateProps?: PreparedTemplateProps<
        Required<FrequentlyBoughtTogetherTemplates>
      >;
    };
    templates: FrequentlyBoughtTogetherTemplates;
  }): Renderer<
    FrequentlyBoughtTogetherRenderState,
    Partial<FrequentlyBoughtTogetherWidgetParams>
  > =>
  (
    {
      hits: receivedHits,
      results,
      instantSearchInstance,
      // insights,
      // bindEvent,
      // sendEvent,
    },
    isFirstRendering
  ) => {
    if (isFirstRendering) {
      renderState.templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig: instantSearchInstance.templatesConfig,
        templates,
      });
      return;
    }

    // to do insights

    const emptyComponent: FrequentlyBoughtTogetherUiProps<Hit>['fallbackComponent'] =
      ({ ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          rootProps={rootProps}
          templateKey="empty"
          data={results}
        />
      );

    const itemComponent: FrequentlyBoughtTogetherUiProps<Hit>['itemComponent'] =
      ({ item, ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="item"
          rootTagName="li"
          rootProps={{
            onClick: (_event: MouseEvent) => {
              // handleInsightsClick(event);
              // rootProps.onClick();
            },
            onAuxClick: (_event: MouseEvent) => {
              // handleInsightsClick(event);
              // rootProps.onAuxClick();
            },
          }}
          data={item}
        />
      );

    render(
      <FrequentlyBoughtTogether
        items={receivedHits}
        itemComponent={itemComponent}
        // sendEvent={sendEvent}
        classNames={cssClasses}
        fallbackComponent={emptyComponent}
        status={instantSearchInstance.status}
      />,
      containerNode
    );
  };

export type FrequentlyBoughtTogetherCSSClasses = Partial<RecommendClassNames>;

export type FrequentlyBoughtTogetherTemplates = Partial<{
  /**
   * Template to use when there are no results.
   *
   * @default 'No Results'
   */
  empty: Template<RecommendResultItem>;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   *
   * @default ''
   */
  item: Template<
    Hit & {
      /** @deprecated the index in the hits array, use __position instead, which is the absolute position */
      __hitIndex: number;
    }
  >;
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
      objectID,
      maxRecommendations,
      queryParameters,
      threshold,
      transformItems,
      view,
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
        objectID,
        maxRecommendations,
        queryParameters,
        threshold,
        transformItems,
        view,
      }),
      $$widgetType: 'ais.frequentlyBoughtTogether',
    };
  };

export default frequentlyBoughtTogether;
