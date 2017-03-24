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
  // }
});
search.addWidget(
  customClearAll({
    [excludeAttributes = []]
  });
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
 * @property {function} clearAll
 * @property {boolean} hasRefinements
 * @property {function} createURL
 * @property {InstantSearch} instantSearchInstance
 * @property {Object} widgetParams all original options forwarded to rendering
 */

/**
 * Connects a rendering with the clearAll business logic.
 * @function connectClearAll
 * @param {function(ClearAllRenderingOptions)} renderFn function that renders the clear all widget
 * @return {function(CustomClearAllWidgetOptions)} - a widget factory for a clear all widget
 */
export default function connectClearAll(renderFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {excludeAttributes = []} = widgetParams;

    return {
      init({helper, instantSearchInstance, createURL}) {
        const clearAttributes = getRefinements({}, helper.state)
        .map(one => one.attributeName)
        .filter(one => excludeAttributes.indexOf(one) === -1);
        const hasRefinements = clearAttributes.length !== 0;
        const preparedCreateURL = () => createURL(clearRefinementsFromState(helper.state));

        renderFn({
          clearAll: () => {},
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

        renderFn({
          clearAll: clearAll({helper, clearAttributes, hasRefinements}),
          hasRefinements,
          createURL: preparedCreateURL,
          instantSearchInstance,
          widgetParams,
        }, false);
      },
    };
  };
}
