import createConnector from '../core/createConnector';
import {getIndex} from '../core/indexUtils';

/**
 * connectHits connector provides the logic to create connected
 * components that will render the results retrieved from
 * Algolia.
 *
 * To configure the number of hits retrieved, use [HitsPerPage widget](widgets/HitsPerPage.html),
 * [connectHitsPerPage connector](connectors/connectHitsPerPage.html) or pass the hitsPerPage
 * prop to a [Configure](guide/Search_parameters.html) widget.
 * @name connectHits
 * @kind connector
 * @providedPropType {array.<object>} hits - the records that matched the search state
 */
export default createConnector({
  displayName: 'AlgoliaHits',

  getProvidedProps(props, searchState, searchResults) {
    const index = getIndex(this.context);
    const hits = searchResults.results && searchResults.results[index] ? searchResults.results[index].hits : [];

    return {hits};
  },

  /* Hits needs to be considered as a widget to trigger a search if no others widgets are used.
   * To be considered as a widget you need either getSearchParameters, getMetadata or getTransitionState
   * See createConnector.js
    * */
  getSearchParameters(searchParameters) {
    return searchParameters;
  },
});
