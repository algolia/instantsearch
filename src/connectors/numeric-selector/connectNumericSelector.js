import {checkRendering} from '../../lib/utils.js';

const usage = `Usage:
var customNumericSelector = connectNumericSelector(function renderFn(params, isFirstRendering) {
  // params = {
  //   currentValue,
  //   options,
  //   setValue,
  //   hasNoResults,
  //   instantSearchInstance,
  // }
});
search.addWidget(
  customNumericSelector({
    attributeName,
    options,
    [ operator = '=' ]
  });
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectNumericSelector.html
`;

/**
 * @typedef {Object} CustomNumericSelectorWidgetOptions
 * @param {string} attributeName Name of the attribute for faceting (eg. "free_shipping")
 * @param  {Array} options Array of objects defining the different values and labels
 * @param  {number} options[i].value The numerical value to refine with
 * @param  {string} options[i].label Label to display in the option
 * @param  {string} [ operator='=' ] The operator to use to refine
 */

/**
 * @typedef {Object} NumericSelectorRenderingOptions
 * @property {string} currentValue
 * @property {{ value: string, label: string }[]} options
 * @property {function} setValue
 * @property {boolean} hasNoResults
 * @property {InstantSearch} instantSearchInstance
 * @property {Object} widgetParams all original options forwarded to rendering
 */

 /**
  * Connects a rendering function with the numeric selector business logic.
  * @param {function(NumericSelectorRenderingOptions)} renderFn function that renders the numeric selector widget
  * @return {function(CustomNumericSelectorWidgetOptions)} a widget factory for numeric selector widget
  */
export default function connectNumericSelector(renderFn) {
  checkRendering(renderFn, usage);

  return widgetParams => {
    const {
      attributeName,
      options,
      operator = '=',
    } = widgetParams;

    if (!attributeName || !options) {
      throw new Error(usage);
    }

    return {
      getConfiguration(currentSearchParameters, searchParametersFromUrl) {
        return {
          numericRefinements: {
            [attributeName]: {
              [operator]: [this._getRefinedValue(searchParametersFromUrl)],
            },
          },
        };
      },

      init({helper, instantSearchInstance}) {
        this._refine = value => {
          helper.clearRefinements(attributeName);
          if (value !== undefined) {
            helper.addNumericRefinement(attributeName, operator, value);
          }
          helper.search();
        };

        renderFn({
          currentValue: this._getRefinedValue(helper.state),
          options,
          setValue: this._refine,
          hasNoResults: true,
          instantSearchInstance,
          widgetParams,
        }, true);
      },

      render({helper, results, instantSearchInstance}) {
        renderFn({
          currentValue: this._getRefinedValue(helper.state),
          options,
          setValue: this._refine,
          hasNoResults: results.nbHits === 0,
          instantSearchInstance,
          widgetParams,
        }, false);
      },

      _getRefinedValue(state) {
        // This is reimplementing state.getNumericRefinement
        // But searchParametersFromUrl is not an actual SearchParameters object
        // It's only the object structure without the methods, because getStateFromQueryString
        // is not sending a SearchParameters. There's no way given how we built the helper
        // to initialize a true partial state where only the refinements are present
        return state &&
          state.numericRefinements &&
          state.numericRefinements[attributeName] !== undefined &&
          state.numericRefinements[attributeName][operator] !== undefined &&
          state.numericRefinements[attributeName][operator][0] !== undefined ? // could be 0
          state.numericRefinements[attributeName][operator][0] :
          options[0].value;
      },
    };
  };
}
