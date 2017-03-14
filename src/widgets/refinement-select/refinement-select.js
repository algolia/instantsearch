import React from 'react';
import ReactDOM from 'react-dom';
import cx from 'classnames';

import headerFooterHOC from '../../decorators/headerFooter.js';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import RefinementSelectComponent from '../../components/RefinementSelect/RefinementSelect.js';
import defaultTemplates from './defaultTemplates.js';

import {
  getContainerNode,
  prepareTemplateProps,
  bemHelper,
} from '../../lib/utils.js';

const bem = bemHelper('ais-refinement-select');

/**
 * Create a <select> menu out of a facet
 * @function refinementSelect
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string[]|Function} [options.sortBy=['count:desc', 'name:asc']] How to sort refinements. Possible values: `count|isRefined|name:asc|name:desc`.
 *   You can also use a sort function that behaves like the standard Javascript [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Syntax). [*]
 * @param  {string} [options.limit=10] How many facets values to retrieve [*]
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header] Header template
 * @param  {string|Function} [options.templates.footer] Footer template
 * @param  {string} [options.templates.seeAllOption] First option of <select> template
 * @param  {Function} [options.templates.selectOption] Other options of <select> template, provided with `name`, `count`, `isRefined` data properties
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {string|string[]} [options.cssClasses.select] CSS class to add to the <select> element
 * @param  {string|string[]} [options.cssClasses.option] CSS class to add to the <option> element
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when there are no items in the menu
 * @return {Object}
**/
const usage = `Usage:
refinementSelect({
  container,
  attributeName,
  [ autoHideContainer=true ],
  [ sortBy=['count:desc', 'name:asc'] ],
  [ limit=10 ],
  [ cssClasses.{root,header,body,footer,select,option}={} ],
  [ templates.{header,seeAllOption:string,selectOption:function,footer} ],
})`;

function refinementSelect({
  container,
  attributeName,
  limit = 10,
  autoHideContainer = true,
  sortBy = ['count:desc', 'name:asc'],
  cssClasses: userCssClasses = {},
  templates = defaultTemplates,
} = {}) {
  // check for templates options validity
  const seeAllOptionTemplateIsValid = templates.seeAllOption
    ? typeof templates.seeAllOption === 'string'
    : true;

  const selectOptionTemplateIsValid = templates.selectOption
    ? typeof templates.selectOption === 'function'
    : true;

  if (!container || !attributeName || !seeAllOptionTemplateIsValid || !selectOptionTemplateIsValid) {
    throw new Error(usage);
  }

  const containerNode = getContainerNode(container);

  const RefinementSelect = autoHideContainer === true
    ? autoHideContainerHOC(headerFooterHOC(RefinementSelectComponent))
    : headerFooterHOC(RefinementSelectComponent);

  const hierarchicalFacetName = attributeName;

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer),
    select: cx(bem('select'), userCssClasses.select),
    option: cx(bem('option'), userCssClasses.option),
  };

  return {
    init({helper, templatesConfig}) {
      this._templateProps = prepareTemplateProps({defaultTemplates, templatesConfig, templates});

      this._toggleRefinement = facetValue => helper
        .toggleRefinement(hierarchicalFacetName, facetValue)
        .search();

      this._clearRefinements = () => helper
        .clearRefinements(hierarchicalFacetName)
        .search();
    },

    render({results}) {
      const facetValues = results.getFacetValues(hierarchicalFacetName, {sortBy}).data || [];

      ReactDOM.render(
        <RefinementSelect
          shouldAutoHideContainer={ false }
          cssClasses={ cssClasses }
          facetValues={ facetValues }
          templateProps={ this._templateProps }
          toggleRefinement={ this._toggleRefinement }
          clearRefinements={ this._clearRefinements }
          limit={ limit }
        />,
        containerNode
      );
    },
  };
}

export default refinementSelect;
