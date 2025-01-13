/**
 * @jest-environment jsdom
 */

import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook, waitFor } from '@testing-library/react';

import { useRelatedProducts } from '../useRelatedProducts';

describe('useRelatedProducts', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createRecommendSearchClient({ minimal: true }),
    });
    const { result } = renderHook(
      () => useRelatedProducts({ objectIDs: ['1'] }),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({ items: [] });

    await waitFor(() => {
      // InstantSearch.js state from the `render` lifecycle step
      expect(result.current).toEqual({
        items: expect.arrayContaining([{ objectID: '1' }, { objectID: '2' }]),
      });
    });
  });
});
