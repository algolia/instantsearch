import {
  checkRendering,
  escapeRefinement,
  unescapeRefinement,
} from '../../lib/utils.js';

import find from 'lodash/find';

const usage = `Usage:
var customToggle = connectToggle(function render(params, isFirstRendering) {
  // params = {
  //   value,
  //   createURL,
  //   refine,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customToggle({
    attributeName,
    label,
    [ values = {on: true, off: undefined} ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectToggle.html
`;

/**
 * @typedef {Object} ToggleValue
 * @property {string} name Human-readable name of the filter.
 * @property {boolean} isRefined `true` if the toggle is on.
 * @property {number} count Number of results matched after applying the toggle refinement.
 * @property {Object} onFacetValue Value of the toggle when it's on.
 * @property {Object} offFacetValue Value of the toggle when it's off.
 */

/**
 * @typedef {Object} CustomToggleWidgetOptions
 * @property {string} attributeName Name of the attribute for faceting (eg. "free_shipping").
 * @property {string} label Human-readable name of the filter (eg. "Free Shipping").
 * @property {Object} [values = {on: true, off: undefined}] Values to filter on when toggling.
 */

/**
 * @typedef {Object} ToggleRenderingOptions
 * @property {ToggleValue} value The current toggle value.
 * @property {function(): string} createURL Creates an URL for the next state.
 * @property {function(value)} refine Updates to the next state by applying the toggle refinement.
 * @property {Object} widgetParams All original `CustomToggleWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **Toggle** connector provides the logic to build a custom widget that will provide
 * an on/off filtering feature based on an attribute value or values.
 *
 * Two modes are implemented in the custom widget:
 *  - with or without the value filtered
 *  - switch between two values.
 *
 * @type {Connector}
 * @param {function(ToggleRenderingOptions, boolean)} renderFn Rendering function for the custom **Toggle** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomToggleWidgetOptions)} Re-usable widget factory for a custom **Toggle** widget.
 * @example
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(ToggleRenderingOptions, isFirstRendering) {
 *   ToggleRenderingOptions.widgetParams.containerNode
 *     .find('a')
 *     .off('click');
 *
 *   var buttonHTML = `
 *     <a href="${ToggleRenderingOptions.createURL()}">
 *       <input
 *         type="checkbox"
 *         value="${ToggleRenderingOptions.value.name}"
 *         ${ToggleRenderingOptions.value.isRefined ? 'checked' : ''}
 *       />
 *       ${ToggleRenderingOptions.value.name} (${ToggleRenderingOptions.value.count})
 *     </a>
 *   `;
 *
 *   ToggleRenderingOptions.widgetParams.containerNode.html(buttonHTML);
 *   ToggleRenderingOptions.widgetParams.containerNode
 *     .find('a')
 *     .on('click', function(event) {
 *       event.preventDefault();
 *       event.stopPropagation();
 *
 *       ToggleRenderingOptions.refine(ToggleRenderingOptions.value);
 *     });
 * }
 *
 * // connect `renderFn` to Toggle logic
 * var customToggle = instantsearch.connectors.connectToggle(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customToggle({
 *     containerNode: $('#custom-toggle-container'),
 *     attributeName: 'free_shipping',
 *     label: 'Free Shipping (toggle single value)',
 *   })
 * );
 */
