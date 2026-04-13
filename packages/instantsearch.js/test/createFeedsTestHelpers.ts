import { createSingleSearchResponse } from '@instantsearch/mocks';
import { SearchParameters, SearchResults } from 'algoliasearch-helper';

import { createInstantSearch } from './createInstantSearch';
import { index } from '../src/widgets';

import type { IndexWidget } from '../src/types';

export function createResultsWithFeeds(
  feedIDs: string[],
  state?: SearchParameters
): SearchResults {
  const searchState = state || new SearchParameters({ index: 'test' });
  const response = createSingleSearchResponse();

  const results = new SearchResults(searchState, [response]);
  (results as any).feeds = feedIDs.map((feedID) => {
    const feedResponse = createSingleSearchResponse({
      hits: [{ objectID: `hit-${feedID}` }],
      nbHits: 1,
    });
    const feedResults = new SearchResults(searchState, [feedResponse]);
    (feedResults as any).feedID = feedID;
    return feedResults;
  });

  return results;
}

export function createParentWithHelper(
  instantSearchInstance: ReturnType<typeof createInstantSearch>
): IndexWidget {
  const parent = index({ indexName: 'test' });
  parent.getHelper = () => instantSearchInstance.helper!;
  return parent;
}
