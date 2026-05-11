/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createCompositionClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';

import { connectFeeds, connectSearchBox } from '../../connectors';
import instantsearch from '../../index.es';
import { getInitialResults, waitForResults } from '../server';
import { hydrateSearchClient } from 'instantsearch-core';

const compositionID = 'my-comp';

describe('composition multifeed SSR (integration)', () => {
  it('serializes multifeed, hydrates client cache, and restores feeds after JSON round-trip', async () => {
    const setCache = jest.fn();
    const getCache = jest.fn();
    const searchFn = jest.fn(() =>
      Promise.resolve({
        results: [
          createSingleSearchResponse({
            feedID: 'products',
            hits: [{ objectID: 'p1' }],
          } as any),
          createSingleSearchResponse({
            feedID: 'articles',
            hits: [{ objectID: 'a1' }],
          } as any),
        ],
      })
    );

    const searchClient = createCompositionClient({
      transporter: { responsesCache: { set: setCache, get: getCache } },
      addAlgoliaAgent: jest.fn(),
      search: searchFn,
    });

    const search = instantsearch({
      compositionID,
      searchClient,
    });
    search.addWidgets([
      connectSearchBox(() => {})({}),
      connectFeeds(() => {})({ isolated: false }),
    ]);
    search.start();

    await waitForResults(search);

    const initial = getInitialResults(search.mainIndex);
    const entry = initial[compositionID];

    expect(entry?.results).toHaveLength(1);
    expect(entry?.compositionFeedsResults).toHaveLength(2);
    expect(entry?.compositionFeedsResults?.[0]).toMatchObject({
      feedID: 'products',
    });

    hydrateSearchClient(searchClient, initial);

    expect(setCache).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        results: [
          expect.objectContaining({ feedID: 'products' }),
          expect.objectContaining({ feedID: 'articles' }),
        ],
      })
    );

    const roundTrip = JSON.parse(JSON.stringify(initial)) as typeof initial;

    const clientAfterJson = createCompositionClient({
      transporter: {
        responsesCache: { set: jest.fn(), get: jest.fn() },
      },
      addAlgoliaAgent: jest.fn(),
      search: jest.fn(),
    });

    const searchAfterJson = instantsearch({
      compositionID,
      searchClient: clientAfterJson,
    });
    searchAfterJson._initialResults = roundTrip;
    searchAfterJson.addWidgets([
      connectSearchBox(() => {})({}),
      connectFeeds(() => {})({ isolated: false }),
    ]);
    searchAfterJson.start();

    const feeds = searchAfterJson.mainIndex.getHelper()?.lastResults?.feeds;
    expect(feeds).toHaveLength(2);
    expect(feeds![0].hits[0]).toEqual(
      expect.objectContaining({ objectID: 'p1' })
    );
    expect(feeds![1].hits[0]).toEqual(
      expect.objectContaining({ objectID: 'a1' })
    );
  });
});
