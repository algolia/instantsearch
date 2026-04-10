/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createRecommendResponse,
  createSingleSearchResponse,
} from '@instantsearch/mocks/createAPIResponse';
import { createSearchClient } from '@instantsearch/mocks/createSearchClient';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useTrendingFacets } from '../useTrendingFacets';

function createTrendingFacetsSearchClient() {
  return createSearchClient({
    getRecommendations: jest.fn((requests) =>
      Promise.resolve(
        createRecommendResponse(
          requests.map(() =>
            createSingleSearchResponse({
              hits: [
                { facetName: 'brand', facetValue: 'Apple', _score: 95 },
                { facetName: 'brand', facetValue: 'Samsung', _score: 87 },
              ] as any,
            })
          )
        )
      )
    ),
  });
}

describe('useTrendingFacets', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createTrendingFacetsSearchClient(),
    });
    const { result } = renderHook(
      () => useTrendingFacets({ facetName: 'brand' }),
      { wrapper }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({ items: [] });

    await waitFor(() => {
      expect(result.current).toEqual({
        items: [
          { facetName: 'brand', facetValue: 'Apple', _score: 95 },
          { facetName: 'brand', facetValue: 'Samsung', _score: 87 },
        ],
      });
    });
  });
});
