import createConnector from '../core/createConnector';
import {omit} from 'lodash';

const getId = () => 'query';

function getCurrentRefinement(props, searchState) {
  const id = getId();
  if (typeof searchState[id] !== 'undefined') {
    return searchState[id];
  }
  if (typeof props.defaultRefinement !== 'undefined') {
    return props.defaultRefinement;
  }
  return '';
}

/**
 * connectAutoComplete connector provides the logic to create connected
 * components that will render the results retrieved from
 * Algolia.
 *
 * To configure the number of hits retrieved, use [HitsPerPage widget](widgets/HitsPerPage.html),
 * [connectHitsPerPage connector](connectors/connectHitsPerPage.html) or pass the hitsPerPage
 * prop to a [Configure](guide/Search_parameters.html) widget.
 * @name connectAutoComplete
 * @kind connector
 * @providedPropType {array.<object>} hits - the records that matched the search state.
 * @providedPropType {function} refine - a function to change the query.
 * @providedPropType {string} currentRefinement - the query to search for.
 */
export default createConnector({
  displayName: 'AlgoliaAutoComplete',

  getProvidedProps(props, searchState, searchResults) {
    const hits = [];
    if (searchResults.results) {
      Object.keys(searchResults.results).forEach(index => {
        hits.push({index, hits: searchResults.results[index].hits});
      });
    }
    return {hits, currentRefinement: getCurrentRefinement(props, searchState)};
  },

  refine(props, searchState, nextCurrentRefinement) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextCurrentRefinement,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  /* connectAutoComplete needs to be considered as a widget to trigger a search if no others widgets are used.
   * To be considered as a widget you need either getSearchParameters, getMetadata or getTransitionState
   * See createConnector.js
    * */
  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQuery(getCurrentRefinement(props, searchState));
  },
});
