import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Stats from '../../components/Stats/Stats.js';
import connectStats from '../../connectors/stats/connectStats.js';
import defaultTemplates from './defaultTemplates.js';

import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';

const bem = bemHelper('ais-stats');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
  autoHideContainer,
  renderState,
  templates,
  transformData,
}) => (
  {
    hitsPerPage,
    nbHits,
    nbPages,
    page,
    processingTimeMS,
    query,
    instantSearchInstance,
  },
  isFirstRendering
) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      transformData,
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && nbHits === 0;

  render(
    <Stats
      collapsible={collapsible}
      cssClasses={cssClasses}
      hitsPerPage={hitsPerPage}
      nbHits={nbHits}
      nbPages={nbPages}
      page={page}
      processingTimeMS={processingTimeMS}
      query={query}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
stats({
  container,
  [ templates.{header, body, footer} ],
  [ transformData.{body} ],
  [ autoHideContainer=true ],
  [ cssClasses.{root, header, body, footer, time} ],
})`;

/**
 * @typedef {Object} StatsWidgetTemplates
 * @property {string|function} [header=''] Header template.
 * @property {string|function} [body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`.
 * @property {string|function} [footer=''] Footer template.
 */

/**
 * @typedef {Object} StatsWidgetCssClasses
 * @property {string|string[]} [root] CSS class to add to the root element.
 * @property {string|string[]} [header] CSS class to add to the header element.
 * @property {string|string[]} [body] CSS class to add to the body element.
 * @property {string|string[]} [footer] CSS class to add to the footer element.
 * @property {string|string[]} [time] CSS class to add to the element wrapping the time processingTimeMs.
 */

/**
 * @typedef {Object} StatsWidgetTransforms
 * @property {function(StatsBodyData):object} [body] Updates the content of object passed to the `body` template.
 */

/**
 * @typedef {Object} StatsBodyData
 * @property {boolean} hasManyResults True if the result set has more than one result.
 * @property {boolean} hasNoResults True if the result set has no result.
 * @property {boolean} hasOneResult True if the result set has exactly one result.
 * @property {number} hitsPerPage Number of hits per page.
 * @property {number} nbHits Number of hit in the result set.
 * @property {number} nbPages Number of pages in the result set with regard to the hitsPerPage and number of hits.
 * @property {number} page Number of the current page. First page is 0.
 * @property {number} processingTimeMS Time taken to compute the results inside the engine.
 * @property {string} query Text query currently used.
 */

/**
 * @typedef {Object} StatsWidgetOptions
 * @property {string|HTMLElement} container Place where to insert the widget in your webpage.
 * @property {StatsWidgetTemplates} [templates] Templates to use for the widget.
 * @property {StatsWidgetTransforms} [transformData] Object that contains the functions to be applied on the data * before being used for templating. Valid keys are `body` for the body template.
 * @property {boolean} [autoHideContainer=true] Make the widget hides itself when there is no results matching.
 * @property {StatsWidgetCssClasses} [cssClasses] CSS classes to add.
 */

/**
 * The `stats` widget is used to display useful insights about the current results.
 *
 * By default, it will display the **number of hits** and the time taken to compute the
 * results inside the engine.
 * @type {WidgetFactory}
 * @devNovel Stats
 * @category metadata
 * @param {StatsWidgetOptions} $0 Stats widget options. Some keys are mandatory: `container`,
 * @return {Widget} A new stats widget instance
 * @example
 * search.addWidget(
 *   instantsearch.widgets.stats({
 *     container: '#stats-container'
 *   })
 * );
 */
export default function stats(
  {
    container,
    cssClasses: userCssClasses = {},
    autoHideContainer = true,
    collapsible = false,
    transformData,
    templates = defaultTemplates,
  } = {}
) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    header: cx(bem('header'), userCssClasses.header),
    root: cx(bem(null), userCssClasses.root),
    time: cx(bem('time'), userCssClasses.time),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates,
    transformData,
  });

  try {
    const makeWidget = connectStats(specializedRenderer, () =>
      unmountComponentAtNode(containerNode)
    );
    return makeWidget();
  } catch (e) {
    throw new Error(usage);
  }
}
