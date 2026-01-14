/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createAutocompleteStorage } from '../createAutocompleteStorage';

describe('createAutocompleteStorage', () => {
  let effectCallback: (() => void) | null = null;
  const mockUseEffect = jest.fn((callback: () => void) => {
    effectCallback = callback;
    callback();
  });
  const mockUseMemo = jest.fn(<T>(factory: () => T) => factory());
  const mockUseState = jest.fn(<T>(initialState: T) => {
    let state = initialState;
    const setState = (newState: T) => {
      state = newState;
    };
    return [state, setState];
  });

  beforeEach(() => {
    mockUseEffect.mockClear();
    mockUseMemo.mockClear();
    mockUseState.mockClear();
    effectCallback = null;
    // Clear localStorage
    localStorage.clear();
  });

  it('filters out suggestions that match recent searches when suggestionsIndexName is provided', () => {
    const useStorage = createAutocompleteStorage({
      useEffect: mockUseEffect,
      useMemo: mockUseMemo,
      useState: mockUseState,
    });

    // Setup: Add some items to localStorage to simulate recent searches
    localStorage.setItem(
      'autocomplete-recent-searches',
      JSON.stringify(['laptop', 'phone'])
    );

    const indices = [
      {
        indexName: 'products',
        indexId: 'products',
        hits: [
          {
            objectID: '1',
            name: 'Product 1',
            query: 'tablet',
          },
          {
            objectID: '2',
            name: 'Product 2',
            query: 'laptop',
          },
          {
            objectID: '3',
            name: 'Product 3',
            query: 'phone',
          },
        ],
      },
      {
        indexName: 'suggestions',
        indexId: 'suggestions',
        hits: [
          {
            objectID: 's1',
            query: 'laptop',
          },
          {
            objectID: 's2',
            query: 'phone',
          },
          {
            objectID: 's3',
            query: 'tablet',
          },
        ],
      },
    ];

    const indicesConfig = [
      {
        indexName: 'products',
        getQuery: (item: any) => item.name,
      },
      {
        indexName: 'suggestions',
        getQuery: (item: any) => item.query,
      },
    ];

    const result = useStorage({
      showRecent: true,
      query: '',
      indices,
      indicesConfig,
      suggestionsIndexName: 'suggestions',
    });

    // The suggestions index should have duplicates filtered out
    const suggestionsIndex = result.indicesForPropGetters.find(
      (index) => index.indexName === 'suggestions'
    );

    // Should only contain 'tablet' since 'laptop' and 'phone' are in recent searches
    expect(suggestionsIndex?.hits).toHaveLength(1);
    expect(suggestionsIndex?.hits[0]).toMatchObject({
      objectID: 's3',
      query: 'tablet',
    });

    // The products index should remain unchanged
    const productsIndex = result.indicesForPropGetters.find(
      (index) => index.indexName === 'products'
    );
    expect(productsIndex?.hits).toHaveLength(3);

    // Recent searches should be added as a new index at the beginning
    const recentSearchesIndex = result.indicesForPropGetters[0];
    expect(recentSearchesIndex.indexName).toBe('recent-searches');
    expect(recentSearchesIndex.hits).toHaveLength(2);
    expect(recentSearchesIndex.hits[0]).toMatchObject({
      query: 'laptop',
      __indexName: 'recent-searches',
    });
    expect(recentSearchesIndex.hits[1]).toMatchObject({
      query: 'phone',
      __indexName: 'recent-searches',
    });
  });

  it('does not filter suggestions when suggestionsIndexName is not provided', () => {
    const useStorage = createAutocompleteStorage({
      useEffect: mockUseEffect,
      useMemo: mockUseMemo,
      useState: mockUseState,
    });

    // Setup: Add some items to localStorage to simulate recent searches
    localStorage.setItem(
      'autocomplete-recent-searches',
      JSON.stringify(['laptop', 'phone'])
    );

    const indices = [
      {
        indexName: 'suggestions',
        indexId: 'suggestions',
        hits: [
          {
            objectID: 's1',
            query: 'laptop',
          },
          {
            objectID: 's2',
            query: 'phone',
          },
          {
            objectID: 's3',
            query: 'tablet',
          },
        ],
      },
    ];

    const indicesConfig = [
      {
        indexName: 'suggestions',
        getQuery: (item: any) => item.query,
      },
    ];

    const result = useStorage({
      showRecent: true,
      query: '',
      indices,
      indicesConfig,
      // suggestionsIndexName is not provided
    });

    // All suggestions should remain when suggestionsIndexName is not provided
    const suggestionsIndex = result.indicesForPropGetters.find(
      (index) => index.indexName === 'suggestions'
    );

    expect(suggestionsIndex?.hits).toHaveLength(3);
  });

  it('does not filter suggestions when showRecent is false', () => {
    const useStorage = createAutocompleteStorage({
      useEffect: mockUseEffect,
      useMemo: mockUseMemo,
      useState: mockUseState,
    });

    const indices = [
      {
        indexName: 'suggestions',
        indexId: 'suggestions',
        hits: [
          {
            objectID: 's1',
            query: 'laptop',
          },
          {
            objectID: 's2',
            query: 'phone',
          },
        ],
      },
    ];

    const indicesConfig = [
      {
        indexName: 'suggestions',
        getQuery: (item: any) => item.query,
      },
    ];

    const result = useStorage({
      showRecent: false,
      query: '',
      indices,
      indicesConfig,
      suggestionsIndexName: 'suggestions',
    });

    // When showRecent is false, indices should not be modified
    expect(result.indicesForPropGetters).toEqual(indices);
    expect(result.storageHits).toEqual([]);
  });

  it('filters suggestions correctly when recent searches contain partial matches', () => {
    const useStorage = createAutocompleteStorage({
      useEffect: mockUseEffect,
      useMemo: mockUseMemo,
      useState: mockUseState,
    });

    // Setup: Add items to localStorage
    localStorage.setItem(
      'autocomplete-recent-searches',
      JSON.stringify(['laptop computer', 'smartphone'])
    );

    const indices = [
      {
        indexName: 'suggestions',
        indexId: 'suggestions',
        hits: [
          {
            objectID: 's1',
            query: 'laptop',
          },
          {
            objectID: 's2',
            query: 'laptop computer',
          },
          {
            objectID: 's3',
            query: 'smartphone',
          },
        ],
      },
    ];

    const indicesConfig = [
      {
        indexName: 'suggestions',
        getQuery: (item: any) => item.query,
      },
    ];

    const result = useStorage({
      showRecent: true,
      query: '',
      indices,
      indicesConfig,
      suggestionsIndexName: 'suggestions',
    });

    const suggestionsIndex = result.indicesForPropGetters.find(
      (index) => index.indexName === 'suggestions'
    );

    // Only 'laptop computer' and 'smartphone' should be filtered (exact matches)
    // 'laptop' should remain since it doesn't exactly match 'laptop computer'
    expect(suggestionsIndex?.hits).toHaveLength(1);
    expect(suggestionsIndex?.hits[0]).toMatchObject({
      objectID: 's1',
      query: 'laptop',
    });
  });
});
