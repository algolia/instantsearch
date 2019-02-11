import find from 'lodash/find';
import {
  checkRendering,
  escapeRefinement,
  unescapeRefinement,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator('toggle-refinement', {
  connector: true,
});

/**
 * @typedef {Object} ToggleValue
 * @property {boolean} isRefined `true` if the toggle is on.
 * @property {number} count Number of results matched after applying the toggle refinement.
 * @property {Object} onFacetValue Value of the toggle when it's on.
 * @property {Object} offFacetValue Value of the toggle when it's off.
 */

/**
 * @typedef {Object} CustomToggleWidgetOptions
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {Object} [on = true] Value to filter on when toggled.
 * @property {Object} [off] Value to filter on when not toggled.
 */

/**
 * @typedef {Object} ToggleRenderingOptions
 * @property {ToggleValue} value The current toggle value.
 * @property {function():string} createURL Creates an URL for the next state.
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
 * var customToggle = instantsearch.connectors.connectToggleRefinement(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customToggle({
 *     containerNode: $('#custom-toggle-container'),
 *     attribute: 'free_shipping',
 *   })
 * );
 */
export default function connectToggleRefinement(renderFn, unmountFn) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { attribute, on: userOn = true, off: userOff } = widgetParams;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    const hasAnOffValue = userOff !== undefined;
    const on = userOn ? escapeRefinement(userOn) : undefined;
    const off = userOff ? escapeRefinement(userOff) : undefined;

    return {
      getConfiguration() {
        return {
          disjunctiveFacets: [attribute],
        };
      },

      _toggleRefinement(helper, { isRefined } = {}) {
        // Checking
        if (!isRefined) {
          if (hasAnOffValue) {
            helper.removeDisjunctiveFacetRefinement(attribute, off);
          }
          helper.addDisjunctiveFacetRefinement(attribute, on);
        } else {
          // Unchecking
          helper.removeDisjunctiveFacetRefinement(attribute, on);
          if (hasAnOffValue) {
            helper.addDisjunctiveFacetRefinement(attribute, off);
          }
        }

        helper.search();
      },

      init({ state, helper, createURL, instantSearchInstance }) {
        this._createURL = isCurrentlyRefined => () =>
          createURL(
            state
              .removeDisjunctiveFacetRefinement(
                attribute,
                isCurrentlyRefined ? on : off
              )
              .addDisjunctiveFacetRefinement(
                attribute,
                isCurrentlyRefined ? off : on
              )
          );

        this.toggleRefinement = opts => {
          this._toggleRefinement(helper, opts);
        };

        const isRefined = state.isDisjunctiveFacetRefined(attribute, on);

        // no need to refine anything at init if no custom off values
        if (hasAnOffValue) {
          // Add filtering on the 'off' value if set
          if (!isRefined) {
            const currentPage = helper.getPage();
            helper
              .addDisjunctiveFacetRefinement(attribute, off)
              .setPage(currentPage);
          }
        }

        const onFacetValue = {
          isRefined,
          count: 0,
        };

        const offFacetValue = {
          isRefined: hasAnOffValue && !isRefined,
          count: 0,
        };

        const value = {
          name: attribute,
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
        const isRefined = helper.state.isDisjunctiveFacetRefined(attribute, on);
        const offValue = off === undefined ? false : off;
        const allFacetValues = results.getFacetValues(attribute);

        const onData = find(
          allFacetValues,
          ({ name }) => name === unescapeRefinement(on)
        );
        const onFacetValue = {
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
          name: attribute,
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
          .removeDisjunctiveFacetRefinement(attribute)
          .removeDisjunctiveFacet(attribute);

        return nextState;
      },

      getWidgetState(uiState, { searchParameters }) {
        const isRefined = searchParameters.isDisjunctiveFacetRefined(
          attribute,
          on
        );

        if (
          !isRefined ||
          (uiState && uiState.toggle && uiState.toggle[attribute] === isRefined)
        ) {
          return uiState;
        }

        return {
          ...uiState,
          toggle: {
            ...uiState.toggle,
            [attribute]: isRefined,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const isRefined = Boolean(uiState.toggle && uiState.toggle[attribute]);

        if (isRefined) {
          if (hasAnOffValue)
            return searchParameters
              .removeDisjunctiveFacetRefinement(attribute, off)
              .addDisjunctiveFacetRefinement(attribute, on);

          return searchParameters.addDisjunctiveFacetRefinement(attribute, on);
        }

        if (hasAnOffValue)
          return searchParameters
            .removeDisjunctiveFacetRefinement(attribute, on)
            .addDisjunctiveFacetRefinement(attribute, off);

        return searchParameters.removeDisjunctiveFacetRefinement(attribute, on);
      },
    };
  };
}
