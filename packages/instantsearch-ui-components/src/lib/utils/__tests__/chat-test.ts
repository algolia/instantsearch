import { getApplyFiltersParamsFromToolInput, getHitsByObjectID } from '../chat';

import type { ChatMessageBase, ChatToolMessage } from '../../../components';

describe('getApplyFiltersParamsFromToolInput', () => {
  test('returns nothing to refine when input is undefined', () => {
    expect(getApplyFiltersParamsFromToolInput(undefined)).toEqual({
      query: undefined,
      facetFilters: undefined,
    });
  });

  test('returns the query and the standard `facet_filters` array', () => {
    const facetFilters = [['brand:Apple'], ['type:book']];

    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_filters: facetFilters,
      })
    ).toEqual({ query: 'phone', facetFilters });
  });

  test('builds facet filters from MCP `facet_<attribute>` keys', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'book',
        clickAnalytics: true,
        facet_type: ['book'],
        facet_brand: [],
        facet_title: [],
        facet_author: [],
        facet_categories: [
          'Literature & Fiction',
          'Mystery, Thriller & Suspense',
          'Teen & Young Adult',
        ],
        facet__collections: [],
        facet_price: [],
        userIntent: 'irrelevant',
      })
    ).toEqual({
      query: 'book',
      facetFilters: [
        ['type:book'],
        [
          'categories:Literature & Fiction',
          'categories:Mystery, Thriller & Suspense',
          'categories:Teen & Young Adult',
        ],
      ],
    });
  });

  test('reads the query and the facets of the first entry of a `queries` input', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        queries: [
          {
            query: 'laptop',
            facet_free_shipping: null,
            facet_brand: null,
            facet_categories: ['Laptops'],
            'facet_hierarchicalCategories.lvl0': ['Computers & Tablets'],
            'facet_hierarchicalCategories.lvl1': [
              'Computers & Tablets > Laptops',
            ],
            'facet_hierarchicalCategories.lvl2': null,
            facet_price: null,
          },
          { query: 'ignored', facet_brand: ['Apple'] },
        ],
        clickAnalytics: true,
        originalQuery: 'give me some laptops',
      })
    ).toEqual({
      query: 'laptop',
      facetFilters: [
        ['categories:Laptops'],
        ['hierarchicalCategories.lvl0:Computers & Tablets'],
        ['hierarchicalCategories.lvl1:Computers & Tablets > Laptops'],
      ],
    });
  });

  test('returns nothing to refine when `queries` is empty', () => {
    expect(getApplyFiltersParamsFromToolInput({ queries: [] })).toEqual({
      query: undefined,
      facetFilters: undefined,
    });
  });

  test('preserves the attribute name including leading underscores', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: '',
        facet__collections: ['summer'],
      }).facetFilters
    ).toEqual([['_collections:summer']]);
  });

  test('ignores non-string and empty facet values', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: '',
        facet_brand: [],
        facet_type: [42, 'book', null],
      }).facetFilters
    ).toEqual([['type:book']]);
  });

  test('returns no facet filters when there are no refinements', () => {
    expect(
      getApplyFiltersParamsFromToolInput({
        query: 'phone',
        facet_brand: [],
        facet_type: [],
      }).facetFilters
    ).toBeUndefined();
  });
});

