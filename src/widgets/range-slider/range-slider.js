import React from 'react';
import ReactDOM from 'react-dom';
import {
  bemHelper,
  prepareTemplateProps,
  getContainerNode
} from '../../lib/utils.js';
import find from 'lodash/collection/find';
import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';
import cx from 'classnames';
import SliderComponent from '../../components/Slider/Slider.js';

let bem = bemHelper('ais-range-slider');
let defaultTemplates = {
  header: '',
  footer: ''
};

/**
 * Instantiate a slider based on a numeric attribute
 * @function rangeSlider
 * @param  {string|DOMElement} options.container CSS Selector or DOMElement to insert the widget
 * @param  {string} options.attributeName Name of the attribute for faceting
 * @param  {boolean|Object} [options.tooltips=true] Should we show tooltips or not.
 * The default tooltip will show the formatted corresponding value without any other token.
 * You can also provide
 * `tooltips: {format: function(formattedValue, rawValue) {return '$' + formattedValue}}`
 * So that you can format the tooltip display value as you want
 * @param  {Object} [options.templates] Templates to use for the widget
 * @param  {string|Function} [options.templates.header=''] Header template
 * @param  {string|Function} [options.templates.footer=''] Footer template
 * @param  {boolean} [options.autoHideContainer=true] Hide the container when no refinements available
 * @param  {Object} [options.cssClasses] CSS classes to add to the wrapping elements
 * @param  {string|string[]} [options.cssClasses.root] CSS class to add to the root element
 * @param  {string|string[]} [options.cssClasses.header] CSS class to add to the header element
 * @param  {string|string[]} [options.cssClasses.body] CSS class to add to the body element
 * @param  {string|string[]} [options.cssClasses.footer] CSS class to add to the footer element
 * @param  {object|boolean} [options.collapsible=false] Hide the widget body and footer when clicking on header
 * @param  {boolean} [options.collapsible.collapsed] Initial collapsed state of a collapsible widget
 * @param  {number} [options.min] Minimal slider value, default to automatically computed from the result set
 * @param  {number} [options.max] Maximal slider value, defaults to automatically computed from the result set
 * @return {Object}
 */
const usage = `Usage:
rangeSlider({
  container,
  attributeName,
  [ tooltips=true ],
  [ templates.{header, footer} ],
  [ cssClasses.{root, header, body, footer} ],
  [ step=1 ],
  [ pips=true ],
  [ autoHideContainer=true ],
  [ collapsible=false ],
  [ min ],
  [ max ]
});
`;
function rangeSlider({
    container,
    attributeName,
    tooltips = true,
    templates = defaultTemplates,
    collapsible = false,
    cssClasses: userCssClasses = {},
    step = 1,
    pips = true,
    autoHideContainer = true,
    min: userMin,
    max: userMax
  } = {}) {
  if (!container || !attributeName) {
    throw new Error(usage);
  }

  let containerNode = getContainerNode(container);
  let Slider = headerFooterHOC(SliderComponent);
  if (autoHideContainer === true) {
    Slider = autoHideContainerHOC(Slider);
  }

  let cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    header: cx(bem('header'), userCssClasses.header),
    body: cx(bem('body'), userCssClasses.body),
    footer: cx(bem('footer'), userCssClasses.footer)
  };

  return {
    getConfiguration: (originalConf) => {
      const conf = {
        disjunctiveFacets: [attributeName]
      };

      if (
          (userMin !== undefined || userMax !== undefined)
          &&
          (!originalConf ||
          originalConf.numericRefinements &&
          originalConf.numericRefinements[attributeName] === undefined)
        ) {
        conf.numericRefinements = {[attributeName]: {}};

        if (userMin !== undefined) {
          conf.numericRefinements[attributeName]['>='] = [userMin];
        }

        if (userMax !== undefined) {
          conf.numericRefinements[attributeName]['<='] = [userMax];
        }
      }

      return conf;
    },
    _getCurrentRefinement(helper) {
      let min = helper.state.getNumericRefinement(attributeName, '>=');
      let max = helper.state.getNumericRefinement(attributeName, '<=');

      if (min && min.length) {
        min = min[0];
      } else {
        min = -Infinity;
      }

      if (max && max.length) {
        max = max[0];
      } else {
        max = Infinity;
      }

      return {
        min,
        max
      };
    },
    _refine(helper, oldValues, newValues) {
      helper.clearRefinements(attributeName);
      if (newValues[0] > oldValues.min) {
        helper.addNumericRefinement(attributeName, '>=', newValues[0]);
      }
      if (newValues[1] < oldValues.max) {
        helper.addNumericRefinement(attributeName, '<=', newValues[1]);
      }
      helper.search();
    },
    init({templatesConfig}) {
      this._templateProps = prepareTemplateProps({
        defaultTemplates,
        templatesConfig,
        templates
      });
    },
    render({results, helper}) {
      let facet = find(results.disjunctiveFacets, {name: attributeName});
      let stats;

      if (userMin !== undefined || userMax !== undefined) {
        stats = {};

        if (userMin !== undefined) {
          stats.min = userMin;
        }

        if (userMax !== undefined) {
          stats.max = userMax;
        }
      } else {
        stats = facet !== undefined && facet.stats !== undefined ? facet.stats : {
          min: null,
          max: null
        };
      }

      let currentRefinement = this._getCurrentRefinement(helper);

      if (tooltips.format !== undefined) {
        tooltips = [{to: tooltips.format}, {to: tooltips.format}];
      }

      ReactDOM.render(
        <Slider
          collapsible={collapsible}
          cssClasses={cssClasses}
          onChange={this._refine.bind(this, helper, stats)}
          pips={pips}
          range={{min: Math.floor(stats.min), max: Math.ceil(stats.max)}}
          shouldAutoHideContainer={stats.min === stats.max}
          start={[currentRefinement.min, currentRefinement.max]}
          step={step}
          templateProps={this._templateProps}
          tooltips={tooltips}
        />,
        containerNode
      );
    }
  };
}

export default rangeSlider;
