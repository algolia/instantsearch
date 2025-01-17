import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils';
import algoliaSearchHelper from 'algoliasearch-helper';

import { hydrateRecommendCache } from '..';

describe('hydrateRecommendCache', () => {
  it('should hydrate the helper with the recommend cache', async () => {
    const searchClient = createSearchClient();
    const helper = algoliaSearchHelper(searchClient, '');

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

    helper.recommend();

    await wait(0);

    expect(searchClient.getRecommendations).not.toHaveBeenCalled();
  });

  it('should handle empty responses', async () => {
    const searchClient = createSearchClient();
    const helper = algoliaSearchHelper(searchClient, '');

    hydrateRecommendCache(helper, {
      a: {},
    });

    helper.addFrequentlyBoughtTogether({ $$id: 0, objectID: 'a' }).recommend();

    await wait(0);

    expect(searchClient.getRecommendations).toHaveBeenCalledTimes(1);
  });
});
