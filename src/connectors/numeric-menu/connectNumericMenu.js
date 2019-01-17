import _isFinite from 'lodash/isFinite';

import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customNumericMenu = connectNumericMenu(function renderFn(params, isFirstRendering) {
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
  customNumericMenu({
    attribute,
    items,
    [ transformItems ],
  })
);

Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectNumericMenu.html
`;

/**
 * @typedef {Object} NumericMenuOption
 * @property {string} name Name of the option.
 * @property {number} start Lower bound of the option (>=).
 * @property {number} end Higher bound of the option (<=).
 */

/**
 * @typedef {Object} NumericMenuItem
 * @property {string} label Name of the option.
 * @property {string} value URL encoded of the bounds object with the form `{start, end}`. This value can be used verbatim in the webpage and can be read by `refine` directly. If you want to inspect the value, you can do `JSON.parse(window.decodeURI(value))` to get the object.
 * @property {boolean} isRefined True if the value is selected.
 */

/**
 * @typedef {Object} CustomNumericMenuWidgetOptions
 * @property {string} attribute Name of the attribute for filtering.
 * @property {NumericMenuOption[]} items List of all the items.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} NumericMenuRenderingOptions
 * @property {function(item.value): string} createURL Creates URLs for the next state, the string is the name of the selected option.
 * @property {NumericMenuItem[]} items The list of available choices.
 * @property {boolean} hasNoResults `true` if the last search contains no result.
 * @property {function(item.value)} refine Sets the selected value and trigger a new search.
 * @property {Object} widgetParams All original `CustomNumericMenuWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **NumericMenu** connector provides the logic to build a custom widget that will give the user the ability to choose a range on to refine the search results.
 *
 * It provides a `refine(item)` function to refine on the selected range.
 *
 * **Requirement:** the attribute passed as `attribute` must be present in "attributes for faceting" on the Algolia dashboard or configured as attributesForFaceting via a set settings call to the Algolia API.
 * @function connectNumericMenu
 * @type {Connector}
 * @param {function(NumericMenuRenderingOptions, boolean)} renderFn Rendering function for the custom **NumericMenu** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomNumericMenuWidgetOptions)} Re-usable widget factory for a custom **NumericMenu** widget.
 * @example
 * // custom `renderFn` to render the custom NumericMenu widget
 * function renderFn(NumericMenuRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     NumericMenuRenderingOptions.widgetParams.containerNode.html('<ul></ul>');
 *   }
 *
 *   NumericMenuRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() { $(this).off('click'); });
 *
 *   var list = NumericMenuRenderingOptions.items.map(function(item) {
 *     return '<li data-refine-value="' + item.value + '">' +
 *       '<input type="radio"' + (item.isRefined ? ' checked' : '') + '/> ' +
 *       item.label + '</li>';
 *   });
 *
 *   NumericMenuRenderingOptions.widgetParams.containerNode.find('ul').html(list);
 *   NumericMenuRenderingOptions.widgetParams.containerNode
 *     .find('li[data-refine-value]')
 *     .each(function() {
 *       $(this).on('click', function(event) {
 *         event.preventDefault();
 *         event.stopPropagation();
 *         NumericMenuRenderingOptions.refine($(this).data('refine-value'));
 *       });
 *     });
 * }
 *
 * // connect `renderFn` to NumericMenu logic
 * var customNumericMenu = instantsearch.connectors.connectNumericMenu(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customNumericMenu({
 *     containerNode: $('#custom-numeric-menu-container'),
 *     attribute: 'price',
 *     items: [
 *       {name: 'All'},
 *       {end: 4, name: 'less than 4'},
 *       {start: 4, end: 4, name: '4'},
 *       {start: 5, end: 10, name: 'between 5 and 10'},
 *       {start: 10, name: 'more than 10'},
 *     ],
 *   })
 * );
 */
