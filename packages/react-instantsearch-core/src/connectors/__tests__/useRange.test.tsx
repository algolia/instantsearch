/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useRange } from '../useRange';

describe('useRange', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useRange({ attribute: 'attribute' }), {
      wrapper,
    });

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
      currentRefinement: { min: undefined, max: undefined },
    });

    await waitFor(() => {
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
        currentRefinement: { min: undefined, max: undefined },
      });
    });
  });
});
