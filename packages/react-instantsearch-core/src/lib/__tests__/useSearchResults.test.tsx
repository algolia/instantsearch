import {
  createMultiSearchResponse,
  createSearchClient,
} from '@instantsearch/mocks';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';
import { AlgoliaSearchHelper, SearchResults } from 'algoliasearch-helper';
import React from 'react';
import { Index, SearchBox } from 'react-instantsearch';

import { useSearchResults } from '../useSearchResults';

describe('useSearchResults', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchResults(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        wrapper({
          children: (
            <>
              <SearchBox />
              {children}
            </>
          ),
        }),
    });

    // Initial render
    expect(result.current).toEqual({
      results: expect.any(SearchResults),
      scopedResults: [
        expect.objectContaining({
          helper: expect.any(AlgoliaSearchHelper),
          indexId: 'indexName',
          results: expect.any(SearchResults),
        }),
      ],
    });
    expect(result.current.results.__isArtificial).toEqual(true);

    await waitForNextUpdate();

    // Update caused by <SearchBox>
    expect(result.current).toEqual({
      results: expect.any(SearchResults),
      scopedResults: [
        expect.objectContaining({
          helper: expect.any(AlgoliaSearchHelper),
          indexId: 'indexName',
          results: expect.any(SearchResults),
        }),
      ],
    });
    expect(result.current.results.__isArtificial).toBeUndefined();
  });

  test('returns scoped results', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchResults(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        wrapper({
          children: (
            <>
              <SearchBox />
              <Index indexName="indexName1"></Index>
              <Index indexName="indexName2"></Index>
              {children}
            </>
          ),
        }),
    });

    await waitForNextUpdate();

    expect(result.current.scopedResults).toHaveLength(3);
    expect(result.current.scopedResults.map(({ indexId }) => indexId)).toEqual([
      'indexName',
      'indexName1',
      'indexName2',
    ]);
  });

  test('returns scoped results when the main index has no indexName set', async () => {
    const wrapper = createInstantSearchTestWrapper({
      indexName: undefined,
    });
    const { result, waitForNextUpdate } = renderHook(() => useSearchResults(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        wrapper({
          children: (
            <>
              <SearchBox />
              <Index indexName="indexName1"></Index>
              <Index indexName="indexName2"></Index>
              {children}
            </>
          ),
        }),
    });

    await waitForNextUpdate();

    expect(result.current.scopedResults).toHaveLength(2);
    expect(result.current.scopedResults.map(({ indexId }) => indexId)).toEqual([
      'indexName1',
      'indexName2',
    ]);
  });

  test('does not return `null` results when the first search is stalled', async () => {
    const wrapper = createInstantSearchTestWrapper({
      stalledSearchDelay: 0,
      searchClient: createSearchClient({
        search: async () => {
          // Simulate a stalled search
          await new Promise((resolve) => setTimeout(resolve, 50));

          return createMultiSearchResponse();
        },
      }),
    });
    const { result, waitForNextUpdate } = renderHook(() => useSearchResults(), {
      wrapper: ({ children }: { children: React.ReactNode }) =>
        wrapper({
          children: (
            <>
              <SearchBox />
              {children}
            </>
          ),
        }),
    });

    await waitForNextUpdate();

    // Update caused by <SearchBox>
    expect(result.current.results).not.toBeNull();
  });
});
