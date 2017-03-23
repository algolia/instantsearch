import {
  getRefinements,
  clearRefinementsFromState,
  clearRefinementsAndSearch,
} from '../../lib/utils.js';

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
 */

/**
 * Connects a rendering with the clearAll business logic.
 * @function connectClearAll
 * @param {function(ClearAllRenderingOptions)} renderClearAll - function that renders the clear all widget
 * @return {function(CustomClearAllWidgetOptions)} - a widget factory for a clear all widget
 */
const connectClearAll = renderClearAll => ({
    excludeAttributes = [],
  } = {}) => ({
    init({helper, instantSearchInstance, createURL}) {
      const clearAttributes = getRefinements({}, helper.state)
        .map(one => one.attributeName)
        .filter(one => excludeAttributes.indexOf(one) === -1);
      const hasRefinements = clearAttributes.length !== 0;
      const preparedCreateURL = () => createURL(clearRefinementsFromState(helper.state));

      renderClearAll({
        clearAll: () => {},
        hasRefinements,
        createURL: preparedCreateURL,
        instantSearchInstance,
      }, true);
    },

    render({results, state, createURL, helper, instantSearchInstance}) {
      const clearAttributes = getRefinements(results, state)
        .map(one => one.attributeName)
        .filter(one => excludeAttributes.indexOf(one) === -1);
      const hasRefinements = clearAttributes.length !== 0;
      const preparedCreateURL = () => createURL(clearRefinementsFromState(state));

      renderClearAll({
        clearAll: clearAll({helper, clearAttributes, hasRefinements}),
        hasRefinements,
        createURL: preparedCreateURL,
        instantSearchInstance,
      }, false);
    },
  });

export default connectClearAll;
