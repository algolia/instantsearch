import {omit} from 'lodash';

import createConnector from '../core/createConnector';

function getId() {
  return 'page';
}

function getCurrentRefinement(props, state) {
  const id = getId();
  let page = state[id];
  if (typeof page === 'undefined') {
    page = 1;
  } else if (typeof page === 'string') {
    page = parseInt(page, 10);
  }
  return page;
}

/**
 * connectPagination connector provides the logic to build a widget that will
 * let the user displays hits corresponding to a certain page.
 * @name connectPagination
 * @kind connector
 * @category connector
 * @propType {string} id - widget id, URL state serialization key. The state of this widget takes the shape of a `number`.
 * @propType {boolean} [showFirst=true] - Display the first page link.
 * @propType {boolean} [showLast=false] - Display the last page link.
 * @propType {boolean} [showPrevious=true] - Display the previous page link.
 * @propType {boolean} [showNext=true] - Display the next page link.
 * @propType {number} [pagesPadding=3] - How many page links to display around the current page.
 * @propType {number} [maxPages=Infinity] - Maximum number of pages to display.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding state
 * @providedPropType {number} nbPages - the total of existing pages
 * @providedPropType {number} currentRefinement - the page refinement currently applied
 */
export default createConnector({
  displayName: 'AlgoliaPagination',

  getProps(props, state, search) {
    if (!search.results) {
      return null;
    }
    return {
      nbPages: search.results.nbPages,
      currentRefinement: getCurrentRefinement(props, state),
    };
  },

  refine(props, state, nextPage) {
    const id = getId();
    return {
      ...state,
      [id]: nextPage,
    };
  },

  cleanUp(props, state) {
    return omit(state, getId());
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setPage(getCurrentRefinement(props, state) - 1);
  },

  transitionState(props, prevState, nextState) {
    const id = getId();
    if (nextState[id] && nextState[id].isSamePage) {
      return {
        ...nextState,
        [id]: prevState[id],
      };
    } else if (prevState[id] === nextState[id]) {
      return omit(nextState, id);
    }
    return nextState;
  },

  getMetadata() {
    const id = getId();
    return {
      id,
    };
  },
});
