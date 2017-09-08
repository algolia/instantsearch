import {
  checkRendering,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch,
} from '../../lib/utils.js';

const usage = `Usage:
var customClearAll = connectClearAll(function render(params, isFirstRendering) {
  // params = {
  //   refine,
  //   hasRefinements,
  //   createURL,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customClearAll({
    [ excludeAttributes = [] ],
    [ clearsQuery = false ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectClearAll.html
`;

const refine = ({
  helper,
  clearAttributes,
  hasRefinements,
  clearsQuery,
}) => () => {
  if (hasRefinements) {
    clearRefinementsAndSearch(helper, clearAttributes, clearsQuery);
  }
};

/**
 * @typedef {Object} CustomClearAllWidgetOptions
 * @property {string[]} [excludeAttributes = []] Every attributes that should not be removed when calling `refine()`.
 * @property {boolean} [clearsQuery = false] If `true`, `refine()` also clears the current search query.
 */

/**
 * @typedef {Object} ClearAllRenderingOptions
 * @property {function} refine Triggers the clear of all the currently refined values.
 * @property {boolean} hasRefinements Indicates if search state is refined.
 * @property {function} createURL Creates a url for the next state when refinements are cleared.
 * @property {Object} widgetParams All original `CustomClearAllWidgetOptions` forwarded to the `renderFn`.
 */

/**
 * **ClearAll** connector provides the logic to build a custom widget that will give the user
 * the ability to reset the search state.
 *
 * This connector provides a `refine` function to remove the current refined facets.
 *
 * The behaviour of this function can be changed with widget options. If `clearsQuery`
 * is set to `true`, `refine` will also clear the query and `excludeAttributes` can
 * prevent certain attributes from being cleared.
 *
 * @type {Connector}
 * @param {function(ClearAllRenderingOptions, boolean)} renderFn Rendering function for the custom **ClearAll** widget.
 * @return {function(CustomClearAllWidgetOptions)} Re-usable widget factory for a custom **ClearAll** widget.
 * @example
 * // custom `renderFn` to render the custom ClearAll widget
 * function renderFn(ClearAllRenderingOptions, isFirstRendering) {
 *   var containerNode = ClearAllRenderingOptions.widgetParams.containerNode;
 *   if (isFirstRendering) {
 *     var markup = $('<button id="custom-clear-all">Clear All</button>');
 *     containerNode.append(markup);
 *
 *     markup.on('click', function(event) {
 *       event.preventDefault();
 *       ClearAllRenderingOptions.refine();
 *     })
 *   }
 *
 *   var clearAllCTA = containerNode.find('#custom-clear-all');
 *   clearAllCTA.attr('disabled', !ClearAllRenderingOptions.hasRefinements)
 * };
 *
 * // connect `renderFn` to ClearAll logic
 * var customClearAllWidget = instantsearch.connectors.connectClearAll(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customClearAllWidget({
 *     containerNode: $('#custom-clear-all-container'),
 *   })
 * );
 */
export default function connectClearAll(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const { excludeAttributes = [], clearsQuery = false } = widgetParams;

    return {
      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      _refine() {},
      _cachedRefine() {
        this._refine();
      },

      init({ helper, instantSearchInstance, createURL }) {
        this._cachedRefine = this._cachedRefine.bind(this);

        const clearAttributes = getRefinements({}, helper.state)
          .map(one => one.attributeName)
          .filter(one => excludeAttributes.indexOf(one) === -1);

        const hasRefinements = clearsQuery
          ? clearAttributes.length !== 0 || helper.state.query !== ''
          : clearAttributes.length !== 0;
        const preparedCreateURL = () =>
          createURL(clearRefinementsFromState(helper.state, [], clearsQuery));

        this._refine = refine({
          helper,
          clearAttributes,
          hasRefinements,
          clearsQuery,
        });

        renderFn(
          {
            refine: this._cachedRefine,
            hasRefinements,
            createURL: preparedCreateURL,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, createURL, helper, instantSearchInstance }) {
        const clearAttributes = getRefinements(results, state)
          .map(one => one.attributeName)
          .filter(one => excludeAttributes.indexOf(one) === -1);

        const hasRefinements = clearsQuery
          ? clearAttributes.length !== 0 || helper.state.query !== ''
          : clearAttributes.length !== 0;
        const preparedCreateURL = () =>
          createURL(clearRefinementsFromState(state, [], clearsQuery));

        this._refine = refine({
          helper,
          clearAttributes,
          hasRefinements,
          clearsQuery,
        });

        renderFn(
          {
            refine: this._cachedRefine,
            hasRefinements,
            createURL: preparedCreateURL,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },
    };
  };
}
