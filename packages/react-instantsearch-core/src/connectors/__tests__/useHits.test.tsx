/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useHits } from '../useHits';

describe('useHits', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useHits(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      banner: undefined,
      bindEvent: expect.any(Function),
      hits: [],
      items: [],
      results: expect.objectContaining({ nbHits: 0 }),
      sendEvent: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        banner: undefined,
        bindEvent: expect.any(Function),
        hits: [],
        items: [],
        results: expect.objectContaining({ nbHits: 0 }),
        sendEvent: expect.any(Function),
      });
    });
  });
});
