/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useGeoSearch } from '../useGeoSearch';

describe('useGeoSearch', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useGeoSearch(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      clearMapRefinement: expect.any(Function),
      currentRefinement: undefined,
      hasMapMoveSinceLastRefine: expect.any(Function),
      isRefinedWithMap: expect.any(Function),
      isRefineOnMapMove: expect.any(Function),
      items: [],
      position: undefined,
      refine: expect.any(Function),
      sendEvent: expect.any(Function),
      setMapMoveSinceLastRefine: expect.any(Function),
      toggleRefineOnMapMove: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        clearMapRefinement: expect.any(Function),
        currentRefinement: undefined,
        hasMapMoveSinceLastRefine: expect.any(Function),
        isRefinedWithMap: expect.any(Function),
        isRefineOnMapMove: expect.any(Function),
        items: [],
        position: undefined,
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        setMapMoveSinceLastRefine: expect.any(Function),
        toggleRefineOnMapMove: expect.any(Function),
      });
    });
  });
});
