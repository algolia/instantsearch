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
    { hits: receivedHits, results, instantSearchInstance },
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

    const emptyComponent: FrequentlyBoughtTogetherUiProps<Hit>['fallbackComponent'] =
      ({ ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          rootTagName="section"
          rootProps={rootProps}
          templateKey="empty"
          data={results}
        />
      );

    const headerComponent: FrequentlyBoughtTogetherUiProps<Hit>['headerComponent'] =
      ({ classNames, recommendations, translations, ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="header"
          rootTagName="h3"
          rootProps={{
            ...rootProps,
            className: classNames.title,
          }}
          data={{
            classNames,
            recommendations,
            translations,
          }}
        />
      );

    const itemComponent: FrequentlyBoughtTogetherUiProps<Hit>['itemComponent'] =
      ({ item, ...rootProps }) => (
        <TemplateComponent
          {...renderState.templateProps}
          templateKey="item"
          rootTagName="li"
          rootProps={rootProps}
          data={item}
        />
      );

    const viewComponent: FrequentlyBoughtTogetherUiProps<Hit>['view'] =
      templates.view
        ? ({
            classNames,
            itemComponent: viewItemComponent,
            items,
            translations,
            ...rootProps
          }) => (
            <TemplateComponent
              {...renderState.templateProps}
              templateKey="view"
              rootTagName="div"
              rootProps={{
                ...rootProps,
                className: classNames.container,
              }}
              data={{
                classNames,
                itemComponent: viewItemComponent,
                items,
                translations,
              }}
            />
          )
        : undefined;

    render(
      <FrequentlyBoughtTogether
        items={receivedHits}
        headerComponent={headerComponent}
        itemComponent={itemComponent}
        sendEvent={() => {}}
        classNames={cssClasses}
        fallbackComponent={emptyComponent}
        status={instantSearchInstance.status}
        view={viewComponent}
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
   * Template to use for the header of the widget.
   *
   * @default ''
   */
  header: Template<
    Parameters<
      NonNullable<FrequentlyBoughtTogetherUiProps<Hit>['headerComponent']>
    >[0]
  >;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   *
   * @default ''
   */
  item: Template<Hit>;

  /**
   * Template to use for the view component.
   *
   * @default ''
   */
  view: Template<
    Parameters<NonNullable<FrequentlyBoughtTogetherUiProps<Hit>['view']>>[0]
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
      }),
      $$widgetType: 'ais.frequentlyBoughtTogether',
    };
  };

export default frequentlyBoughtTogether;