export default function connectToggle(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      attributeName,
      label,
      values: userValues = { on: true, off: undefined },
    } = widgetParams;

    if (!attributeName || !label) {
      throw new Error(usage);
    }

    const hasAnOffValue = userValues.off !== undefined;
    const on = userValues ? escapeRefinement(userValues.on) : undefined;
    const off = userValues ? escapeRefinement(userValues.off) : undefined;

    return {
      getConfiguration() {
        return {
          disjunctiveFacets: [attributeName],
        };
      },

      _toggleRefinement(helper, { isRefined } = {}) {
        // Checking
        if (!isRefined) {
          if (hasAnOffValue) {
            helper.removeDisjunctiveFacetRefinement(attributeName, off);
          }
          helper.addDisjunctiveFacetRefinement(attributeName, on);
        } else {
          // Unchecking
          helper.removeDisjunctiveFacetRefinement(attributeName, on);
          if (hasAnOffValue) {
            helper.addDisjunctiveFacetRefinement(attributeName, off);
          }
        }

        helper.search();
      },

      init({ state, helper, createURL, instantSearchInstance }) {
        this._createURL = isCurrentlyRefined => () =>
          createURL(
            state
              .removeDisjunctiveFacetRefinement(
                attributeName,
                isCurrentlyRefined ? on : off
              )
              .addDisjunctiveFacetRefinement(
                attributeName,
                isCurrentlyRefined ? off : on
              )
          );

        this.toggleRefinement = opts => {
          this._toggleRefinement(helper, opts);
        };

        const isRefined = state.isDisjunctiveFacetRefined(attributeName, on);

        // no need to refine anything at init if no custom off values
        if (hasAnOffValue) {
          // Add filtering on the 'off' value if set
          if (!isRefined) {
            const currentPage = helper.getPage();
            helper
              .addDisjunctiveFacetRefinement(attributeName, off)
              .setPage(currentPage);
          }
        }

        const onFacetValue = {
          name: label,
          isRefined,
          count: 0,
        };

        const offFacetValue = {
          name: label,
          isRefined: hasAnOffValue && !isRefined,
          count: 0,
        };

        const value = {
          name: label,
          isRefined,
          count: null,
          onFacetValue,
          offFacetValue,
        };

        renderFn(
          {
            value,
            createURL: this._createURL(value.isRefined),
            refine: this.toggleRefinement,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ helper, results, state, instantSearchInstance }) {
        const isRefined = helper.state.isDisjunctiveFacetRefined(
          attributeName,
          on
        );
        const offValue = off === undefined ? false : off;
        const allFacetValues = results.getFacetValues(attributeName);

        const onData = find(
          allFacetValues,
          ({ name }) => name === unescapeRefinement(on)
        );
        const onFacetValue = {
          name: label,
          isRefined: onData !== undefined ? onData.isRefined : false,
          count: onData === undefined ? null : onData.count,
        };

        const offData = hasAnOffValue
          ? find(
              allFacetValues,
              ({ name }) => name === unescapeRefinement(offValue)
            )
          : undefined;
        const offFacetValue = {
          name: label,
          isRefined: offData !== undefined ? offData.isRefined : false,
          count:
            offData === undefined
              ? allFacetValues.reduce((total, { count }) => total + count, 0)
              : offData.count,
        };

        // what will we show by default,
        // if checkbox is not checked, show: [ ] free shipping (countWhenChecked)
        // if checkbox is checked, show: [x] free shipping (countWhenNotChecked)
        const nextRefinement = isRefined ? offFacetValue : onFacetValue;

        const value = {
          name: label,
          isRefined,
          count: nextRefinement === undefined ? null : nextRefinement.count,
          onFacetValue,
          offFacetValue,
        };

        renderFn(
          {
            value,
            state,
            createURL: this._createURL(value.isRefined),
            refine: this.toggleRefinement,
            helper,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        const nextState = state
          .removeDisjunctiveFacetRefinement(attributeName)
          .removeDisjunctiveFacet(attributeName);

        return nextState;
      },

      getWidgetState(uiState, { searchParameters }) {
        const isRefined = searchParameters.isDisjunctiveFacetRefined(
          attributeName,
          on
        );

        if (
          !isRefined ||
          (uiState &&
            uiState.toggle &&
            uiState.toggle[attributeName] === isRefined)
        ) {
          return uiState;
        }

        return {
          ...uiState,
          toggle: {
            ...uiState.toggle,
            [attributeName]: isRefined,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const isRefined = Boolean(
          uiState.toggle && uiState.toggle[attributeName]
        );

        if (isRefined) {
          if (hasAnOffValue)
            return searchParameters
              .removeDisjunctiveFacetRefinement(attributeName, off)
              .addDisjunctiveFacetRefinement(attributeName, on);

          return searchParameters.addDisjunctiveFacetRefinement(
            attributeName,
            on
          );
        }

        if (hasAnOffValue)
          return searchParameters
            .removeDisjunctiveFacetRefinement(attributeName, on)
            .addDisjunctiveFacetRefinement(attributeName, off);

        return searchParameters.removeDisjunctiveFacetRefinement(
          attributeName,
          on
        );
      },
    };
  };
}
