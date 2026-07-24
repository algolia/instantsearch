import { getFacetFiltersFromToolInput, getHitsByObjectID } from '../chat';

import type { ChatMessageBase } from '../../../components';

describe('getFacetFiltersFromToolInput', () => {
  test('returns undefined when input is undefined', () => {
    expect(getFacetFiltersFromToolInput(undefined)).toBeUndefined();
  });

  test('returns the standard `facet_filters` array when present', () => {
    const facetFilters = [['brand:Apple'], ['type:book']];

    expect(
      getFacetFiltersFromToolInput({
        query: 'phone',
        facet_filters: facetFilters,
      })
    ).toBe(facetFilters);
  });

  test('builds facet filters from MCP `facet_<attribute>` keys', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
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
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([
      ['type:book'],
      [
        'categories:Literature & Fiction',
        'categories:Mystery, Thriller & Suspense',
        'categories:Teen & Young Adult',
      ],
    ]);
  });

  test('preserves the attribute name including leading underscores', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
        facet__collections: ['summer'],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([['_collections:summer']]);
  });

  test('ignores non-string and empty facet values', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: '',
        facet_brand: [],
        facet_type: [42, 'book', null] as unknown as string[],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
    ).toEqual([['type:book']]);
  });

  test('returns undefined when there are no facet refinements', () => {
    expect(
      getFacetFiltersFromToolInput({
        query: 'phone',
        facet_brand: [],
        facet_type: [],
      } as Parameters<typeof getFacetFiltersFromToolInput>[0])
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

  test('scopes collection to the turn containing `untilToolCallId`, ignoring later searches', () => {
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
    expect(getHitsByObjectID(messages, 'display-1')).toEqual({
      1: { objectID: '1', name: 'Runner', __queryID: 'q1' },
    });

    // Without a boundary, last write across the whole conversation wins.
    expect(getHitsByObjectID(messages)).toEqual({
      1: { objectID: '1', name: 'Runner Pro', __queryID: 'q2' },
    });
  });

  test('includes the search in the same message as `untilToolCallId`', () => {
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

    expect(getHitsByObjectID(messages, 'display')).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('ignores searches after `untilToolCallId` in the same message', () => {
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

    expect(getHitsByObjectID(messages, 'display')).toEqual({
      1: { objectID: '1', name: 'Runner' },
    });
  });

  test('returns an empty map when there are no search outputs', () => {
    expect(getHitsByObjectID([])).toEqual({});
  });
});
