import {
  checkRendering,
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch,
} from '../../lib/utils.js';

const usage = `Usage:
var customClearAll = connectClearAll(function render(params, isFirstRendering) {
  // params = {
  //   clearAll,
  //   hasRefinements,
  //   createURL,
  //   instantSearchInstance,
  //   widgetParams,
  // }
});
search.addWidget(
  customClearAll({
    [ excludeAttributes = [] ]
  })
);
Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectClearAll.html
`;

const clearAll = ({helper, clearAttributes, hasRefinements}) => () => {
  if (hasRefinements) {
    clearRefinementsAndSearch(helper, clearAttributes);
  }
};

/**
 * @typedef {Object} CustomClearAllWidgetOptions
 * @param {string[]} excludeAttributes - all the attributes that should not be displayed
 */

/**
 * @typedef {Object} ClearAllRenderingOptions
 * @property {function} clearAll function to trigger the clear of all the currently refined values
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
    const {excludeAttributes = []} = widgetParams;

    return {
      _clearAll() {},
      _cachedClearAll() { this._clearAll(); },

      init({helper, instantSearchInstance, createURL}) {
        this._cachedClearAll = this._cachedClearAll.bind(this);

        const clearAttributes = getRefinements({}, helper.state)
          .map(one => one.attributeName)
          .filter(one => excludeAttributes.indexOf(one) === -1);

        const hasRefinements = clearAttributes.length !== 0;
        const preparedCreateURL = () => createURL(clearRefinementsFromState(helper.state));

        renderFn({
          clearAll: this._cachedClearAll,
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
        const preparedCreateURL = () => createURL(clearRefinementsFromState(state));

        this._clearAll = clearAll({helper, clearAttributes, hasRefinements});

        renderFn({
          clearAll: this._cachedClearAll,
          hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
