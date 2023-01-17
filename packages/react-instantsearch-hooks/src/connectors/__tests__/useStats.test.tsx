import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useStats } from '../useStats';

describe('useStats', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useStats(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      areHitsSorted: false,
      hitsPerPage: 20,
      nbHits: 0,
      nbPages: 0,
      nbSortedHits: undefined,
      page: 0,
      processingTimeMS: 0,
      query: '',
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      areHitsSorted: false,
      hitsPerPage: 20,
      nbHits: 0,
      nbPages: 0,
      nbSortedHits: undefined,
      page: 0,
      processingTimeMS: 0,
      query: '',
    });
  });
});
