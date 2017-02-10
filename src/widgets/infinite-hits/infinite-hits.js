import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode,
} from '../../lib/utils.js';
import cx from 'classnames';
import InfiniteHits from '../../components/InfiniteHits.js';
import defaultTemplates from './defaultTemplates.js';

const bem = bemHelper('ais-infinite-hits');

/**
 * Display the list of results (hits) from the current search
 * @function hits
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {number} [options.hitsPerPage=20] The number of hits to display per page [*]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.empty=''] Template to use when there are no results.
 * @param  {string|Function} [options.templates.item=''] Template to use for each result. This template will receive an object containing a single record.
 * @param  {Object} [options.transformData] Method to change the object passed to the templates
 * @param  {Function} [options.transformData.empty] Method used to change the object passed to the `empty` template
 * @param  {Function} [options.transformData.item] Method used to change the object passed to the `item` template
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the wrapping element
 * @param  {string|string[]} [options.cssClasses.empty] CSS class to add to the wrapping element when no results
 * @param  {string|string[]} [options.7cssClasses.item] CSS class to add to each result
 * @return {Object}
 */
const usage = `
Usage:
infiniteHits({
  container,
  [ cssClasses.{root,empty,item}={} ],
  [ templates.{empty,item} | templates.{empty} ],
  [ transformData.{empty,item} | transformData.{empty} ],
  [ hitsPerPage=20 ]
})`;
function infiniteHits({
    container,
    cssClasses: userCssClasses = {},
    showMoreLabel = 'Show more results',
    templates = defaultTemplates,
    transformData,
    hitsPerPage = 20,
  } = {}) {
  if (!container) {
    throw new Error(`Must provide a container.${usage}`);
  }

  const containerNode = getContainerNode(container);
  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    item: cx(bem('item'), userCssClasses.item),
    empty: cx(bem(null, 'empty'), userCssClasses.empty),
    showmore: cx(bem('showmore'), userCssClasses.showmore),
  };

  let hitsCache = [];

  const getShowMore = helper => () => helper.nextPage().search();

  return {
    getConfiguration: () => ({hitsPerPage}),
    init({templatesConfig, helper}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates,
      });

      this.showMore = getShowMore(helper);
    },
    render({results, state}) {
      if (state.page === 0) {
        hitsCache = [];
      }

      hitsCache = [...hitsCache, ...results.hits];

      ReactDOM.render(
        <InfiniteHits
          cssClasses={cssClasses}
          hits={hitsCache}
          results={results}
          showMore={this.showMore}
          showMoreLabel={showMoreLabel}
          templateProps={this._templateProps}
        />,
        containerNode
      );
    },
  };
}

export default infiniteHits;
