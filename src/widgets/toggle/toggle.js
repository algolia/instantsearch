import find from 'lodash/collection/find';
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
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';

let bem = bemHelper('ais-toggle');

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * @function toggle
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.values] Lets you define the values to filter on when toggling
 * @param  {string|number|boolean} [options.values.on=true] Value to filter on when checked
 * @param  {string|number|boolean} [options.values.off=undefined] Value to filter on when unchecked
 * element (when using the default template). By default when switching to `off`, no refinement will be asked. So you
 * will get both `true` and `false` results. If you set the off value to `false` then you will get only objects
 * having `false` has a value for the selected attribute.
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData.item] Function to change the object passed to the `item` template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no results
 * @param  {Object} [options.cssClasses] CSS classes to add
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each
 * label element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.checkbox] CSS class to add to each
 * checkbox element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.count] CSS class to add to each count
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @return {Object}
 */
const usage = `Usage:
toggle({
  container,
  attributeName,
  label,
  [ userValues={on: true, off: undefined} ],
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
function toggle({
    container,
    attributeName,
    label,
    values: userValues = {on: true, off: undefined},
    templates = defaultTemplates,
    collapsible = false,
    cssClasses: userCssClasses = {},
    transformData,
    autoHideContainer = true
  } = {}) {
  let containerNode = getContainerNode(container);

  let RefinementList = headerFooterHOC(RefinementListComponent);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  if (!container || !attributeName || !label) {
    throw new Error(usage);
  }

  let hasAnOffValue = (userValues.off !== undefined);

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    label: cx(bem('label'), userCssClasses.label),
    checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
    count: cx(bem('count'), userCssClasses.count)
  };

  return {
    getConfiguration: () => ({
      facets: [attributeName]
    }),
    init({state, helper, templatesConfig}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });
      this.toggleRefinement = this.toggleRefinement.bind(this, helper);

      if (userValues.off === undefined) {
        return;
      }
      // Add filtering on the 'off' value if set
      let isRefined = state.isFacetRefined(attributeName, userValues.on);
      if (!isRefined) {
        helper.addFacetRefinement(attributeName, userValues.off);
      }
    },
    toggleRefinement: (helper, facetValue, isRefined) => {
      let on = userValues.on;
      let off = userValues.off;

      // Checking
      if (!isRefined) {
        if (hasAnOffValue) {
          helper.removeFacetRefinement(attributeName, off);
        }
        helper.addFacetRefinement(attributeName, on);
      } else {
        // Unchecking
        helper.removeFacetRefinement(attributeName, on);
        if (hasAnOffValue) {
          helper.addFacetRefinement(attributeName, off);
        }
      }

      helper.search();
    },
    render: function({helper, results, state, createURL}) {
      let isRefined = helper.state.isFacetRefined(attributeName, userValues.on);
      let values = find(results.getFacetValues(attributeName), {name: isRefined.toString()});

      let facetValue = {
        name: label,
        isRefined: isRefined,
        count: values && values.count || null
      };

      // Bind createURL to this specific attribute
      function _createURL() {
        return createURL(state.toggleRefinement(attributeName, isRefined));
      }

      ReactDOM.render(
        <RefinementList
          collapsible={collapsible}
          createURL={_createURL}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          shouldAutoHideContainer={results.nbHits === 0}
          templateProps={this._templateProps}
          toggleRefinement={this.toggleRefinement}
        />,
        containerNode
      );
    }
  };
}


export default toggle;
