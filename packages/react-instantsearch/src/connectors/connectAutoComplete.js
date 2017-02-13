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
 * parameter to the [searchParameters](guide/Search_parameters.html) prop on `<InstantSearch/>`.
 * @name connectAutoComplete
 * @kind connector
 * @providedPropType {array.<object>} hits - the records that matched the search state
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
    return {hits, query: getCurrentRefinement(props, searchState)};
  },

  refine(props, searchState, nextQuery) {
    const id = getId();
    return {
      ...searchState,
      [id]: nextQuery,
    };
  },

  cleanUp(props, searchState) {
    return omit(searchState, getId());
  },

  /* Hits needs to be considered as a widget to trigger a search if no others widgets are used.
   * To be considered as a widget you need either getSearchParameters, getMetadata or getTransitionState
   * See createConnector.js
    * */
  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQuery(getCurrentRefinement(props, searchState));
  },
});
