import type { ConnectedProps } from '../core/createConnector';
import createConnector from '../core/createConnector';
import {
  refineValue,
  getCurrentRefinementValue,
  getResults,
} from '../core/indexUtils';

function getId() {
  return 'relevancyStrictness';
}

function getCurrentRefinement(
  props: ConnectedProps<any>,
  searchState,
  context
) {
  const id = getId();
  const currentRefinement = getCurrentRefinementValue(
    props,
    searchState,
    context,
    id
  );

  return currentRefinement;
}

export default createConnector({
  displayName: 'AlgoliaRelevantSort',

  getProvidedProps(props, _searchState, searchResults) {
    const results = getResults(searchResults, {
      ais: props.contextValue,
      multiIndexContext: props.indexContextValue,
    });

    if (!results) {
      return {
        isVirtualReplica: false,
        isRelevantSorted: false,
      };
    }

    return {
      isVirtualReplica: results.appliedRelevancyStrictness !== undefined,
      isRelevantSorted:
        results.appliedRelevancyStrictness !== undefined &&
        results.appliedRelevancyStrictness > 0,
    };
  },

  getSearchParameters(searchParameters, props, searchState) {
    return searchParameters.setQueryParameter(
      'relevancyStrictness',
      getCurrentRefinement(props, searchState, {
        ais: props.contextValue,
        multiIndexContext: props.indexContextValue,
      })
    );
  },

  refine(props, searchState, nextRefinement) {
    const nextValue = {
      [getId()]: nextRefinement,
    };
    const resetPage = true;

    return refineValue(
      searchState,
      nextValue,
      { ais: props.contextValue, multiIndexContext: props.indexContextValue },
      resetPage
    );
  },
});
