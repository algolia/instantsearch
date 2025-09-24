/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useToggleRefinement } from '../useToggleRefinement';

describe('useToggleRefinement', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(
      () => useToggleRefinement({ attribute: 'test' }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      createURL: expect.any(Function),
      refine: expect.any(Function),
      sendEvent: expect.any(Function),
      value: {
        count: null,
        isRefined: false,
        name: 'test',
        offFacetValue: {
          count: 0,
          isRefined: false,
        },
        onFacetValue: {
          count: null,
          isRefined: false,
        },
      },
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        value: {
          count: null,
          isRefined: false,
          name: 'test',
          offFacetValue: {
            count: 0,
            isRefined: false,
          },
          onFacetValue: {
            count: null,
            isRefined: false,
          },
        },
      });
    });
  });
});
