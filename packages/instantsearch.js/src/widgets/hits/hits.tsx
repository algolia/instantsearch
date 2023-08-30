/** @jsx h */

import { cx } from '@algolia/ui-components-shared';
import { h, render } from 'preact';

import Hits from '../../components/Hits/Hits';
import connectHits from '../../connectors/hits/connectHits';
import { withInsights } from '../../lib/insights';
import { component } from '../../lib/suit';
import { prepareTemplateProps } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import defaultTemplates from './defaultTemplates';

import type {
  HitsComponentCSSClasses,
  HitsComponentTemplates,
} from '../../components/Hits/Hits';
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

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });
const suit = component('Hits');

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
    return null;
    // render(
    //   <Hits
    //     cssClasses={cssClasses}
    //     hits={receivedHits}
    //     results={results!}
    //     templateProps={renderState.templateProps!}
    //     insights={insights}
    //     sendEvent={sendEvent}
    //     bindEvent={bindEvent}
    //   />,
    //   containerNode
    // );
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

  // if (!container) {
  //   throw new Error(withUsage('The `container` option is required.'));
  // }

  const containerNode = undefined; // getContainerNode(container);
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
