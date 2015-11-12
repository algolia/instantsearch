let React = require('react');
let ReactDOM = require('react-dom');

let utils = require('../../lib/utils.js');
let bem = utils.bemHelper('ais-refinement-list');
let cx = require('classnames');
let find = require('lodash/collection/find');
let includes = require('lodash/collection/includes');

let autoHideContainerHOC = require('../../decorators/autoHideContainer');
let headerFooterHOC = require('../../decorators/headerFooter');

let defaultTemplates = require('./defaultTemplates');

/**
 * Instantiate a list of refinements based on a facet
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for filtering
 * @param  {Object[]} options.options List of all the options
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements: root, list, item
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.list] CSS class to add to the list element
 * @param  {string|string[]} [options.cssClasses.label] CSS class to add to each link element
 * @param  {string|string[]} [options.cssClasses.item] CSS class to add to each item element
 * @param  {string|string[]} [options.cssClasses.radio] CSS class to add to each radio element (when using the default template)
 * @param  {string|string[]} [options.cssClasses.active] CSS class to add to each active element
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.item] Item template, provided with `name`, `count`, `isRefined`
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {Function} [options.transformData] Function to change the object passed to the item template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no results match
 * @return {Object}
 */
const usage = `Usage:
numericRefinementList({
  container,
  attributeName,
  options,
  [ sortBy ],
  [ limit ],
  [ cssClasses.{root,header,body,footer,list,item,active,label,checkbox,count} ],
  [ templates.{header,item,footer} ],
  [ transformData ],
  [ autoHideContainer ]
})`;
function numericRefinementList({
  container,
  attributeName,
  options,
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
  transformData,
  autoHideContainer = true
  }) {
  if (!container || !attributeName || !options) {
    throw new Error(usage);
  }

  let containerNode = utils.getContainerNode(container);
  let RefinementList = headerFooterHOC(require('../../components/RefinementList/RefinementList.js'));
  if (autoHideContainer === true) {
    RefinementList = autoHideContainerHOC(RefinementList);
  }

  return {
    getConfiguration: () => {
      return {};
    },

    render: function({helper, results, templatesConfig, state, createURL}) {
      let templateProps = utils.prepareTemplateProps({
        transformData,
        defaultTemplates,
        templatesConfig,
        templates
      });

      let facetValues = options.map(function(option) {
        option.isRefined = isRefined(helper.state, attributeName, option);
        option.attributeName = attributeName;
        return option;
      });

      let hasNoResults = results.nbHits === 0;

      let cssClasses = {
        root: cx(bem(null), userCssClasses.root),
        header: cx(bem('header'), userCssClasses.header),
        body: cx(bem('body'), userCssClasses.body),
        footer: cx(bem('footer'), userCssClasses.footer),
        list: cx(bem('list'), userCssClasses.list),
        item: cx(bem('item'), userCssClasses.item),
        label: cx(bem('label'), userCssClasses.label),
        radio: cx(bem('radio'), userCssClasses.radio),
        active: cx(bem('item', 'active'), userCssClasses.active)
      };

      ReactDOM.render(
        <RefinementList
          createURL={(facetValue) => createURL(refine(state, attributeName, options, facetValue))}
          cssClasses={cssClasses}
          facetValues={facetValues}
          shouldAutoHideContainer={hasNoResults}
          templateProps={templateProps}
          toggleRefinement={this._toggleRefinement.bind(null, helper)}
        />,
        containerNode
      );
    },
    _toggleRefinement: function(helper, facetValue) {
      let newState = refine(helper.state, attributeName, options, facetValue);

      helper.setState(newState);

      helper.search();
    }
  };
}

function isRefined(state, attributeName, option) {
  let currentRefinements = state.getNumericRefinements(attributeName);

  if (option.start !== undefined && option.end !== undefined) {
    if (option.start === option.end) {
      return hasNumericRefinement(currentRefinements, '=', option.start);
    }
  }

  if (option.start !== undefined) {
    return hasNumericRefinement(currentRefinements, '>=', option.start);
  }

  if (option.end !== undefined) {
    return hasNumericRefinement(currentRefinements, '<=', option.end);
  }

  if (option.start === undefined && option.end === undefined) {
    return Object.keys(currentRefinements).length === 0;
  }
}

function refine(state, attributeName, options, facetValue) {
  let refinedOption = find(options, {name: facetValue});

  let currentRefinements = state.getNumericRefinements(attributeName);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return state.clearRefinements(attributeName);
  }

  if (!isRefined(state, attributeName, refinedOption)) {
    state = state.clearRefinements(attributeName);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        state = state.removeNumericRefinement(attributeName, '=', refinedOption.start);
      } else {
        state = state.addNumericRefinement(attributeName, '=', refinedOption.start);
      }
      return state;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      state = state.removeNumericRefinement(attributeName, '>=', refinedOption.start);
    } else {
      state = state.addNumericRefinement(attributeName, '>=', refinedOption.start);
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      state = state.removeNumericRefinement(attributeName, '<=', refinedOption.end);
    } else {
      state = state.addNumericRefinement(attributeName, '<=', refinedOption.end);
    }
  }

  return state;
}

function hasNumericRefinement(currentRefinements, operator, value) {
  let hasOperatorRefinements = currentRefinements[operator] !== undefined;
  let includesValue = includes(currentRefinements[operator], value);

  return hasOperatorRefinements && includesValue;
}

module.exports = numericRefinementList;
