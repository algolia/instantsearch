import React from 'react';
import ReactDOM from 'react-dom';

import utils from '../../lib/utils.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
let bem = require('../../lib/utils.js').bemHelper('ais-stats');
import cx from 'classnames';

import defaultTemplates from './defaultTemplates.js';

/**
 * Display various stats about the current search state
 * @function stats
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.body] Body template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the `body` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.time] CSS class to add to the element wrapping the time processingTimeMs
 * @return {Object}
 */
const usage = `Usage:
stats({
  container,
  [ template ],
  [ transformData ],
  [ autoHideContainer]
})`;
function stats({
    container,
    cssClasses: userCssClasses = {},
    autoHideContainer = true,
    templates = defaultTemplates,
    transformData
  } = {}) {
  if (!container) throw new Error(usage);
  let containerNode = utils.getContainerNode(container);

  let Stats = headerFooterHOC(require('../../components/Stats/Stats.js'));
  if (autoHideContainer === true) {
    Stats = autoHideContainerHOC(Stats);
  }

  if (!containerNode) {
    throw new Error(usage);
  }

  let cssClasses = {
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    header: cx(bem('header'), userCssClasses.header),
    root: cx(bem(null), userCssClasses.root),
    time: cx(bem('time'), userCssClasses.time)
  };

  return {
    init({templatesConfig}) {
      this._templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });
    },

    render: function({results}) {
      ReactDOM.render(
        <Stats
          cssClasses={cssClasses}
          hitsPerPage={results.hitsPerPage}
          nbHits={results.nbHits}
          nbPages={results.nbPages}
          page={results.page}
          processingTimeMS={results.processingTimeMS}
          query={results.query}
          shouldAutoHideContainer={results.nbHits === 0}
          templateProps={this._templateProps}
        />,
        containerNode
      );
    }
  };
}

export default stats;
