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
    attribute,
    options,
    [ operator = '=' ],
    [ transformItems ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectNumericSelector.html
`;

/**
 * @typedef {Object} NumericSelectorOption
 * @property {number} value The numerical value to refine with.
 * If the value is `undefined` or `"undefined"`, the option resets the filter.
 * @property {string} label Label to display in the option.
 */

/**
 * @typedef {Object} CustomNumericSelectorWidgetOptions
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {NumericSelectorOption[]} options Array of objects defining the different values and labels.
 * @property {string} [operator = '＝'] The operator to use to refine. Supports following operators: <, <=, =, >, >= and !=.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
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
 *     attribute: 'popularity',
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
    const {
      attribute,
      options,
      operator = '=',
      transformItems = items => items,
    } = widgetParams;

    if (!attribute || !options) {
      throw new Error(usage);
    }

    return {
      getConfiguration(currentSearchParameters, searchParametersFromUrl) {
        const value = this._getRefinedValue(searchParametersFromUrl);
        if (value) {
          return {
            numericRefinements: {
              [attribute]: {
                [operator]: [value],
              },
            },
          };
        }
        return {};
      },

      init({ helper, instantSearchInstance }) {
        this._refine = value => {
          helper.clearRefinements(attribute);
          if (value !== undefined && value !== 'undefined') {
            helper.addNumericRefinement(attribute, operator, value);
          }
          helper.search();
        };

        renderFn(
          {
            currentRefinement: this._getRefinedValue(helper.state),
            options: transformItems(options),
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
            options: transformItems(options),
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
        return state.removeNumericRefinement(attribute);
      },

      getWidgetState(uiState, { searchParameters }) {
        const currentRefinement = this._getRefinedValue(searchParameters);
        if (
          // Does the current state contain the current refinement?
          (uiState.numericSelector &&
            currentRefinement === uiState.numericSelector[attribute]) ||
          // Is the current value the first option / default value?
          currentRefinement === options[0].value
        ) {
          return uiState;
        }

        if (currentRefinement || currentRefinement === 0)
          return {
            ...uiState,
            numericSelector: {
              ...uiState.numericSelector,
              [attribute]: currentRefinement,
            },
          };
        return uiState;
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const value =
          uiState.numericSelector && uiState.numericSelector[attribute];
        const currentlyRefinedValue = this._getRefinedValue(searchParameters);

        if (value) {
          if (value === currentlyRefinedValue) return searchParameters;
          return searchParameters
            .clearRefinements(attribute)
            .addNumericRefinement(attribute, operator, value);
        }

        const firstItemValue = options[0] && options[0].value;
        if (typeof firstItemValue === 'number') {
          return searchParameters
            .clearRefinements(attribute)
            .addNumericRefinement(attribute, operator, options[0].value);
        }

        return searchParameters;
      },

      _getRefinedValue(state) {
        // This is reimplementing state.getNumericRefinement
        // But searchParametersFromUrl is not an actual SearchParameters object
        // It's only the object structure without the methods, because getStateFromQueryString
        // is not sending a SearchParameters. There's no way given how we built the helper
        // to initialize a true partial state where only the refinements are present
        return state &&
          state.numericRefinements &&
          state.numericRefinements[attribute] !== undefined &&
          state.numericRefinements[attribute][operator] !== undefined &&
          state.numericRefinements[attribute][operator][0] !== undefined // could be 0
          ? state.numericRefinements[attribute][operator][0]
          : options[0].value;
      },
    };
  };
}
