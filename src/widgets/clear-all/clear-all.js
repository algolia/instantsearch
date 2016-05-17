import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  getContainerNode,
  prepareTemplateProps,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch
} from '../../lib/utils.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import defaultTemplates from './defaultTemplates.js';
import ClearAllComponent from '../../components/ClearAll/ClearAll.js';

let bem = bemHelper('ais-clear-all');

/**
 * Allows to clear all refinements at once
 * @function clearAll
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
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
  [ collapsible=false ]
})`;
function clearAll({
    container,
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    collapsible = false,
    autoHideContainer = true
  } = {}) {
  if (!container) {
    throw new Error(usage);
  }

  let containerNode = getContainerNode(container);
  let ClearAll = headerFooterHOC(ClearAllComponent);
  if (autoHideContainer === true) {
    ClearAll = autoHideContainerHOC(ClearAll);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    link: cx(bem('link'), userCssClasses.link)
  };

  return {
    init({helper, templatesConfig}) {
      this._clearRefinementsAndSearch = clearRefinementsAndSearch.bind(null, helper);
      this._templateProps = prepareTemplateProps({defaultTemplates, templatesConfig, templates});
    },

    render: function({results, state, createURL}) {
      let hasRefinements = getRefinements(results, state).length !== 0;
      let url = createURL(clearRefinementsFromState(state));

      ReactDOM.render(
        <ClearAll
          clearAll={this._clearRefinementsAndSearch}
          collapsible={collapsible}
          cssClasses={cssClasses}
          hasRefinements={hasRefinements}
          shouldAutoHideContainer={!hasRefinements}
          templateProps={this._templateProps}
          url={url}
        />,
        containerNode
      );
    }
  };
}

export default clearAll;
