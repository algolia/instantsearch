import {
  createControlledSearchClient,
  createSearchClient,
} from '@instantsearch/mocks';

import {
  connectConfigure,
  connectHierarchicalMenu,
  connectSearchBox,
} from '../../connectors';
import instantsearch from '../../index.es';
import { index } from '../../widgets';
import { getInitialResults, waitForResults } from '../server';

describe('waitForResults', () => {
  test('waits for the results from the search instance', async () => {
    const { searchClient, searches } = createControlledSearchClient();
    const search = instantsearch({
      indexName: 'indexName',
      searchClient,
      initialUiState: {
        indexName: {
          query: 'apple',
        },
      },
    }).addWidgets([
      index({ indexName: 'indexName2' }).addWidgets([
        connectConfigure(() => {})({ searchParameters: { hitsPerPage: 2 } }),
      ]),
      connectSearchBox(() => {})({}),
    ]);

    search.start();

    const output = waitForResults(search);

    searches[0].resolver();

    await expect(output).resolves.toEqual([
      expect.objectContaining({ query: 'apple' }),
      expect.objectContaining({ query: 'apple', hitsPerPage: 2 }),
    ]);
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

    expect(() =>
      getInitialResults(search.mainIndex)
    ).toThrowErrorMatchingInlineSnapshot(
      `"The root index does not have any results. Make sure you have at least one widget that provides results."`
    );
  });

  test('returns the current results from one index', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
    }).addWidgets([connectSearchBox(() => {})({})]);

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
          query: '',
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

  test('returns the current results from one non-rootindex', async () => {
    const search = instantsearch({
      searchClient: createSearchClient(),
    })
      .addWidgets([connectSearchBox(() => {})({})])
      .addWidgets([index({ indexName: 'indexName' })]);

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
    }).addWidgets([connectSearchBox(() => {})({})]);

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
          query: '',
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

  test('returns the current results with request params if specified', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          query: 'apple',
        },
        indexName2: {
          query: 'samsung',
        },
      },
    });

    search.addWidgets([
      connectSearchBox(() => {})({}),
      index({ indexName: 'indexName2' }).addWidgets([
        connectSearchBox(() => {})({}),
      ]),
      index({ indexName: 'indexName2', indexId: 'indexId' }).addWidgets([
        connectConfigure(() => {})({ searchParameters: { hitsPerPage: 2 } }),
      ]),
      index({ indexName: 'indexName2', indexId: 'indexId' }).addWidgets([
        connectConfigure(() => {})({ searchParameters: { hitsPerPage: 3 } }),
      ]),
    ]);

    search.start();

    const requestParams = await waitForResults(search);

    // Request params for the same index name + index id are not deduplicated,
    // so we should have data for 4 indices (main index + 3 index widgets)
    expect(requestParams).toHaveLength(4);
    expect(requestParams).toMatchInlineSnapshot(`
      [
        {
          "query": "apple",
        },
        {
          "query": "samsung",
        },
        {
          "hitsPerPage": 2,
          "query": "apple",
        },
        {
          "hitsPerPage": 3,
          "query": "apple",
        },
      ]
    `);

    // `getInitialResults()` generates a dictionary of initial results
    // keyed by index id, so indexName2/indexId should be deduplicated...
    expect(Object.entries(getInitialResults(search.mainIndex))).toHaveLength(3);

    // ...and only the latest duplicate params are in the returned results
    const expectedInitialResults = {
      indexName: expect.objectContaining({
        requestParams: expect.arrayContaining([
          expect.objectContaining({
            query: 'apple',
          }),
        ]),
      }),
      indexName2: expect.objectContaining({
        requestParams: expect.arrayContaining([
          expect.objectContaining({
            query: 'samsung',
          }),
        ]),
      }),
      indexId: expect.objectContaining({
        requestParams: expect.arrayContaining([
          expect.objectContaining({
            query: 'apple',
            hitsPerPage: 3,
          }),
        ]),
      }),
    };

    expect(getInitialResults(search.mainIndex, requestParams)).toEqual(
      expectedInitialResults
    );

    // Multiple calls to `getInitialResults()` with the same requestParams
    // return the same results
    expect(getInitialResults(search.mainIndex, requestParams)).toEqual(
      expectedInitialResults
    );
  });

  test('returns correct requestParams with nested hierarchical facets', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          hierarchicalMenu: {
            'hierarchicalCategories.lvl0': ['Appliances', 'Fans'],
          },
        },
      },
    });

    search.addWidgets([
      connectHierarchicalMenu(() => {})({
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
        ],
      }),
    ]);

    search.start();

    const requestParams = await waitForResults(search);

    expect(requestParams).toMatchInlineSnapshot(`
      [
        {
          "facetFilters": [
            [
              "hierarchicalCategories.lvl1:Appliances > Fans",
            ],
          ],
          "facets": [
            "hierarchicalCategories.lvl0",
            "hierarchicalCategories.lvl1",
          ],
          "maxValuesPerFacet": 10,
        },
        {
          "analytics": false,
          "clickAnalytics": false,
          "facetFilters": [
            [
              "hierarchicalCategories.lvl0:Appliances",
            ],
          ],
          "facets": [
            "hierarchicalCategories.lvl0",
            "hierarchicalCategories.lvl1",
          ],
          "hitsPerPage": 0,
          "maxValuesPerFacet": 10,
          "page": 0,
        },
        {
          "analytics": false,
          "clickAnalytics": false,
          "facets": [
            "hierarchicalCategories.lvl0",
          ],
          "hitsPerPage": 0,
          "maxValuesPerFacet": 10,
          "page": 0,
        },
      ]
    `);
  });

  test('injects clickAnalytics and userToken into the state', async () => {
    const search = instantsearch({
      indexName: 'indexName',
      searchClient: createSearchClient(),
      initialUiState: {
        indexName: {
          query: 'apple',
        },
      },
      insights: true,
    });

    search.addWidgets([connectSearchBox(() => {})({})]);

    search.start();

    const requestParams = await waitForResults(search);

    expect(requestParams).toEqual([
      {
        clickAnalytics: true,
        query: 'apple',
        userToken: expect.stringMatching(/^anonymous-/),
      },
    ]);

    expect(getInitialResults(search.mainIndex)).toEqual({
      indexName: {
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
          query: 'apple',
          tagRefinements: [],
          clickAnalytics: true,
          userToken: expect.stringMatching(/^anonymous-/),
        },
      },
    });
  });
});
