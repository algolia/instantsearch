/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import type {
  HitsConnectorParams,
  HitsRenderState,
  HitsWidgetDescription,
} from '../../connectors/hits/connectHits.js';
import connectHits from '../../connectors/hits/connectHits.js';
import type {
  HitsComponentCSSClasses,
  HitsComponentTemplates,
} from '../../components/Hits/Hits.js';
import Hits from '../../components/Hits/Hits.js';
import defaultTemplates from './defaultTemplates.js';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils/index.js';
import { component } from '../../lib/suit.js';
import {
  withInsights,
  withInsightsListener,
} from '../../lib/insights/index.js';
import type {
  Template,
  TemplateWithBindEvent,
  Hit,
  WidgetFactory,
  Renderer,
  InsightsClient,
} from '../../types/index.js';
import type { InsightsEvent } from '../../middlewares/createInsightsMiddleware.js';
import type { PreparedTemplateProps } from '../../lib/utils/prepareTemplateProps.js';

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });
const suit = component('Hits');
const HitsWithInsightsListener = withInsightsListener(Hits);

const renderer =
  ({
    renderState,
    cssClasses,
    containerNode,
    templates,
  }: {
    containerNode: HTMLElement;
    cssClasses: HitsComponentCSSClasses;
    renderState: {
      templateProps?: PreparedTemplateProps<HitsComponentTemplates>;
    };
    templates: HitsTemplates;
  }): Renderer<HitsRenderState, Partial<HitsWidgetParams>> =>
  (
    { hits: receivedHits, results, instantSearchInstance, insights, bindEvent },
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

    render(
      <HitsWithInsightsListener
        cssClasses={cssClasses}
        hits={receivedHits}
        results={results}
        templateProps={renderState.templateProps}
        insights={insights as InsightsClient}
        sendEvent={(event: InsightsEvent) => {
          instantSearchInstance.sendEventToInsights(event);
        }}
        bindEvent={bindEvent}
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
  empty: Template;

  /**
   * Template to use for each result. This template will receive an object containing a single record.
   *
   * @default ''
   */
  item: TemplateWithBindEvent<
    Hit & {
      // @deprecated the index in the hits array, use __position instead, which is the absolute position
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
    root: cx(suit(), userCssClasses.root),
    emptyRoot: cx(suit({ modifierName: 'empty' }), userCssClasses.emptyRoot),
    list: cx(suit({ descendantName: 'list' }), userCssClasses.list),
    item: cx(suit({ descendantName: 'item' }), userCssClasses.item),
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
