import { renderHook } from '@testing-library/react-hooks';

import { createInstantSearchTestWrapper } from '../../../../test/utils';
import { useSearchBox } from '../useSearchBox';

describe('useSearchBox', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result, waitForNextUpdate } = renderHook(() => useSearchBox(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      query: '',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      query: '',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });
  });
});
