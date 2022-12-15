import type { Connector } from '../types/connector';

import { createConnector } from 'react-instantsearch-dom';

export type ProvidedProps = {
  // TODO: fill props that are returned by `getProvidedProps`
}

export const connect: Connector<ProvidedProps> = createConnector<ProvidedProps>({
  displayName: '',
  $$type: '',

  getProvidedProps(props, searchState, searchResults) {
    return {
      // TODO: return a props for the component
    };
  },

  refine(props, searchState, nextRefinement) {
    return {
      // TODO: return a next searchState
    };
  },

  cleanUp(props, searchState) {
    return {
      // TODO: return a searchState where this widget is removed from the widget tree
    };
  },

  getSearchParameters(searchParameters, props, searchState) {
    // TODO: update and return the searchParameters
    return searchParameters;
  },
});