describe('getHitsByObjectID', () => {
  test('collects hits from a search tool output keyed by objectID', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [
                { objectID: '1', name: 'Runner' },
                { objectID: '2', name: 'Sneaker' },
              ],
            },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
      2: { objectID: '2', name: 'Sneaker' },
    });
  });

  test('supports the MCP server search tool name shim', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index_products',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('merges hits across several messages, last write wins per objectID', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-1',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-2',
            state: 'output-available',
            input: { query: 'running shoes' },
            output: {
              hits: [
                { objectID: '1', name: 'Runner Pro' },
                { objectID: '3', name: 'Trail' },
              ],
            },
          },
        ],
      },
    ];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner Pro' },
      3: { objectID: '3', name: 'Trail' },
    });
  });

  test('ignores non-search tools, pending states, and invalid hits', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          { type: 'text', text: 'Here you go' },
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display',
            state: 'output-available',
            input: {},
            output: { groups: [{ results: [{ objectID: '9' }] }] },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'streaming',
            state: 'input-available',
            input: { query: 'shoes' },
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [{ objectID: '1', name: 'Runner' }, { objectID: '' }, null],
            },
          },
        ],
      },
    ] as ChatMessageBase[];

    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('scopes collection to the owning tool part, ignoring later searches', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-1',
            state: 'output-available',
            input: { query: 'shoes' },
            output: {
              hits: [{ objectID: '1', name: 'Runner', __queryID: 'q1' }],
            },
          },
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display-1',
            state: 'output-available',
            input: {},
            output: { groups: [{ results: [{ objectID: '1' }] }] },
          },
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-2',
            state: 'output-available',
            input: { query: 'running shoes' },
            output: {
              hits: [{ objectID: '1', name: 'Runner Pro', __queryID: 'q2' }],
            },
          },
        ],
      },
    ] as ChatMessageBase[];

    // Scoped to the first turn: the later search (with `q2`) must not leak in.
    expect(
      getHitsByObjectID(messages, messages[0].parts[1] as ChatToolMessage)
    ).toEqual({
      1: { objectID: '1', name: 'Runner', __queryID: 'q1' },
    });

    // Without a boundary, last write across the whole conversation wins.
    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner Pro', __queryID: 'q2' },
    });
  });

  test('includes the search before the boundary in the same message', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display',
            state: 'output-available',
            input: {},
            output: { groups: [{ results: [{ objectID: '1' }] }] },
          },
        ],
      },
    ] as ChatMessageBase[];

    expect(
      getHitsByObjectID(messages, messages[0].parts[1] as ChatToolMessage)
    ).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('ignores searches after the boundary in the same message', () => {
    const messages: ChatMessageBase[] = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-before',
            state: 'output-available',
            input: { query: 'shoes' },
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
          {
            type: 'tool-algolia_display_results',
            toolCallId: 'display',
            state: 'output-available',
            input: {},
            output: {},
          },
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search-after',
            state: 'output-available',
            input: { query: 'future search' },
            output: { hits: [{ objectID: '1', name: 'Future Runner' }] },
          },
        ],
      },
    ] as ChatMessageBase[];

    expect(
      getHitsByObjectID(messages, messages[0].parts[1] as ChatToolMessage)
    ).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('fails closed when the boundary is not in the messages', () => {
    const boundary = {
      type: 'tool-algolia_display_results',
      toolCallId: 'missing-display',
      state: 'output-available',
      input: {},
      output: {},
    } as ChatToolMessage;
    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: {},
            output: { hits: [{ objectID: '1', name: 'Runner' }] },
          },
        ],
      },
    ] as ChatMessageBase[];

    expect(getHitsByObjectID(messages, boundary)).toEqual({});
  });

  test('returns an empty map when there are no search outputs', () => {
    const hits = getHitsByObjectID([]);

    expect(hits).toEqual({});
    expect(hits.constructor).toBeUndefined();
    expect(hits.__proto__).toBeUndefined();
  });

  test('stores prototype-named object IDs as own hydrated records', () => {
    const constructorHit = {
      objectID: 'constructor',
      name: 'Constructor record',
    };
    const protoHit = {
      objectID: '__proto__',
      name: 'Prototype record',
    };
    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [
          {
            type: 'tool-algolia_search_index',
            toolCallId: 'search',
            state: 'output-available',
            input: {},
            output: { hits: [constructorHit, protoHit] },
          },
        ],
      },
    ] as ChatMessageBase[];

    const hits = getHitsByObjectID(messages);

    expect(Object.prototype.hasOwnProperty.call(hits, 'constructor')).toBe(
      true
    );
    expect(Object.prototype.hasOwnProperty.call(hits, '__proto__')).toBe(true);
    expect(hits.constructor).toEqual(constructorHit);
    expect(hits.__proto__).toEqual(protoHit);
  });
});
