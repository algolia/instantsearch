import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customNumericSelector = connectNumericSelector(function renderFn(params, isFirstRendering) {
  // params = {
  //   currentRefinement,
  //   options,
  //   refine,
  //   hasNoResults,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customNumericSelector({
    attributeName,
    options,
    [ operator = '=' ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectNumericSelector.html
`;

/**
 * @typedef {Object} NumericSelectorOption
 * @property {number} value The numerical value to refine with.
 * If the value is `undefined` or `"undefined"`, the option resets the filter.
 * @property {string} label Label to display in the option.
 */

/**
 * @typedef {Object} CustomNumericSelectorWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping").
 * @property {NumericSelectorOption[]} options Array of objects defining the different values and labels.
 * @property {string} [operator = '＝'] The operator to use to refine. Supports following operators: <, <=, =, >, >= and !=.
 */

/**
 * @typedef {Object} NumericSelectorRenderingOptions
 * @property {string} currentRefinement The currently selected value.
 * @property {NumericSelectorOption[]} options The different values and labels of the selector.
 * @property {function(option.value)} refine Updates the results with the selected value.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {Object} widgetParams All original `CustomNumericSelectorWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **NumericSelector** connector provides the logic to build a custom widget that will let the
 * user filter the results based on a list of numerical filters.
 *
 * It provides a `refine(value)` function to trigger a new search with selected option.
 * @type {Connector}
 * @param {function(NumericSelectorRenderingOptions, boolean)} renderFn Rendering function for the custom **NumericSelector** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomNumericSelectorWidgetOptions)} Re-usable widget factory for a custom **NumericSelector** widget.
 * @example
 * // custom `renderFn` to render the custom NumericSelector widget
 * function renderFn(NumericSelectorRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     NumericSelectorRenderingOptions.widgetParams.containerNode.html('<select></select>');
 *     NumericSelectorRenderingOptions.widgetParams.containerNode
 *       .find('select')
 *       .on('change', function(event) {
 *         NumericSelectorRenderingOptions.refine(event.target.value);
 *       })
 *   }
 *
 *   var optionsHTML = NumericSelectorRenderingOptions.options.map(function(option) {
 *     return '<option value="' + option.value + '"' +
 *       (NumericSelectorRenderingOptions.currentRefinement === option.value ? ' selected' : '') + '>' +
 *       option.label + '</option>';
 *   });
 *
 *   NumericSelectorRenderingOptions.widgetParams.containerNode
 *     .find('select')
 *     .html(optionsHTML);
 * }
 *
 * // connect `renderFn` to NumericSelector logic
 * var customNumericSelector = instantsearch.connectors.connectNumericSelector(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customNumericSelector({
 *     containerNode: $('#custom-numeric-selector-container'),
 *     operator: '>=',
 *     attributeName: 'popularity',
 *     options: [
 *       {label: 'Default', value: 0},
 *       {label: 'Top 10', value: 9991},
 *       {label: 'Top 100', value: 9901},
 *       {label: 'Top 500', value: 9501},
 *     ],
 *   })
 * );
 */
export default function connectNumericSelector(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { attributeName, options, operator = '=' } = widgetParams;

    if (!attributeName || !options) {
      throw new Error(usage);
    }

    return {
      getConfiguration(currentSearchParameters, searchParametersFromUrl) {
        const value = this._getRefinedValue(searchParametersFromUrl);
        if (value) {
          return {
            numericRefinements: {
              [attributeName]: {
                [operator]: [value],
              },
            },
          };
        }
        return {};
      },

      init({ helper, instantSearchInstance }) {
        this._refine = value => {
          helper.clearRefinements(attributeName);
          if (value !== undefined && value !== 'undefined') {
            helper.addNumericRefinement(attributeName, operator, value);
          }
          helper.search();
        };

        renderFn(
          {
            currentRefinement: this._getRefinedValue(helper.state),
            options,
            refine: this._refine,
            hasNoResults: true,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ helper, results, instantSearchInstance }) {
        renderFn(
          {
            currentRefinement: this._getRefinedValue(helper.state),
            options,
            refine: this._refine,
            hasNoResults: results.nbHits === 0,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();
        return state.removeNumericRefinement(attributeName);
      },

      getWidgetState(fullState, { state }) {
        const currentRefinement = this._getRefinedValue(state);
        if (currentRefinement || currentRefinement === 0)
          return {
            ...fullState,
            numericSelector: {
              ...fullState.numericSelector,
              [attributeName]: currentRefinement,
            },
          };
        return fullState;
      },

      getWidgetSearchParameters(searchParam, { uiState }) {
        const value =
          uiState.numericSelector && uiState.numericSelector[attributeName];
        const clearedSearchParam = searchParam.clearRefinements(attributeName);
        if (value)
          return clearedSearchParam.addNumericRefinement(
            attributeName,
            operator,
            value
          );

        return clearedSearchParam;
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
          state.numericRefinements[attributeName][operator][0] !== undefined // could be 0
          ? state.numericRefinements[attributeName][operator][0]
          : options[0].value;
      },
    };
  };
}
