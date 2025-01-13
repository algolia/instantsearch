/**
 * @jest-environment jsdom
 */

import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useRefinementList } from '../useRefinementList';

describe('useRefinementList', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper();
    const { result } = renderHook(
      () => useRefinementList({ attribute: 'attribute' }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({
      canRefine: false,
      canToggleShowMore: false,
      createURL: expect.any(Function),
      hasExhaustiveItems: true,
      isFromSearch: false,
      isShowingMore: false,
      items: [],
      refine: expect.any(Function),
      searchForItems: expect.any(Function),
      sendEvent: expect.any(Function),
      toggleShowMore: expect.any(Function),
    });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        canRefine: false,
        canToggleShowMore: false,
        createURL: expect.any(Function),
        hasExhaustiveItems: true,
        isFromSearch: false,
        isShowingMore: false,
        items: [],
        refine: expect.any(Function),
        searchForItems: expect.any(Function),
        sendEvent: expect.any(Function),
        toggleShowMore: expect.any(Function),
      });
    });
  });
});
