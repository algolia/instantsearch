import {
  bemHelper,
  getContainerNode
} from '../../lib/utils.js';
import defaultTemplates from './defaultTemplates.js';
import cx from 'classnames';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import RefinementListComponent from '../../components/RefinementList/RefinementList.js';
import currentToggle from './implementations/currentToggle';
import legacyToggle from './implementations/legacyToggle';

const bem = bemHelper('ais-toggle');

// we cannot use helper. because the facet is not yet declared in the helper
const hasFacetsRefinementsFor = (attributeName, searchParameters) =>
  searchParameters &&
  searchParameters.facetsRefinements &&
  searchParameters.facetsRefinements[attributeName] !== undefined;

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
  const containerNode = getContainerNode(container);

  if (!container || !attributeName || !label) {
    throw new Error(usage);
  }

  let RefinementList = headerFooterHOC(RefinementListComponent);
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  const hasAnOffValue = userValues.off !== undefined;

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
    count: cx(bem('count'), userCssClasses.count)
  };

  // store the computed options for usage in the two toggle implementations
  const implemOptions = {
    attributeName,
    label,
    userValues,
    templates,
    collapsible,
    transformData,
    hasAnOffValue,
    containerNode,
    RefinementList,
    cssClasses
  };

  return {
    getConfiguration(currentSearchParameters, searchParametersFromUrl) {
      const useLegacyToggle =
        hasFacetsRefinementsFor(attributeName, currentSearchParameters) ||
        hasFacetsRefinementsFor(attributeName, searchParametersFromUrl);

      const toggleImplementation = useLegacyToggle ?
        legacyToggle(implemOptions) :
        currentToggle(implemOptions);

      this.init = toggleImplementation.init.bind(toggleImplementation);
      this.render = toggleImplementation.render.bind(toggleImplementation);
      return toggleImplementation.getConfiguration(currentSearchParameters, searchParametersFromUrl);
    },
    init() {},
    render() {}
  };
}

export default toggle;
