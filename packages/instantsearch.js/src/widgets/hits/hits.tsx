/** @jsx h */

import { cx, createHits } from 'instantsearch-ui-components';
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
import type { HitsClassNames } from 'instantsearch-ui-components';

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });

const Hits = createHits({ createElement: h, Fragment });

const renderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: HitsClassNames;
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

    // FIXME: Use exported type from instantsearch-ui-components
    const emptyComponent = ({ ...rootProps }) => (
      <TemplateComponent
        {...renderState.templateProps}
        rootProps={rootProps}
        templateKey="empty"
        data={results}
      />
    );

    // @MAJOR: Move default hit component back to the UI library
    // once flavour specificities are erased
    // FIXME: Use exported type from instantsearch-ui-components
    const itemComponent = ({ hit, index, ...rootProps }) => (
      <TemplateComponent
        {...renderState.templateProps}
        templateKey="item"
        rootTagName="li"
        rootProps={{
          ...rootProps,
          onClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onClick?.(event);
          },
          onAuxClick: (event: MouseEvent) => {
            handleInsightsClick(event);
            rootProps.onClick?.(event);
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

    render(
      <Hits
        hits={receivedHits}
        itemComponent={itemComponent}
        sendEvent={sendEvent}
        classNames={cssClasses}
        emptyComponent={emptyComponent}
      />,
      containerNode
    );
  };

export type HitsCSSClasses = Partial<{
  /**
   * CSS class to add to the wrapping element.
   */
  root: string | string[];

  /**
   * CSS class to add to the wrapping element when no results.
   */
  emptyRoot: string | string[];

  /**
   * CSS class to add to the list of results.
   */
  list: string | string[];

  /**
   * CSS class to add to each result.
   */
  item: string | string[];
}>;

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
    cssClasses: userCssClasses = {},
  } = widgetParams || {};

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(userCssClasses.root),
    emptyRoot: cx(userCssClasses.emptyRoot),
    list: cx(userCssClasses.list),
    item: cx(userCssClasses.item),
  };

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
