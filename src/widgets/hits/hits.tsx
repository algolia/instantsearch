/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import connectHits, {
  HitsConnectorParams,
  HitsRendererOptions,
} from '../../connectors/hits/connectHits';
import Hits from '../../components/Hits/Hits';
import defaultTemplates from './defaultTemplates';
import {
  prepareTemplateProps,
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import { withInsights, withInsightsListener } from '../../lib/insights';
import {
  Template,
  TemplateWithBindEvent,
  Hit,
  WidgetFactory,
  Renderer,
  InsightsClientWrapper,
} from '../../types';
import { InsightsEvent } from '../../middlewares/createInsightsMiddleware';

const withUsage = createDocumentationMessageGenerator({ name: 'hits' });
const suit = component('Hits');
const HitsWithInsightsListener = withInsightsListener(Hits);

const renderer = ({
  renderState,
  cssClasses,
  containerNode,
  templates,
}): Renderer<HitsRendererOptions, Partial<HitsWidgetOptions>> => (
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
      insights={insights as InsightsClientWrapper}
      sendEvent={(event: InsightsEvent) => {
        instantSearchInstance.sendEventToInsights(event);
      }}
      bindEvent={bindEvent}
    />,
    containerNode
  );
};

export type HitsCSSClasses = {
  /**
   * CSS class to add to the wrapping element.
   */
  root?: string | string[];

  /**
   * CSS class to add to the wrapping element when no results.
   */
  emptyRoot?: string | string[];

  /**
   * CSS class to add to the list of results.
   */
  list?: string | string[];

  /**
   * CSS class to add to each result.
   */
  item?: string | string[];
};

export type HitsTemplates = {
  /**
   * Template to use when there are no results.
   *
   * @default 'No Results'
   */
  empty?: Template;

  /**
   * Template to use for each result. This template will receive an object containing a single record. The record will
   * have a new property `__hitIndex` for the position of the record in the list of displayed hits.
   *
   * @default ''
   */
  item?: TemplateWithBindEvent<
    Hit & {
      __hitIndex: number;
    }
  >;
};

export type HitsWidgetOptions = {
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
  HitsRendererOptions,
  HitsConnectorParams,
  HitsWidgetOptions
>;

const hits: HitsWidget = function hits(widgetOptions) {
  const {
    container,
    escapeHTML,
    transformItems,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
  } = widgetOptions || ({} as typeof widgetOptions);

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

  const makeHits = withInsights(connectHits)(specializedRenderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeHits({ escapeHTML, transformItems }),
    $$officialWidget: true,
  };
};

export default hits;
