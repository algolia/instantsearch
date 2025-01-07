/**
 * @jest-environment jsdom
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useSearchBox } from '../useSearchBox';

describe('useSearchBox', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => useSearchBox(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      query: '',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        query: '',
        isSearchStalled: false,
        clear: expect.any(Function),
        refine: expect.any(Function),
      });
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
    const { result } = renderHook(() => useSearchBox(), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      query: 'testio',
      isSearchStalled: false,
      clear: expect.any(Function),
      refine: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        query: 'testio',
        isSearchStalled: false,
        clear: expect.any(Function),
        refine: expect.any(Function),
      });
    });
  });
});
