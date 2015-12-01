let find = require('lodash/collection/find');
let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils');
let bem = utils.bemHelper('ais-toggle');
let cx = require('classnames');

let autoHideContainerHOC = require('../../decorators/autoHideContainer');
let headerFooterHOC = require('../../decorators/headerFooter');

let defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate the toggling of a boolean facet filter on and off.
 * Note that it will not toggle between `true` and `false, but between `true`
 * and `undefined`.
 * @function toggle
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {string} options.label Human-readable name of the filter (eg. "Free Shipping")
 * @param  {Object} [options.values] Lets you define the values to filter on when toggling
 * @param  {*} [options.values.on] Value to filter on when checked
 * @param  {*} [options.values.off] Value to filter on when unchecked
 * element (when using the default template)
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.item] Item template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there's no results
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
  [ transformData ],
  [ autoHideContainer=true ]
})`;
function toggle({
    container,
    attributeName,
    label,
    values: userValues = {on: true, off: undefined},
    templates = defaultTemplates,
    cssClasses: userCssClasses = {},
    transformData,
    autoHideContainer = true
  } = {}) {
  let containerNode = utils.getContainerNode(container);

  let RefinementList = headerFooterHOC(require('../../components/RefinementList/RefinementList'));
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  if (!container || !attributeName || !label) {
    throw new Error(usage);
  }

  let hasAnOffValue = (userValues.off !== undefined);

  return {
    getConfiguration: () => ({
      facets: [attributeName]
    }),
    init: ({state, helper}) => {
      if (userValues.off === undefined) {
        return;
      }
      // Add filtering on the 'off' value if set
      let isRefined = state.isFacetRefined(attributeName, userValues.on);
      if (!isRefined) {
        helper.addFacetRefinement(attributeName, userValues.off);
      }
    },
    toggleRefinement: (helper, isRefined) => {
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
    render: function({helper, results, templatesConfig, state, createURL}) {
      let isRefined = helper.state.isFacetRefined(attributeName, userValues.on);
      let values = find(results.getFacetValues(attributeName), {name: isRefined.toString()});
      let hasNoResults = results.nbHits === 0;

      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      let facetValue = {
        name: label,
        isRefined: isRefined,
        count: values && values.count || null
      };

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

      let toggleRefinement = this.toggleRefinement.bind(this, helper, isRefined);

      ReactDOM.render(
        <RefinementList
          createURL={() => createURL(state.toggleRefinement(attributeName, facetValue.isRefined))}
          cssClasses={cssClasses}
          facetValues={[facetValue]}
          shouldAutoHideContainer={hasNoResults}
          templateProps={templateProps}
          toggleRefinement={toggleRefinement}
        />,
        containerNode
      );
    }
  };
}


module.exports = toggle;
