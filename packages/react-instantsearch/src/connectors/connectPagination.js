import {PropTypes} from 'react';
import {omit} from 'lodash';

import createConnector from '../core/createConnector';

function getCurrentRefinement(props, state) {
  let page = state[props.id];
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

  propTypes: {
    id: PropTypes.string,
  },

  defaultProps: {
    id: 'p',
  },

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
    return {
      ...state,
      [props.id]: nextPage,
    };
  },

  getSearchParameters(searchParameters, props, state) {
    return searchParameters.setPage(getCurrentRefinement(props, state) - 1);
  },

  transitionState(props, prevState, nextState) {
    if (nextState[props.id] && nextState[props.id].isSamePage) {
      return {
        ...nextState,
        [props.id]: prevState[props.id],
      };
    } else if (prevState[props.id] === nextState[props.id]) {
      return omit(nextState, props.id);
    }
    return nextState;
  },

  getMetadata(props) {
    return {
      id: props.id,
    };
  },
});
