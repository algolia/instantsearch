import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useToggleRefinement } from '../useToggleRefinement';

describe('useToggleRefinement', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
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

    await waitForNextUpdate();

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
