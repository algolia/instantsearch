import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useConfigure } from '../useConfigure';

describe('useConfigure', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(
      () => useConfigure({ hitsPerPage: 40 }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      refine: expect.any(Function),
    });
  });
});
