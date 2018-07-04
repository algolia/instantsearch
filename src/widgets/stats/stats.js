import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';

import Stats from '../../components/Stats/Stats';
import connectStats from '../../connectors/stats/connectStats';
import defaultTemplates from './defaultTemplates';

import { prepareTemplateProps, getContainerNode } from '../../lib/utils';

import { component } from '../../lib/suit';

const suit = component('Stats');

const renderer = ({
  containerNode,
  cssClasses,
  collapsible,
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

  const statsData = {
    hitsPerPage,
    nbHits,
    nbPages,
    page,
    processingTimeMS,
    query,
    hasManyResults: nbHits > 1,
    hasNoResults: nbHits === 0,
    hasOneResult: nbHits === 1,
  };

  render(
    <Stats
      collapsible={collapsible}
      cssClasses={cssClasses}
      data={statsData}
      templateProps={renderState.templateProps}
    />,
    containerNode
  );
};

const usage = `Usage:
stats({
  container,
  [ templates.{text} ],
  [ transformData.{text} ],
  [ cssClasses.{root, text} ],
})`;

/**
 * @typedef {Object} StatsWidgetTemplates
 * @property {string|function(StatsData):string} [text] text of the widget.
 */

/**
 * @typedef {Object} StatsWidgetCssClasses
 * @property {string|string[]} [root] CSS class to add to the root element of the widget.
 * @property {string|string[]} [text] CSS class to add to the element wrapping the text content of the widget.
 */

/**
 * @typedef {Object} StatsWidgetTransforms
 * @property {function(StatsData):object} [text] Updates the content of object passed to the `text` template.
 */

/**
 * @typedef {Object} StatsData
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
export default function stats({
  container,
  cssClasses: userCssClasses = {},
  collapsible = false,
  transformData,
  templates = defaultTemplates,
} = {}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    text: cx(suit({ descendantName: 'text' }), userCssClasses.text),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
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
