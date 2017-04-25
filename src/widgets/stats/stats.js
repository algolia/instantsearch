import React from 'react';
import ReactDOM from 'react-dom';
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
}) => ({
  hitsPerPage,
  nbHits,
  nbPages,
  page,
  processingTimeMS,
  query,
  instantSearchInstance,
}, isFirstRendering) => {
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

  ReactDOM.render(
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
  [ templates.{header,body,footer} ],
  [ transformData.{body} ],
  [ autoHideContainer]
})`;

/**
 * @typedef {Object} StatsWidgetTemplates
 * @property {string|Function} [header=''] Header template
 * @property {string|Function} [body] Body template, provided with `hasManyResults`,
 * `hasNoResults`, `hasOneResult`, `hitsPerPage`, `nbHits`, `nbPages`, `page`, `processingTimeMS`, `query`
 * @property {string|Function} [footer=''] Footer template
 */

/**
 * @typedef {Object} StatsWidgetCssClasses
 * @property {string|string[]} [root] CSS class to add to the root element
 * @property {string|string[]} [header] CSS class to add to the header element
 * @property {string|string[]} [body] CSS class to add to the body element
 * @property {string|string[]} [footer] CSS class to add to the footer element
 * @property {string|string[]} [time] CSS class to add to the element wrapping the time processingTimeMs
 */

/**
 * @typedef {Object} StatsWidgetOptions
 * @property {string|DOMElement} container CSS Selector or DOMElement to insert the widget
 * @property {StatsWidgetTemplates} [templates] Templates to use for the widget
 * @property {Object.<string, function>} [transformData] Object that contains the functions to be applied on the data
 * before being used for templating. Valid keys are `body` for the body template.
 * @property {boolean} [autoHideContainer=true] Hide the container when no results match
 * @property {StatsWidgetCssClasses} [cssClasses] CSS classes to add
 */

/**
 * The `stats` widget is used to display useful insights about the current results.
 *
 * By default, it will display the **number of hits** and the time taken to compute the
 * results inside the engine.
 * @type {WidgetFactory}
 * @memberof instantsearch.widgets
 * @param {StatsWidgetOptions} $0 Stats widget options. Some keys are mandatories: `container`,
 * @return {Widget} A new stats widget instance
 */
export default function stats({
  container,
  cssClasses: userCssClasses = {},
  autoHideContainer = true,
  collapsible = false,
  transformData,
  templates = defaultTemplates,
}) {
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
    const makeWidget = connectStats(specializedRenderer);
    return makeWidget();
  } catch (e) {
    throw new Error(usage);
  }
}
