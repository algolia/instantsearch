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
 * @param {string[]} excludeAttributes - all the attributes that should not be displayed
 * @param {boolean} [clearsQuery = false] also clears the active search query
 */

/**
 * @typedef {Object} ClearAllRenderingOptions
 * @property {function} refine function to trigger the clear of all the currently refined values
 * @property {boolean} hasRefinements boolean to indicate if search state is refined
 * @property {function} createURL function that create a url for the next state
 * @property {InstantSearch} instantSearchInstance the instance of instantsearch on which the widget is attached
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering with the clearAll business logic.
 * @function connectClearAll
 * @param {function(ClearAllRenderingOptions, boolean)} renderFn function that renders the clear all widget
 * @return {function(CustomClearAllWidgetOptions)} - a widget factory for a clear all widget
 */
export default function connectClearAll(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {excludeAttributes = [], clearsQuery = false} = widgetParams;

    return {
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