export default function connectNumericMenu(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { attribute, items, transformItems = x => x } = widgetParams;

    if (!attribute || !items) {
      throw new Error(usage);
    }

    return {
      init({ helper, createURL, instantSearchInstance }) {
        this._refine = facetValue => {
          const refinedState = refine(
            helper.state,
            attribute,
            items,
            facetValue
          );
          helper.setState(refinedState).search();
        };

        this._createURL = state => facetValue =>
          createURL(refine(state, attribute, items, facetValue));
        this._prepareItems = state =>
          items.map(({ start, end, label }) => ({
            label,
            value: window.encodeURI(JSON.stringify({ start, end })),
            isRefined: isRefined(state, attribute, { start, end }),
          }));

        renderFn(
          {
            createURL: this._createURL(helper.state),
            items: transformItems(this._prepareItems(helper.state)),
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
            items: transformItems(this._prepareItems(state)),
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
        return state.clearRefinements(attribute);
      },

      getWidgetState(uiState, { searchParameters }) {
        const currentRefinements = searchParameters.getNumericRefinements(
          attribute
        );
        const equal = currentRefinements['='] && currentRefinements['='][0];
        if (equal || equal === 0) {
          return {
            ...uiState,
            numericMenu: {
              ...uiState.numericMenu,
              [attribute]: `${currentRefinements['=']}`,
            },
          };
        }

        const lowerBound =
          (currentRefinements['>='] && currentRefinements['>='][0]) || '';
        const upperBound =
          (currentRefinements['<='] && currentRefinements['<='][0]) || '';

        if (lowerBound !== '' || upperBound !== '') {
          if (
            uiState.numericMenu &&
            uiState.numericMenu[attribute] === `${lowerBound}:${upperBound}`
          )
            return uiState;
          return {
            ...uiState,
            numericMenu: {
              ...uiState.numericMenu,
              [attribute]: `${lowerBound}:${upperBound}`,
            },
          };
        }

        return uiState;
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        let clearedParams = searchParameters.clearRefinements(attribute);
        const value = uiState.numericMenu && uiState.numericMenu[attribute];

        if (!value) {
          return clearedParams;
        }

        const valueAsEqual = value.indexOf(':') === -1 && value;

        if (valueAsEqual) {
          return clearedParams.addNumericRefinement(
            attribute,
            '=',
            valueAsEqual
          );
        }

        const [lowerBound, upperBound] = value.split(':').map(parseFloat);

        if (_isFinite(lowerBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attribute,
            '>=',
            lowerBound
          );
        }

        if (_isFinite(upperBound)) {
          clearedParams = clearedParams.addNumericRefinement(
            attribute,
            '<=',
            upperBound
          );
        }

        return clearedParams;
      },
    };
  };
}

function isRefined(state, attribute, option) {
  const currentRefinements = state.getNumericRefinements(attribute);

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

function refine(state, attribute, items, facetValue) {
  let resolvedState = state;

  const refinedOption = JSON.parse(window.decodeURI(facetValue));

  const currentRefinements = resolvedState.getNumericRefinements(attribute);

  if (refinedOption.start === undefined && refinedOption.end === undefined) {
    return resolvedState.clearRefinements(attribute);
  }

  if (!isRefined(resolvedState, attribute, refinedOption)) {
    resolvedState = resolvedState.clearRefinements(attribute);
  }

  if (refinedOption.start !== undefined && refinedOption.end !== undefined) {
    if (refinedOption.start > refinedOption.end) {
      throw new Error('option.start should be > to option.end');
    }

    if (refinedOption.start === refinedOption.end) {
      if (hasNumericRefinement(currentRefinements, '=', refinedOption.start)) {
        resolvedState = resolvedState.removeNumericRefinement(
          attribute,
          '=',
          refinedOption.start
        );
      } else {
        resolvedState = resolvedState.addNumericRefinement(
          attribute,
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
        attribute,
        '>=',
        refinedOption.start
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attribute,
        '>=',
        refinedOption.start
      );
    }
  }

  if (refinedOption.end !== undefined) {
    if (hasNumericRefinement(currentRefinements, '<=', refinedOption.end)) {
      resolvedState = resolvedState.removeNumericRefinement(
        attribute,
        '<=',
        refinedOption.end
      );
    } else {
      resolvedState = resolvedState.addNumericRefinement(
        attribute,
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

  return hasOperatorRefinements && currentRefinements[operator].includes(value);
}
