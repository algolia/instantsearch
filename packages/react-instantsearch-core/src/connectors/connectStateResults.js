import createConnector from '../core/createConnector';
import { getResults } from '../core/indexUtils';

/**
 * The `connectStateResults` connector provides a way to access the `searchState` and the `searchResults`
 * of InstantSearch.
 * For instance this connector allows you to create results/noResults or query/noQuery pages.
 * @name connectStateResults
 * @kind connector
 * @providedPropType {object} searchState - The search state of the instant search component. <br/><br/> See: [Search state structure](https://community.algolia.com/react-instantsearch/guide/Search_state.html)
 * @providedPropType {object} searchResults - The search results. <br/><br/> In case of multiple indices: if used under `<Index>`, results will be those of the corresponding index otherwise it'll be those of the root index  See: [Search results structure](https://community.algolia.com/algoliasearch-helper-js/reference.html#searchresults)
 * @providedPropType {object} allSearchResults - In case of multiple indices you can retrieve all the results
 * @providedPropType {string} error - If the search failed, the error will be logged here.
 * @providedPropType {boolean} searching - If there is a search in progress.
 * @providedPropType {boolean} isSearchStalled - Flag that indicates if React InstantSearch has detected that searches are stalled.
 * @providedPropType {boolean} searchingForFacetValues - If there is a search in a list in progress.
 * @providedPropType {object} props - component props.
 * @example
 * import React from 'react';
 * import { InstantSearch, SearchBox, Hits, connectStateResults } from 'react-instantsearch-dom';
 *
 * const Content = connectStateResults(({ searchState, searchResults }) => {
 *   const hasResults = searchResults && searchResults.nbHits !== 0;
 *
 *    return (
 *      <div>
 *        <div hidden={!hasResults}>
 *          <Hits />
 *        </div>
 *        <div hidden={hasResults}>
 *          <div>No results has been found for {searchState.query}</div>
 *        </div>
 *      </div>
 *    );
 * });
 *
 * const App = () => (
 *   <InstantSearch
 *      appId="latency"
 *      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
 *      indexName="ikea"
 *    >
 *      <SearchBox />
 *      <Content />
 *    </InstantSearch>
 * );
 */
export default createConnector({
  displayName: 'AlgoliaStateResults',

  getProvidedProps(props, searchState, searchResults) {
    const results = getResults(searchResults, this.context);

    return {
      searchState,
      searchResults: results,
      allSearchResults: searchResults.results,
      searching: searchResults.searching,
      isSearchStalled: searchResults.isSearchStalled,
      error: searchResults.error,
      searchingForFacetValues: searchResults.searchingForFacetValues,
      props,
    };
  },
});
