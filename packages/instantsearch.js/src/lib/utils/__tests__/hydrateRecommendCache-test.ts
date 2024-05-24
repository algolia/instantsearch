import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import algoliaSearchHelper from 'algoliasearch-helper';

import { hydrateRecommendCache } from '../hydrateRecommendCache';

describe('hydrateRecommendCache', () => {
  it('should hydrate the helper with the recommend cache', () => {
    const helper = algoliaSearchHelper(createSearchClient(), '');

    const response0 = createSingleSearchResponse();
    const response1 = createSingleSearchResponse();

    hydrateRecommendCache(helper, {
      a: {
        recommendResults: {
          params: [{ $$id: 0, objectID: '1' }],
          results: { 0: response0 },
        },
      },
      b: {
        recommendResults: {
          params: [{ $$id: 1, objectID: '2' }],
          results: { 1: response1 },
        },
      },
    });

    expect(helper._recommendCache).toEqual({
      0: response0,
      1: response1,
    });
  });
});
