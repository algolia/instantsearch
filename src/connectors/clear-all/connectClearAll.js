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

const refine = ({helper, clearAttributes, hasRefinements, clearsQuery}) => () => {
  if (hasRefinements) {
    clearRefinementsAndSearch(helper, clearAttributes, clearsQuery);
  }
};

/**
 * @typedef {Object} CustomClearAllWidgetOptions
 * @property {string[]} excludeAttributes Every attributes that should not be removed on `refine()`
 * @property {boolean = false} clearsQuery Should also clears the active search query
 */

/**
 * @typedef {Object} ClearAllRenderingOptions
 * @property {function} refine Trigger the clear of all the currently refined values
 * @property {boolean} hasRefinements Indicate if search state is refined
 * @property {function} createURL Create a url for the next state when refinements are cleared
 * @property {InstantSearch} instantSearchInstance Instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams All original options forwarded to `renderFn`
 */

/**
 * Connects business logic to clear all refinements to your rendering function (custom ClearAll CTA widget).
 * @type {Connector}
 * @param {function(ClearAllRenderingOptions, boolean)} renderFn Rendering function for the clear all widget
 * @return {function(CustomClearAllWidgetOptions)} Re-usable widget factory for a clear all custom widget
 */
export default function connectClearAll(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {excludeAttributes = [], clearsQuery = false} = widgetParams;

    return {
      // Provide the same function to the `renderFn` so that way the user
      // has to only bind it once when `isFirstRendering` for instance
      _refine() {},
      _cachedRefine() { this._refine(); },

      init({helper, instantSearchInstance, createURL}) {
        this._cachedRefine = this._cachedRefine.bind(this);

        const clearAttributes = getRefinements({}, helper.state)
          .map(one => one.attributeName)
          .filter(one => excludeAttributes.indexOf(one) === -1);

        const hasRefinements = clearAttributes.length !== 0;
        const preparedCreateURL = () => createURL(clearRefinementsFromState(helper.state, [], clearsQuery));

        this._refine = refine({helper, clearAttributes, hasRefinements, clearsQuery});

        renderFn({
          refine: this._cachedRefine,
          hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance,
          widgetParams,
        }, true);
      },

      render({results, state, createURL, helper, instantSearchInstance}) {
        const clearAttributes = getRefinements(results, state)
          .map(one => one.attributeName)
          .filter(one => excludeAttributes.indexOf(one) === -1);

        const hasRefinements = clearAttributes.length !== 0;
        const preparedCreateURL = () => createURL(clearRefinementsFromState(state, [], clearsQuery));

        this._refine = refine({helper, clearAttributes, hasRefinements, clearsQuery});

        renderFn({
          refine: this._cachedRefine,
          hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
