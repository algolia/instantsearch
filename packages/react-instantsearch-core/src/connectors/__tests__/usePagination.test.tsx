/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { usePagination } from '../usePagination';

describe('usePagination', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(() => usePagination({ padding: 2 }), {
      wrapper,
    });

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      createURL: expect.any(Function),
      currentRefinement: 0,
      isFirstPage: true,
      isLastPage: true,
      nbHits: 0,
      nbPages: 0,
      pages: [0],
      refine: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        canRefine: false,
        createURL: expect.any(Function),
        currentRefinement: 0,
        isFirstPage: true,
        isLastPage: true,
        nbHits: 0,
        nbPages: 0,
        pages: [0],
        refine: expect.any(Function),
      });
    });
  });
});
