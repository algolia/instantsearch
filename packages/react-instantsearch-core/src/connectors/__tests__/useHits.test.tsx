import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useHits } from '../useHits';

describe('useHits', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useHits(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      banner: undefined,
      hits: [],
      items: [],
      results: expect.objectContaining({ nbHits: 0 }),
      sendEvent: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      banner: undefined,
      hits: [],
      items: [],
      results: expect.objectContaining({ nbHits: 0 }),
      sendEvent: expect.any(Function),
    });
  });
});
