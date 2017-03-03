import find from 'lodash/find';

import {
  prepareTemplateProps,
  bemHelper,
  getContainerNode,
  escapeRefinement,
  unescapeRefinement,
} from '../../lib/utils.js';
import defaultTemplates from './defaultTemplates.js';
import cx from 'classnames';

const bem = bemHelper('ais-toggle');

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
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`, `url` data properties
 * count is always the number of hits that would be shown if you toggle the widget. We also provide
 * `onFacetValue` and `offFacetValue` objects with according counts.
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
  [ values={on: true, off: undefined} ],
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],
  [ templates.{header,item,footer} ],
  [ transformData.{item} ],
  [ autoHideContainer=true ],
  [ collapsible=false ]
})`;
const connectToggle = toggleRendering => ({
  container,
  attributeName,
  label,
  values: userValues = {on: true, off: undefined},
  templates = defaultTemplates,
  collapsible = false,
  cssClasses: userCssClasses = {},
  transformData,
  autoHideContainer = true,
} = {}) => {
  const containerNode = getContainerNode(container);

  if (!container || !attributeName || !label) {
    throw new Error(usage);
  }

  const hasAnOffValue = userValues.off !== undefined;
  const on = userValues ? escapeRefinement(userValues.on) : undefined;
  const off = userValues ? escapeRefinement(userValues.off) : undefined;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    list: cx(bem('list'), userCssClasses.list),
    item: cx(bem('item'), userCssClasses.item),
    active: cx(bem('item', 'active'), userCssClasses.active),
    label: cx(bem('label'), userCssClasses.label),
    checkbox: cx(bem('checkbox'), userCssClasses.checkbox),
    count: cx(bem('count'), userCssClasses.count),
  };

  return {
    getConfiguration() {
      return {
        disjunctiveFacets: [attributeName],
      };
    },
    init({state, helper, templatesConfig, createURL}) {
      this._templateProps = prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates,
      });

      this.toggleRefinement = this.toggleRefinement.bind(this, helper);

      // Bind createURL to this specific attribute
      this._createURL = (currentState, isCurrentlyRefined) => () =>
        createURL(currentState.removeDisjunctiveFacetRefinement(attributeName, isCurrentlyRefined ? on : off)
                              .addDisjunctiveFacetRefinement(attributeName, isCurrentlyRefined ? off : on));

      const isRefined = state.isDisjunctiveFacetRefined(attributeName, on);
      // no need to refine anything at init if no custom off values
      if (hasAnOffValue) {
        // Add filtering on the 'off' value if set
        if (!isRefined) {
          helper.addDisjunctiveFacetRefinement(attributeName, off);
        }
      }

      const onFacetValue = {
        name: label,
        isRefined,
        count: 0,
      };

      const offFacetValue = {
        name: label,
        isRefined: hasAnOffValue && !isRefined,
        count: 0,
      };

      const value = {
        name: label,
        isRefined,
        count: null,
        onFacetValue,
        offFacetValue,
      };

      toggleRendering({
        collapsible,
        createURL: this._createURL(state, isRefined),
        cssClasses,
        value,
        shouldAutoHideContainer: autoHideContainer,
        templateProps: this._templateProps,
        toggleRefinement: this.toggleRefinement,
        containerNode,
      }, true);
    },
    render({helper, results, state}) {
      const isRefined = helper.state.isDisjunctiveFacetRefined(attributeName, on);
      const offValue = off === undefined ? false : off;
      const allFacetValues = results.getFacetValues(attributeName);
      const onData = find(allFacetValues, {name: unescapeRefinement(on)});
      const onFacetValue = {
        name: label,
        isRefined: onData !== undefined ? onData.isRefined : false,
        count: onData === undefined ? null : onData.count,
      };
      const offData = hasAnOffValue ? find(allFacetValues, {name: unescapeRefinement(offValue)}) : undefined;
      const offFacetValue = {
        name: label,
        isRefined: offData !== undefined ? offData.isRefined : false,
        count: offData === undefined ? results.nbHits : offData.count,
      };

      // what will we show by default,
      // if checkbox is not checked, show: [ ] free shipping (countWhenChecked)
      // if checkbox is checked, show: [x] free shipping (countWhenNotChecked)
      const nextRefinement = isRefined ? offFacetValue : onFacetValue;

      const value = {
        name: label,
        isRefined,
        count: nextRefinement === undefined ? null : nextRefinement.count,
        onFacetValue,
        offFacetValue,
      };

      toggleRendering({
        collapsible,
        createURL: this._createURL(state, isRefined),
        cssClasses,
        value,
        shouldAutoHideContainer: autoHideContainer && (value.count === 0 || value.count === null),
        templateProps: this._templateProps,
        toggleRefinement: this.toggleRefinement,
        containerNode,
      }, false);
    },
    toggleRefinement(helper, facetValue, isRefined) {
      // Checking
      if (!isRefined) {
        if (hasAnOffValue) {
          helper.removeDisjunctiveFacetRefinement(attributeName, off);
        }
        helper.addDisjunctiveFacetRefinement(attributeName, on);
      } else {
        // Unchecking
        helper.removeDisjunctiveFacetRefinement(attributeName, on);
        if (hasAnOffValue) {
          helper.addDisjunctiveFacetRefinement(attributeName, off);
        }
      }

      helper.search();
    },
  };
};

export default connectToggle;
