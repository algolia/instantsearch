/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useTrendingItems } from '../useTrendingItems';

describe('useTrendingItems', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createRecommendSearchClient({ minimal: true }),
    });
    const { result } = renderHook(() => useTrendingItems({}), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
      sendEvent: expect.any(Function),
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        items: expect.arrayContaining([
          { __position: 1, objectID: '1' },
          { __position: 2, objectID: '2' },
        ]),
      });
    });
  });
});
