import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';
let bem = utils.bemHelper('ais-hits');
import cx from 'classnames';

import Hits from '../../components/Hits.js';
import defaultTemplates from './defaultTemplates.js';

/**
 * Display the list of results (hits) from the current search
 * @function hits
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=''] Template to use for each result.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty=identity] Method used to change the object passed to the empty template
 * @param  {Function} [options.transformData.item=identity] Method used to change the object passed to the item template
 * @param  {number} [hitsPerPage=20] The number of hits to display per page
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string} [options.cssClasses.item] CSS class to add to each result
 * @return {Object}
 */
const usage = `Usage:
hits({
  container,
  [ cssClasses.{root,empty,item}={} ],
  [ templates.{empty,item} ],
  [ transformData.{empty=identity,item=identity} ],
  [ hitsPerPage=20 ]
})`;
function hits({
    container,
    cssClasses: userCssClasses = {},
    templates = defaultTemplates,
    transformData,
    hitsPerPage = 20
  } = {}) {
  if (!container) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty)
  };

  return {
    getConfiguration: () => ({hitsPerPage}),
    render: function({results, templatesConfig}) {
      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      ReactDOM.render(
        <Hits
          cssClasses={cssClasses}
          hits={results.hits}
          results={results}
          templateProps={templateProps}
        />,
        containerNode
      );
    }
  };
}

export default hits;
