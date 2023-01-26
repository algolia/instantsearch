import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

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

  test('returns the connector render state with initialUiState', async () => {
    const wrapper = createInstantSearchTestWrapper({
      initialUiState: {
        indexName: {
          query: 'testio',
        },
      },
    });
    const { result, waitForNextUpdate } = renderHook(() => useSearchBox(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      query: 'testio',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      query: 'testio',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });
  });
});
