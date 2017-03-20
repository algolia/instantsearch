import React from 'react';
import ReactDOM from 'react-dom';
import ClearAllWithHOCs from '../../components/ClearAll/ClearAll.js';
import cx from 'classnames';

import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
} from '../../lib/utils.js';

import connectClearAll from '../../connectors/clear-all/connectClearAll.js';

import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-clear-all');

const renderer = ({containerNode, cssClasses, collapsible, autoHideContainer, renderState, templates}) => ({
  clearAll,
  hasRefinements,
  createURL,
  instantSearchInstance,
}, isFirstRendering) => {
  if (isFirstRendering) {
    renderState.templateProps = prepareTemplateProps({
      defaultTemplates,
      templatesConfig: instantSearchInstance.templatesConfig,
      templates,
    });
    return;
  }

  const shouldAutoHideContainer = autoHideContainer && !hasRefinements;

  ReactDOM.render(
    <ClearAllWithHOCs
      clearAll={clearAll}
      collapsible={collapsible}
      cssClasses={cssClasses}
      hasRefinements={hasRefinements}
      shouldAutoHideContainer={shouldAutoHideContainer}
      templateProps={renderState.templateProps}
      url={createURL()}
    />,
    containerNode
  );
};

/**
 * Allows to clear all refinements at once
 * @function clearAll
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]} [options.excludeAttributes] List of attributes names to exclude from clear actions
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.link] Link template
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there's no refinement to clear
 * @param  {Object} [options.cssClasses] CSS classes to be added
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to the link element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */

const usage = `Usage:
clearAll({
  container,
  [ cssClasses.{root,header,body,footer,link}={} ],
  [ templates.{header,link,footer}={link: 'Clear all'} ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ excludeAttributes=[] ]
})`;

export default function ClearAll({
  container,
  templates = defaultTemplates,
  cssClasses: userCssClasses = {},
  collapsible = false,
  autoHideContainer = true,
  excludeAttributes = [],
}) {
  if (!container) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    link: cx(bem('link'), userCssClasses.link),
  };

  const specializedRenderer = renderer({
    containerNode,
    cssClasses,
    collapsible,
    autoHideContainer,
    renderState: {},
    templates,
  });

  const makeWidget = connectClearAll(specializedRenderer);
  return makeWidget({excludeAttributes});
}
