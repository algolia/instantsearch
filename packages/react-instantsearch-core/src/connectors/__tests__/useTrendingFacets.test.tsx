/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useTrendingFacets } from '../useTrendingFacets';

describe('useTrendingFacets', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createRecommendSearchClient({
        fixture: [
          { facetName: 'attr1', facetValue: 'val1' },
          { facetName: 'attr2', facetValue: 'val2' },
        ],
      }),
    });
    const { result } = renderHook(
      () => useTrendingFacets({ attribute: 'one' }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        items: expect.arrayContaining([
          {
            __position: 1,
            _score: undefined,
            attribute: 'attr1',
            objectID: 'attr1:val1',
            value: 'val1',
          },
          {
            __position: 2,
            _score: undefined,
            attribute: 'attr2',
            objectID: 'attr2:val2',
            value: 'val2',
          },
        ]),
      });
    });
  });
});
