import find from 'lodash/find';

import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customRangeSlider = connectRangeSlider(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   range,
  //   start,
  //   format,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customRangeSlider({
    attributeName,
    [ min ],
    [ max ],
    [ precision = 2 ],
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectRangeSlider.html
`;

/**
 * @typedef {Object} CustomRangeSliderWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting.
 * @property {number} [min = undefined] Minimal slider value, default to automatically computed from the result set.
 * @property {number} [max = undefined] Maximal slider value, default to automatically computed from the result set.
 * @property {number} [precision = 2] Number of digits after decimal point to use.
 */

/**
 * @typedef {Object} RangeSliderRenderingOptions
 * @property {function({min: number, max: number})} refine Sets a range to filter the results on. Both values
 * are optional, and will default to the higher and lower bounds.
 * @property {{min: number, max: number}} numeric Results bounds without the current range filter.
 * @property {Array<number, number>} start Current numeric bounds of the search.
 * @property {{from: function, to: function}} formatter Transform for the rendering `from` and/or `to` values.
 * Both functions take a `number` as input and should output a `string`.
 * @property {Object} widgetParams All original `CustomRangeSliderWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **RangeSlider** connector provides the logic to create custom widget that will let
 * the user refine results using a numeric range.
 *
 * Thic connectors provides a `refine()` function that accepts bounds. It will also provide
 * information about the min and max bounds for the current result set.
 * @type {Connector}
 * @param {function(RangeSliderRenderingOptions, boolean)} renderFn Rendering function for the custom **RangeSlider** widget.
 * @return {function(CustomRangeSliderWidgetOptions)} Re-usable widget factory for a custom **RangeSlider** widget.
 */
export default function connectRangeSlider(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      min: userMin,
      max: userMax,
      precision = 2,
    } = widgetParams;

    if (!attributeName) {
      throw new Error(usage);
    }

    const formatToNumber = v => Number(Number(v).toFixed(precision));

    const sliderFormatter = {
      from: v => v,
      to: v => formatToNumber(v).toLocaleString(),
    };

    return {
      _getCurrentRange: (bounds = {}, stats = {}) => {
        let min;
        if (bounds.min !== undefined && bounds.min !== null) {
          min = bounds.min;
        } else if (stats.min !== undefined && stats.min !== null) {
          min = stats.min;
        } else {
          min = 0;
        }

        let max;
        if (bounds.max !== undefined && bounds.max !== null) {
          max = bounds.max;
        } else if (stats.max !== undefined && stats.max !== null) {
          max = stats.max;
        } else {
          max = 0;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      getConfiguration: originalConf => {
        const conf = {
          disjunctiveFacets: [attributeName],
        };

        const hasUserBounds = userMin !== undefined || userMax !== undefined;
        const boundsAlreadyDefined =
          originalConf &&
          originalConf.numericRefinements &&
          originalConf.numericRefinements[attributeName] !== undefined;

        if (hasUserBounds && !boundsAlreadyDefined) {
          conf.numericRefinements = { [attributeName]: {} };
          if (userMin !== undefined)
            conf.numericRefinements[attributeName]['>='] = [userMin];
          if (userMax !== undefined)
            conf.numericRefinements[attributeName]['<='] = [userMax];
        }

        return conf;
      },

      _getCurrentRefinement(helper, stats = {}) {
        const minValues = helper.state.getNumericRefinement(
          attributeName,
          '>='
        );

        const maxValues = helper.state.getNumericRefinement(
          attributeName,
          '<='
        );

        let min;
        if (minValues && minValues.length) {
          min = minValues[0];
        } else if (stats.min !== undefined && stats.min !== null) {
          min = stats.min;
        } else {
          min = -Infinity;
        }

        let max;
        if (maxValues && maxValues.length) {
          max = maxValues[0];
        } else if (stats.max !== undefined && stats.max !== null) {
          max = stats.max;
        } else {
          max = Infinity;
        }

        return {
          min: Math.floor(min),
          max: Math.ceil(max),
        };
      },

      init({ helper, instantSearchInstance }) {
        this._refine = bounds => newValues => {
          const currentValues = [
            helper.getNumericRefinement(attributeName, '>='),
            helper.getNumericRefinement(attributeName, '<='),
          ];

          if (
            currentValues[0] !== newValues[0] ||
            currentValues[1] !== newValues[1]
          ) {
            helper.clearRefinements(attributeName);

            const hasMin = bounds.min !== null && bounds.min !== undefined;
            const minValueChanged =
              newValues[0] !== null && newValues[0] !== undefined;

            if (
              (hasMin && minValueChanged && bounds.min < newValues[0]) ||
              (!hasMin && minValueChanged)
            ) {
              helper.addNumericRefinement(
                attributeName,
                '>=',
                formatToNumber(newValues[0])
              );
            }

            const hasMax = bounds.max !== null && bounds.max !== undefined;
            const maxValueChanged =
              newValues[1] !== null && newValues[1] !== undefined;

            if (
              (hasMax && maxValueChanged && bounds.max > newValues[1]) ||
              (!hasMax && maxValueChanged)
            ) {
              helper.addNumericRefinement(
                attributeName,
                '<=',
                formatToNumber(newValues[1])
              );
            }
            helper.search();
          }
        };

        const bounds = { min: userMin, max: userMax };
        const stats = {};
        const currentRange = this._getCurrentRange(bounds, stats);
        const currentRefinement = this._getCurrentRefinement(helper, stats);

        renderFn(
          {
            refine: this._refine(bounds),
            range: currentRange,
            start: [currentRefinement.min, currentRefinement.max],
            format: sliderFormatter,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const bounds = { min: userMin, max: userMax };
        const facetsFromResults = results.disjunctiveFacets || [];
        const facet = find(facetsFromResults, _ => _.name === attributeName);
        const stats = facet && facet.stats;

        const currentRange = this._getCurrentRange(bounds, stats);
        const currentRefinement = this._getCurrentRefinement(helper, stats);

        renderFn(
          {
            refine: this._refine(bounds),
            range: currentRange,
            start: [currentRefinement.min, currentRefinement.max],
            format: sliderFormatter,
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },
    };
  };
}
