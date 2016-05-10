import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode
} from '../../lib/utils.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import defaultTemplates from './defaultTemplates.js';
import defaultLabels from './defaultLabels.js';
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';

let bem = bemHelper('ais-star-rating');

/**
 * Instantiate a list of refinements based on a rating attribute
 * The ratings must be integer values. You can still keep the precise float value in another attribute
 * to be used in the custom ranking configuration. So that the actual hits ranking is precise.
 * @function starRating
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {number} [options.max] The maximum rating value
 * @param  {Object} [options.labels] Labels used by the default template
 * @param  {string} [options.labels.andUp] The label suffixed after each line
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.link] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.disabledLink] CSS class to add to each disabled link (when using the default template)
 * @param  {string|string[]} [options.cssClasses.star] CSS class to add to each star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.emptyStar] CSS class to add to each empty star element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
starRating({
  container,
  attributeName,
  [ max=5 ],
  [ cssClasses.{root,header,body,footer,list,item,active,link,disabledLink,star,emptyStar,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ labels.{andUp} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
function starRating({
    container,
    attributeName,
    max = 5,
    cssClasses: userCssClasses = {},
    labels = defaultLabels,
    templates = defaultTemplates,
    collapsible = false,
    transformData,
    autoHideContainer = true
  }) {
  let containerNode = getContainerNode(container);
  let RefinementList = headerFooterHOC(RefinementListComponent);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  if (!container || !attributeName) {
    throw new Error(usage);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    link: cx(bem('link'), userCssClasses.link),
    disabledLink: cx(bem('link', 'disabled'), userCssClasses.disabledLink),
    count: cx(bem('count'), userCssClasses.count),
    star: cx(bem('star'), userCssClasses.star),
    emptyStar: cx(bem('star', 'empty'), userCssClasses.emptyStar),
    active: cx(bem('item', 'active'), userCssClasses.active)
  };

  return {
    getConfiguration: () => {
      return {
        disjunctiveFacets: [attributeName]
      };
    },

    init({templatesConfig, helper}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });
      this._toggleRefinement = this._toggleRefinement.bind(this, helper);
    },

    render: function({helper, results, state, createURL}) {
      let facetValues = [];
      let allValues = {};
      for (let v = max - 1; v >= 0; --v) {
        allValues[v] = 0;
      }
      results.getFacetValues(attributeName).forEach(facet => {
        let val = Math.round(facet.name);
        if (!val || val > max - 1) {
          return;
        }
        for (let v = val; v >= 1; --v) {
          allValues[v] += facet.count;
        }
      });
      let refinedStar = this._getRefinedStar(helper);
      for (let star = max - 1; star >= 1; --star) {
        let count = allValues[star];
        if (refinedStar && star !== refinedStar && count === 0) {
          // skip count==0 when at least 1 refinement is enabled
          continue;
        }
        let stars = [];
        for (let i = 1; i <= max; ++i) {
          stars.push(i <= star);
        }
        facetValues.push({
          stars: stars,
          name: '' + star,
          count: count,
          isRefined: refinedStar === star,
          labels
        });
      }

      // Bind createURL to this specific attribute
      function _createURL(facetValue) {
        return createURL(state.toggleRefinement(attributeName, facetValue));
      }

      ReactDOM.render(
        <RefinementList
          collapsible={collapsible}
          createURL={_createURL}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={results.nbHits === 0}
          templateProps={this._templateProps}
          toggleRefinement={this._toggleRefinement}
        />,
        containerNode
      );
    },

    _toggleRefinement: function(helper, facetValue) {
      let isRefined = this._getRefinedStar(helper) === +facetValue;
      helper.clearRefinements(attributeName);
      if (!isRefined) {
        for (let val = +facetValue; val <= max; ++val) {
          helper.addDisjunctiveFacetRefinement(attributeName, val);
        }
      }
      helper.search();
    },

    _getRefinedStar: function(helper) {
      let refinedStar = undefined;
      let refinements = helper.getRefinements(attributeName);
      refinements.forEach((r) => {
        if (!refinedStar || +r.value < refinedStar) {
          refinedStar = +r.value;
        }
      });
      return refinedStar;
    }
  };
}

export default starRating;
