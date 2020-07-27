import {
  checkRendering,
  escapeRefinement,
  unescapeRefinement,
  createDocumentationMessageGenerator,
  find,
  noop,
  toArray,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'toggle-refinement',
  connector: true,
});

const $$type = 'ais.toggleRefinement';

const createSendEvent = ({ instantSearchInstance, attribute, on, helper }) => (
  ...args
) => {
  if (args.length === 1) {
    instantSearchInstance.sendEventToInsights(args[0]);
    return;
  }
  const [eventType, isRefined, eventName = 'Filter Applied'] = args;
  if (eventType !== 'click' || on === undefined) {
    return;
  }
  // Checking
  if (!isRefined) {
    instantSearchInstance.sendEventToInsights({
      insightsMethod: 'clickedFilters',
      widgetType: $$type,
      eventType,
      payload: {
        eventName,
        index: helper.getIndex(),
        filters: on.map(value => `${attribute}:${JSON.stringify(value)}`),
      },
    });
  }
};

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
 * search.addWidgets([
 *   customToggle({
 *     containerNode: $('#custom-toggle-container'),
 *     attribute: 'free_shipping',
 *   })
 * ]);
 */
export default function connectToggleRefinement(renderFn, unmountFn = noop) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const { attribute, on: userOn = true, off: userOff } = widgetParams;

    if (!attribute) {
      throw new Error(withUsage('The `attribute` option is required.'));
    }

    const hasAnOffValue = userOff !== undefined;
    const hasAnOnValue = userOn !== undefined;
    const on = hasAnOnValue ? toArray(userOn).map(escapeRefinement) : undefined;
    const off = hasAnOffValue
      ? toArray(userOff).map(escapeRefinement)
      : undefined;

    let sendEvent;

    return {
      $$type,

      _toggleRefinement(helper, { isRefined } = {}) {
        // Checking
        if (!isRefined) {
          sendEvent('click', isRefined);
          if (hasAnOffValue) {
            off.forEach(v =>
              helper.removeDisjunctiveFacetRefinement(attribute, v)
            );
          }

          on.forEach(v => helper.addDisjunctiveFacetRefinement(attribute, v));
        } else {
          // Unchecking
          on.forEach(v =>
            helper.removeDisjunctiveFacetRefinement(attribute, v)
          );

          if (hasAnOffValue) {
            off.forEach(v =>
              helper.addDisjunctiveFacetRefinement(attribute, v)
            );
          }
        }

        helper.search();
      },

      init({ state, helper, createURL, instantSearchInstance }) {
        sendEvent = createSendEvent({
          instantSearchInstance,
          attribute,
          on,
          helper,
        });

        this._createURL = isCurrentlyRefined => () => {
          const valuesToRemove = isCurrentlyRefined ? on : off;
          if (valuesToRemove) {
            valuesToRemove.forEach(v => {
              state.removeDisjunctiveFacetRefinement(attribute, v);
            });
          }

          const valuesToAdd = isCurrentlyRefined ? off : on;
          if (valuesToAdd) {
            valuesToAdd.forEach(v => {
              state.addDisjunctiveFacetRefinement(attribute, v);
            });
          }

          return createURL(state);
        };

        this.toggleRefinement = opts => {
          this._toggleRefinement(helper, opts);
        };

        const isRefined =
          on && on.every(v => state.isDisjunctiveFacetRefined(attribute, v));

        // no need to refine anything at init if no custom off values
        if (hasAnOffValue) {
          // Add filtering on the 'off' value if set
          if (!isRefined) {
            const currentPage = helper.state.page;
            if (off) {
              off.forEach(v =>
                helper.addDisjunctiveFacetRefinement(attribute, v)
              );
            }

            helper.setPage(currentPage);
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
            sendEvent,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ helper, results, state, instantSearchInstance }) {
        const isRefined =
          on &&
          on.every(v => helper.state.isDisjunctiveFacetRefined(attribute, v));
        const offValue = toArray(off === undefined ? false : off);
        const allFacetValues = results.getFacetValues(attribute) || [];

        const onData =
          on &&
          on
            .map(v =>
              find(allFacetValues, ({ name }) => name === unescapeRefinement(v))
            )
            .filter(v => v !== undefined);
        const onFacetValue = {
          isRefined: onData.length > 0 ? onData.every(v => v.isRefined) : false,
          count:
            onData.length === 0
              ? null
              : onData.reduce((acc, v) => acc + v.count, 0),
        };

        const offData = hasAnOffValue
          ? offValue
              .map(v =>
                find(
                  allFacetValues,
                  ({ name }) => name === unescapeRefinement(v)
                )
              )
              .filter(v => v !== undefined)
          : [];
        const offFacetValue = {
          isRefined:
            offData.length > 0 ? offData.every(v => v.isRefined) : false,
          count:
            offData.length === 0
              ? allFacetValues.reduce((total, { count }) => total + count, 0)
              : offData.reduce((acc, v) => acc + v.count, 0),
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
            sendEvent,
            helper,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.removeDisjunctiveFacet(attribute);
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const isRefined =
          on &&
          on.every(v =>
            searchParameters.isDisjunctiveFacetRefined(attribute, v)
          );

        if (!isRefined) {
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
        let withFacetConfiguration = searchParameters
          .clearRefinements(attribute)
          .addDisjunctiveFacet(attribute);

        const isRefined = Boolean(uiState.toggle && uiState.toggle[attribute]);

        if (isRefined) {
          if (on) {
            on.forEach(v => {
              withFacetConfiguration = withFacetConfiguration.addDisjunctiveFacetRefinement(
                attribute,
                v
              );
            });
          }

          return withFacetConfiguration;
        }

        // It's not refined with an `off` value
        if (hasAnOffValue) {
          if (off) {
            off.forEach(v => {
              withFacetConfiguration = withFacetConfiguration.addDisjunctiveFacetRefinement(
                attribute,
                v
              );
            });
          }
          return withFacetConfiguration;
        }

        // It's not refined without an `off` value
        return withFacetConfiguration.setQueryParameters({
          disjunctiveFacetsRefinements: {
            ...searchParameters.disjunctiveFacetsRefinements,
            [attribute]: [],
          },
        });
      },
    };
  };
}
