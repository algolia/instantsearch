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
        filters: on.map(value => `${attribute}:${value}`),
      },
      attribute,
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
 * @typedef {Object} CustomToggleWidgetParams
 * @property {string} attribute Name of the attribute for faceting (eg. "free_shipping").
 * @property {Object} [on = true] Value to filter on when toggled.
 * @property {Object} [off] Value to filter on when not toggled.
 */

/**
 * @typedef {Object} ToggleRenderingOptions
 * @property {ToggleValue} value The current toggle value.
 * @property {function():string} createURL Creates an URL for the next state.
 * @property {boolean} canRefine Indicates if search state can be refined.
 * @property {function(value)} refine Updates to the next state by applying the toggle refinement.
 * @property {Object} widgetParams All original `CustomToggleWidgetParams` forwarded to the `renderFn`.
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
 * @return {function(CustomToggleWidgetParams)} Re-usable widget factory for a custom **Toggle** widget.
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

    const toggleRefinementFactory = helper => ({ isRefined } = {}) => {
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
        on.forEach(v => helper.removeDisjunctiveFacetRefinement(attribute, v));

        if (hasAnOffValue) {
          off.forEach(v => helper.addDisjunctiveFacetRefinement(attribute, v));
        }
      }

      helper.search();
    };

    const connectorState = {
      createURLFactory: (isRefined, { state, createURL }) => () => {
        state = state.resetPage();

        const valuesToRemove = isRefined ? on : off;
        if (valuesToRemove) {
          valuesToRemove.forEach(v => {
            state = state.removeDisjunctiveFacetRefinement(attribute, v);
          });
        }

        const valuesToAdd = isRefined ? off : on;
        if (valuesToAdd) {
          valuesToAdd.forEach(v => {
            state = state.addDisjunctiveFacetRefinement(attribute, v);
          });
        }

        return createURL(state);
      },
    };

    return {
      $$type,

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.removeDisjunctiveFacet(attribute);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          toggleRefinement: {
            ...renderState.toggleRefinement,
            [attribute]: this.getWidgetRenderState(renderOptions),
          },
        };
      },

      getWidgetRenderState({
        state,
        helper,
        results,
        createURL,
        instantSearchInstance,
      }) {
        const isRefined = results
          ? on?.every(v => helper.state.isDisjunctiveFacetRefined(attribute, v))
          : on?.every(v => state.isDisjunctiveFacetRefined(attribute, v));

        let onFacetValue = {
          isRefined,
          count: 0,
        };

        let offFacetValue = {
          isRefined: hasAnOffValue && !isRefined,
          count: 0,
        };

        if (results) {
          const offValue = toArray(off || false);
          const allFacetValues = results.getFacetValues(attribute) || [];

          const onData = on
            ?.map(v =>
              find(allFacetValues, ({ name }) => name === unescapeRefinement(v))
            )
            .filter(v => v !== undefined);

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

          onFacetValue = {
            isRefined: onData.length ? onData.every(v => v.isRefined) : false,
            count: onData.reduce((acc, v) => acc + v.count, 0) || null,
          };

          offFacetValue = {
            isRefined: offData.length ? offData.every(v => v.isRefined) : false,
            count:
              offData.reduce((acc, v) => acc + v.count, 0) ||
              allFacetValues.reduce((total, { count }) => total + count, 0),
          };
        } else if (hasAnOffValue && !isRefined) {
          if (off) {
            off.forEach(v =>
              helper.addDisjunctiveFacetRefinement(attribute, v)
            );
          }

          helper.setPage(helper.state.page);
        }

        if (!sendEvent) {
          sendEvent = createSendEvent({
            instantSearchInstance,
            attribute,
            on,
            helper,
          });
        }
        const nextRefinement = isRefined ? offFacetValue : onFacetValue;

        return {
          value: {
            name: attribute,
            isRefined,
            count: results ? nextRefinement.count : null,
            onFacetValue,
            offFacetValue,
          },
          createURL: connectorState.createURLFactory(isRefined, {
            state,
            createURL,
          }),
          sendEvent,
          canRefine: Boolean(results ? nextRefinement.count : null),
          refine: toggleRefinementFactory(helper),
          widgetParams,
        };
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
