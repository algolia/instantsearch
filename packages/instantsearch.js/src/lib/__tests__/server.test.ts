import {
  createControlledSearchClient,
  createSearchClient,
} from '@instantsearch/mocks';

import { connectSearchBox } from '../../connectors';
import instantsearch from '../../index.es';
import { index } from '../../widgets';
import { getInitialResults, waitForResults } from '../server';

describe('waitForResults', () => {
  test('waits for the results from the search instance', async () => {
    const { searchClient, searches } = createControlledSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    }).addWidgets([
      index({ indexName: 'indexName2' }),
      connectSearchBox(() => {})({}),
    ]);

    search.start();

    const output = waitForResults(search);

    searches[0].resolver();

    await expect(output).resolves.toBeUndefined();
  });

  test('throws on a search client error', async () => {
    const { searchClient, searches } = createControlledSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
    }).addWidgets([
      index({ indexName: 'indexName2' }),
      connectSearchBox(() => {})({}),
    ]);

    search.start();

    const output = waitForResults(search);

    searches[0].rejecter({ message: 'Search error' });

    await expect(output).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Search error"`
    );
  });

  test('throws on an InstantSearch error', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    }).addWidgets([
      index({ indexName: 'indexName2' }),
      connectSearchBox(() => {})({}),
    ]);

    search.start();

    const output = waitForResults(search);

    search.on('error', () => {});
    search.emit('error', new Error('Search error'));

    await expect(output).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Search error"`
    );
  });
});

describe('getInitialResults', () => {
  test('errors if results are not available', () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    expect(() => getInitialResults(search.mainIndex)).toThrow();
  });

  test('returns the current results from one index', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.start();

    await waitForResults(search);

    expect(getInitialResults(search.mainIndex)).toEqual({
      indexName: {
        state: {
          disjunctiveFacets: [],
          disjunctiveFacetsRefinements: {},
          facets: [],
          facetsExcludes: {},
          facetsRefinements: {},
          hierarchicalFacets: [],
          hierarchicalFacetsRefinements: {},
          index: 'indexName',
          numericRefinements: {},
          tagRefinements: [],
        },
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [],
            hitsPerPage: 20,
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    });
  });

  test('returns the current results from multiple indices', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    });

    search.addWidgets([index({ indexName: 'indexName2' })]);

    search.start();

    await waitForResults(search);

    expect(getInitialResults(search.mainIndex)).toEqual({
      indexName: {
        state: {
          disjunctiveFacets: [],
          disjunctiveFacetsRefinements: {},
          facets: [],
          facetsExcludes: {},
          facetsRefinements: {},
          hierarchicalFacets: [],
          hierarchicalFacetsRefinements: {},
          index: 'indexName',
          numericRefinements: {},
          tagRefinements: [],
        },
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [],
            hitsPerPage: 20,
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
      indexName2: {
        state: {
          disjunctiveFacets: [],
          disjunctiveFacetsRefinements: {},
          facets: [],
          facetsExcludes: {},
          facetsRefinements: {},
          hierarchicalFacets: [],
          hierarchicalFacetsRefinements: {},
          index: 'indexName2',
          numericRefinements: {},
          tagRefinements: [],
        },
        results: [
          {
            exhaustiveFacetsCount: true,
            exhaustiveNbHits: true,
            hits: [],
            hitsPerPage: 20,
            nbHits: 0,
            nbPages: 0,
            page: 0,
            params: '',
            processingTimeMS: 0,
            query: '',
          },
        ],
      },
    });
  });
});
