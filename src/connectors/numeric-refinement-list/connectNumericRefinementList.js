import includes from 'lodash/includes';

import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customNumericRefinementList = connectNumericRefinementList(function renderFn(params, isFirstRendering) {
  // params = {
  //   createURL,
  //   items,
  //   hasNoResults,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  //  }
});
search.addWidget(
  customNumericRefinementList({
    attributeName,
    options,
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectNumericRefinementList.html
`;

/**
 * @typedef {Object} NumericRefinementListOption
 * @property {string} name Name of the option.
 * @property {number} start Lower bound of the option (>=).
 * @property {number} end Higher bound of the option (<=).
 */

/**
 * @typedef {Object} NumericRefinementListItem
 * @property {string} label Name of the option.
 * @property {number} start Lower bound of the option (>=).
 * @property {number} end Higher bound of the option (<=).
 * @property {boolean} isRefined True if the value is selected.
 */

/**
 * @typedef {Object} CustomNumericRefinementListWidgetOptions
 * @property {string} attributeName Name of the attribute for filtering.
 * @property {NumericRefinementListOption[]} options List of all the options.
 */

/**
 * @typedef {Object} NumericRefinementListRenderingOptions
 * @property {function(item.value): string} createURL Creates URLs for the next state, the string is the name of the selected option.
 * @property {NumericRefinementListItem[]} items The list of available choices.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {function(item.value)} refine Sets the selected value and trigger a new search.
 * @property {Object} widgetParams All original `CustomNumericRefinementListWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **NumericRefinementList** connector provides the logic to build a custom widget that will give the user the ability to choose a range on to refine the search results.
 *
 * It provides a `refine(item)` function to refine on the selected range.
 *
 * **Requirement:** the attribute passed as `attributeName` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 * @function connectNumericRefinementList
 * @type {Connector}
 * @param {function(NumericRefinementListRenderingOptions, boolean)} renderFn Rendering function for the custom **NumericRefinementList** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomNumericRefinementListWidgetOptions)} Re-usable widget factory for a custom **NumericRefinementList** widget.
 * @example
 * // custom `renderFn` to render the custom NumericRefinementList widget
 * function renderFn(NumericRefinementListRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     NumericRefinementListRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() { $(this).off('click'); });
 *
 *   var list = NumericRefinementListRenderingOptions.items.map(function(item) {
 *     return '<li data-refine-value="' + item.value + '">' +
 *       '<input type="radio"' + (item.isRefined ? ' checked' : '') + '/> ' +
 *       item.label + '</li>';
 *   });
 *
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode.find('ul').html(list);
 *   NumericRefinementListRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *         event.stopPropagation();
 *         NumericRefinementListRenderingOptions.refine($(this).data('refine-value'));
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to NumericRefinementList logic
 * var customNumericRefinementList = instantsearch.connectors.connectNumericRefinementList(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customNumericRefinementList({
 *     containerNode: $('#custom-numeric-refinement-container'),
 *     attributeName: 'price',
 *     options: [
 *       {name: 'All'},
 *       {end: 4, name: 'less than 4'},
 *       {start: 4, end: 4, name: '4'},
 *       {start: 5, end: 10, name: 'between 5 and 10'},
 *       {start: 10, name: 'more than 10'},
 *     ],
 *   })
 * );
 */
export default function connectNumericRefinementList(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { attributeName, options } = widgetParams;

    if (!attributeName || !options) {
      throw new Error(usage);
    }

    return {
      init({ helper, createURL, instantSearchInstance }) {
        this._refine = facetValue => {
          const refinedState = refine(
            helper.state,
            attributeName,
            options,
            facetValue
          );
          helper.setState(refinedState).search();
        };

        this._createURL = state => facetValue =>
          createURL(refine(state, attributeName, options, facetValue));
        this._prepareItems = state =>
          options.map(({ start, end, name: label }) => ({
            label,
            value: window.encodeURI(JSON.stringify({ start, end })),
            isRefined: isRefined(state, attributeName, { start, end }),
          }));

        renderFn(
          {
            createURL: this._createURL(helper.state),
            items: this._prepareItems(helper.state),
            hasNoResults: true,
            refine: this._refine,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        renderFn(
          {
            createURL: this._createURL(state),
            items: this._prepareItems(state),
            hasNoResults: results.nbHits === 0,
            refine: this._refine,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();
        return state.clearRefinements(attributeName);
      },
    };
  };
}

function isRefined(state, attributeName, option) {
  const currentRefinements = state.getNumericRefinements(attributeName);

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

  return undefined;
}

function refine(state, attributeName, options, facetValue) {
  let resolvedState = state;

  const refinedOption = JSON.parse(window.decodeURI(facetValue));

  const currentRefinements = resolvedState.getNumericRefinements(attributeName);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.clearRefinements(attributeName);
  }

  if (!isRefined(resolvedState, attributeName, refinedOption)) {
    resolvedState = resolvedState.clearRefinements(attributeName);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(
          attributeName,
          '=',
          refinedOption.start
        );
      } else {
        resolvedState = resolvedState.addNumericRefinement(
          attributeName,
          '=',
          refinedOption.start
        );
      }
      return resolvedState;
    }
  }

  if (refinedOption.start !== undefined) {
    if (hasNumericRefinement(currentRefinements, '>=', refinedOption.start)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attributeName,
        '>=',
        refinedOption.start
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attributeName,
        '>=',
        refinedOption.start
      );
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attributeName,
        '<=',
        refinedOption.end
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attributeName,
        '<=',
        refinedOption.end
      );
    }
  }

  resolvedState.page = 0;

  return resolvedState;
}

function hasNumericRefinement(currentRefinements, operator, value) {
  const hasOperatorRefinements = currentRefinements[operator] !== undefined;
  const includesValue = includes(currentRefinements[operator], value);

  return hasOperatorRefinements && includesValue;
}
