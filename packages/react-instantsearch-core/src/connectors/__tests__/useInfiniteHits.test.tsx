/**
 * @jest-environment jsdom
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useInfiniteHits } from '../useInfiniteHits';

describe('useInfiniteHits', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useInfiniteHits(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      items: [],
      results: expect.objectContaining({ nbHits: 0 }),
      sendEvent: undefined,
      currentPageHits: [],
      isFirstPage: true,
      isLastPage: true,
      showMore: undefined,
      showPrevious: undefined,
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        items: [],
        results: expect.objectContaining({ nbHits: 0 }),
        sendEvent: expect.any(Function),
        currentPageHits: [],
        isFirstPage: true,
        isLastPage: true,
        showMore: expect.any(Function),
        showPrevious: expect.any(Function),
      });
    });
  });
});
