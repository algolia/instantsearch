import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useRange } from '../useRange';

describe('useRange', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () => useRange({ attribute: 'attribute' }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      format: {
        from: expect.any(Function),
        to: expect.any(Function),
      },
      range: {
        max: 0,
        min: 0,
      },
      refine: expect.any(Function),
      sendEvent: expect.any(Function),
      start: [-Infinity, Infinity],
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      canRefine: false,
      format: {
        from: expect.any(Function),
        to: expect.any(Function),
      },
      range: {
        max: 0,
        min: 0,
      },
      refine: expect.any(Function),
      sendEvent: expect.any(Function),
      start: [-Infinity, Infinity],
    });
  });
});
