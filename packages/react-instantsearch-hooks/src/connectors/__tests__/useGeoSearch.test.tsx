import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useGeoSearch } from '../useGeoSearch';

describe('useGeoSearch', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useGeoSearch(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      clearMapRefinement: expect.any(Function),
      currentRefinement: expect.objectContaining({}),
      hasMapMoveSinceLastRefine: expect.any(Function),
      isRefinedWithMap: expect.any(Function),
      isRefineOnMapMove: expect.any(Function),
      items: [],
      position: expect.objectContaining({}),
      refine: expect.any(Function),
      sendEvent: expect.objectContaining({}),
      setMapMoveSinceLastRefine: expect.any(Function),
      toggleRefineOnMapMove: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      clearMapRefinement: expect.any(Function),
      currentRefinement: expect.objectContaining({}),
      hasMapMoveSinceLastRefine: expect.any(Function),
      isRefinedWithMap: expect.any(Function),
      isRefineOnMapMove: expect.any(Function),
      items: [],
      position: expect.objectContaining({}),
      refine: expect.any(Function),
      sendEvent: expect.objectContaining({}),
      setMapMoveSinceLastRefine: expect.any(Function),
      toggleRefineOnMapMove: expect.any(Function),
    });
  });
});
