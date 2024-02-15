import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useInfiniteHits } from '../useInfiniteHits';

describe('useInfiniteHits', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useInfiniteHits(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      bindEvent: undefined,
      hits: [],
      results: expect.objectContaining({ nbHits: 0 }),
      sendEvent: undefined,
      currentPageHits: [],
      isFirstPage: true,
      isLastPage: true,
      showMore: undefined,
      showPrevious: undefined,
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      bindEvent: expect.any(Function),
      hits: [],
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
