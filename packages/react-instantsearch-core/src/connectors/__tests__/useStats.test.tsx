/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useStats } from '../useStats';

describe('useStats', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useStats(), {
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

    await waitFor(() => {
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
});
