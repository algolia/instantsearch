/** @jsx h */

import { createHitsComponent } from 'instantsearch-ui-components';
import { Fragment, h, render } from 'preact';

import TemplateComponent from '../../components/Template/Template';
import connectHits from '../../connectors/hits/connectHits';
import { withInsights } from '../../lib/insights';
import { createInsightsEventHandler } from '../../lib/insights/listener';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
  warning,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  HitsConnectorParams,
  HitsRenderState,
  HitsWidgetDescription,
} from '../../connectors/hits/connectHits';
import type { PreparedTemplateProps } from '../../lib/templating';
import type {
  Template,
  TemplateWithBindEvent,
  Hit,
  WidgetFactory,
  Renderer,
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';
import type {
  HitsClassNames as HitsUiComponentClassNames,
  HitsProps as HitsUiComponentProps,
} from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });

const Hits = createHitsComponent({ createElement: h, Fragment });

const renderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: HitsCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<Required<HitsTemplates>>;
    };
    templates: HitsTemplates;
  }): Renderer<HitsRenderState, Partial<HitsWidgetParams>> =>
  (
    {
      hits: receivedHits,
      results,
      instantSearchInstance,
      insights,
      bindEvent,
      sendEvent,
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

    const handleInsightsClick = createInsightsEventHandler({
      insights,
      sendEvent,
    });

    const emptyComponent: HitsUiComponentProps<Hit>['emptyComponent'] = ({
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        rootProps={rootProps}
        templateKey="empty"
        data={results}
        rootTagName="fragment"
      />
    );

    // @MAJOR: Move default hit component back to the UI library
    // once flavour specificities are erased
    const itemComponent: HitsUiComponentProps<Hit>['itemComponent'] = ({
      hit,
      index,
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="item"
        rootTagName="li"
        rootProps={{
          ...rootProps,
          onClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onClick();
          },
          onAuxClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onAuxClick();
          },
        }}
        data={{
          ...hit,
          get __hitIndex() {
            warning(
              false,
              'The `__hitIndex` property is deprecated. Use the absolute `__position` instead.'
            );
            return index;
          },
        }}
        bindEvent={bindEvent}
        sendEvent={sendEvent}
      />
    );

    const bannerComponent: HitsUiComponentProps<Hit>['bannerComponent'] = ({
      banner,
      ...rootProps
    }) => (
      <TemplateComponent
        {...renderState.templateProps}
        rootProps={rootProps}
        templateKey="banner"
        data={banner}
        rootTagName="aside"
      />
    );

    render(
      <Hits
        hits={receivedHits}
        itemComponent={itemComponent}
        sendEvent={sendEvent}
        classNames={cssClasses}
        emptyComponent={emptyComponent}
        banner={results?.renderingContent?.widgets?.banners?.[0]}
        bannerComponent={templates.banner ? bannerComponent : undefined}
      />,
      containerNode
    );
  };

export type HitsCSSClasses = Partial<HitsUiComponentClassNames>;

export type HitsTemplates = Partial<{
  /**
   * Template to use when there are no results.
   *
   * @default 'No Results'
   */
  empty: Template<SearchResults>;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   *
   * @default ''
   */
  item: TemplateWithBindEvent<
    Hit & {
      /** @deprecated the index in the hits array, use __position instead, which is the absolute position */
      __hitIndex: number;
    }
  >;

  /**
   * Template to use for the banner.
   *
   * @default ''
   */
  banner: Template<SearchResults>;
}>;

export type HitsWidgetParams = {
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;

  /**
   * Templates to use for the widget.
   */
  templates?: HitsTemplates;

  /**
   * CSS classes to add.
   */
  cssClasses?: HitsCSSClasses;
};

export type HitsWidget = WidgetFactory<
  HitsWidgetDescription & { $$widgetType: 'ais.hits' },
  HitsConnectorParams,
  HitsWidgetParams
>;

const hits: HitsWidget = function hits(widgetParams) {
  const {
    container,
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

  const makeWidget = withInsights(connectHits)(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget({ escapeHTML, transformItems }),
    $$widgetType: 'ais.hits',
  };
};

export default hits;
