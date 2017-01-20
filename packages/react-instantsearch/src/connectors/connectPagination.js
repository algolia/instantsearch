import {omit} from 'lodash';

import createConnector from '../core/createConnector';

function getId() {
  return 'page';
}

function getCurrentRefinement(props, searchState) {
  const id = getId();
  let page = searchState[id];
  if (typeof page === 'undefined') {
    page = 1;
  } else if (typeof page === 'string') {
    page = parseInt(page, 10);
  }
  if (props.defaultRefinement) {
    return props.defaultRefinement;
  }
  return page;
}

/**
 * connectPagination connector provides the logic to build a widget that will
 * let the user displays hits corresponding to a certain page.
 * @name connectPagination
 * @kind connector
 * @propType {string} id - widget id, URL searchState serialization key. The searchState of this widget takes the shape of a `number`.
 * @propType {boolean} [showFirst=true] - Display the first page link.
 * @propType {boolean} [showLast=false] - Display the last page link.
 * @propType {boolean} [showPrevious=true] - Display the previous page link.
 * @propType {boolean} [showNext=true] - Display the next page link.
 * @propType {number} [pagesPadding=3] - How many page links to display around the current page.
 * @propType {number} [maxPages=Infinity] - Maximum number of pages to display.
 * @providedPropType {function} refine - a function to remove a single filter
 * @providedPropType {function} createURL - a function to generate a URL for the corresponding search state
 * @providedPropType {number} nbPages - the total of existing pages
 * @providedPropType {number} currentRefinement - the page refinement currently applied
 */
export default createConnector({
  displayName: 'AlgoliaPagination',

  getProvidedProps(props, searchState, searchResults) {
    if (!searchResults.results) {
      return null;
    }
    const nbPages = searchResults.results.nbPages;
    return {
      nbPages,
      currentRefinement: getCurrentRefinement(props, searchState),
      canRefine: nbPages > 1,
    };
  },

  refine(props, searchState, nextPage) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextPage,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setPage(getCurrentRefinement(props, searchState) - 1);
  },

  transitionState(props, prevSearchState, nextSearchState) {
    const id = getId();
    if (nextSearchState[id] && nextSearchState[id].isSamePage) {
      return {
        ...nextSearchState,
        [id]: prevSearchState[id],
      };
    } else if (prevSearchState[id] === nextSearchState[id]) {
      return omit(nextSearchState, id);
    }
    return nextSearchState;
  },

  getMetadata() {
    return {id: getId()};
  },
});
