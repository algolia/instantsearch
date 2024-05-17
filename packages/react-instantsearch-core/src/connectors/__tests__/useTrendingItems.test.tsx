import { createRecommendSearchClient } from '@instantsearch/mocks/fixtures';
import { createInstantSearchTestWrapper } from '@instantsearch/testutils';
import { renderHook } from '@testing-library/react-hooks';

import { useTrendingItems } from '../useTrendingItems';

describe('useTrendingItems', () => {
  test('returns the connector render state', async () => {
    const wrapper = createInstantSearchTestWrapper({
      searchClient: createRecommendSearchClient({ minimal: true }),
    });
    const { result, waitForNextUpdate } = renderHook(
      () => useTrendingItems({}),
      {
        wrapper,
      }
    );

    // Initial render state from manual `getWidgetRenderState`
    expect(result.current).toEqual({ items: [] });

    await waitForNextUpdate();

    // InstantSearch.js state from the `render` lifecycle step
    expect(result.current).toEqual({
      items: expect.arrayContaining([{ objectID: '1' }, { objectID: '2' }]),
    });
  });
});
